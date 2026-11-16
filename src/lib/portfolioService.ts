import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_EDUCATION,
  DEFAULT_EXPERIENCES,
  DEFAULT_PORTFOLIO_BUNDLE,
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  DEFAULT_RESUME_META,
  DEFAULT_SKILLS,
  DEFAULT_CERTIFICATIONS,
} from '../data/defaultPortfolio';
import { auth, db, handleFirestoreError, isFirebaseConfigured, storage } from './firebase';
import type {
  AchievementItem,
  CertificationItem,
  ContactMessage,
  EducationItem,
  ExperienceItem,
  PortfolioDataBundle,
  PortfolioProfile,
  ProjectItem,
  ResumeMeta,
  SkillItem,
} from '../types/portfolio';

export function subscribeToPortfolioData(
  onData: (bundle: PortfolioDataBundle, source: 'firestore' | 'local-preview') => void,
  onError?: (err: Error) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    onData(DEFAULT_PORTFOLIO_BUNDLE, 'local-preview');
    return () => {};
  }

  const state: PortfolioDataBundle = {
    profile: { ...DEFAULT_PROFILE },
    projects: [...DEFAULT_PROJECTS],
    skills: [...DEFAULT_SKILLS],
    experiences: [...DEFAULT_EXPERIENCES],
    education: [...DEFAULT_EDUCATION],
    certifications: [...DEFAULT_CERTIFICATIONS],
    achievements: [...DEFAULT_ACHIEVEMENTS],
    resumeMeta: { ...DEFAULT_RESUME_META },
  };

  let loadedCount = 0;
  const emit = () => {
    loadedCount += 1;
    onData(
      {
        profile: { ...state.profile },
        projects: [...state.projects],
        skills: [...state.skills],
        experiences: [...state.experiences],
        education: [...state.education],
        certifications: [...state.certifications],
        achievements: [...state.achievements],
        resumeMeta: { ...state.resumeMeta },
      },
      'firestore',
    );
  };

  const unsubs: Array<() => void> = [];

  unsubs.push(
    onSnapshot(
      doc(db, 'portfolio_profile', 'main'),
      (snap) => {
        if (snap.exists()) {
          const remote = snap.data() as Partial<PortfolioProfile>;
          state.profile = {
            ...DEFAULT_PROFILE,
            ...remote,
            githubUrl: remote.githubUrl?.trim() ? remote.githubUrl : DEFAULT_PROFILE.githubUrl,
            linkedinUrl: remote.linkedinUrl?.trim() ? remote.linkedinUrl : DEFAULT_PROFILE.linkedinUrl,
            githubUsername: remote.githubUsername?.trim()
              ? remote.githubUsername
              : DEFAULT_PROFILE.githubUsername,
          };
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      },
    ),
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'projects'), orderBy('sortOrder', 'asc')),
      (snap) => {
        if (!snap.empty) {
          state.projects = snap.docs.map((d) => ({ ...(d.data() as Omit<ProjectItem, 'id'>), id: d.id }));
        } else if (loadedCount > 0) {
          state.projects = [...DEFAULT_PROJECTS];
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      },
    ),
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'skills'), orderBy('sortOrder', 'asc')),
      (snap) => {
        if (!snap.empty) {
          state.skills = snap.docs.map((d) => ({ ...(d.data() as Omit<SkillItem, 'id'>), id: d.id }));
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      },
    ),
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'experiences'), orderBy('sortOrder', 'asc')),
      (snap) => {
        if (!snap.empty) {
          state.experiences = snap.docs.map((d) => ({ ...(d.data() as Omit<ExperienceItem, 'id'>), id: d.id }));
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      },
    ),
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'education'), orderBy('sortOrder', 'asc')),
      (snap) => {
        if (!snap.empty) {
          state.education = snap.docs.map((d) => ({ ...(d.data() as Omit<EducationItem, 'id'>), id: d.id }));
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      },
    ),
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'certifications'), orderBy('sortOrder', 'asc')),
      (snap) => {
        if (!snap.empty) {
          state.certifications = snap.docs.map((d) => ({
            ...(d.data() as Omit<CertificationItem, 'id'>),
            id: d.id,
          }));
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      },
    ),
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'achievements'), orderBy('sortOrder', 'asc')),
      (snap) => {
        if (!snap.empty) {
          state.achievements = snap.docs.map((d) => ({ ...(d.data() as Omit<AchievementItem, 'id'>), id: d.id }));
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      },
    ),
  );

  unsubs.push(
    onSnapshot(
      doc(db, 'resume_meta', 'main'),
      (snap) => {
        if (snap.exists()) {
          state.resumeMeta = { ...DEFAULT_RESUME_META, ...(snap.data() as Partial<ResumeMeta>) };
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      },
    ),
  );

  return () => {
    unsubs.forEach((u) => u());
  };
}

export function subscribeToContactMessages(
  onMessages: (messages: ContactMessage[]) => void,
  onError?: (err: Error) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    onMessages([]);
    return () => {};
  }

  return onSnapshot(
    query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')),
    (snap) => {
      const items = snap.docs.map((d) => ({
        ...(d.data() as Omit<ContactMessage, 'id'>),
        id: d.id,
      }));
      onMessages(items);
    },
    (err) => {
      if (onError) onError(err);
      else handleFirestoreError(err, 'list', 'contact_messages');
    },
  );
}

export async function seedDefaultPortfolioToFirestore(forceOverwrite = false): Promise<{ seeded: boolean }> {
  if (!db) throw new Error('Firestore is not configured.');

  try {
    if (!forceOverwrite) {
      const existingProfile = await getDocs(collection(db, 'portfolio_profile'));
      if (!existingProfile.empty) {
        return { seeded: false };
      }
    }

    const batch = writeBatch(db);
    const { updatedAt: _u, ...profileFields } = DEFAULT_PROFILE;
    batch.set(doc(db, 'portfolio_profile', 'main'), {
      ...profileFields,
      updatedAt: serverTimestamp(),
    });

    for (const p of DEFAULT_PROJECTS) {
      const { id, updatedAt: _pu, ...rest } = p;
      batch.set(doc(db, 'projects', id), { ...rest, updatedAt: serverTimestamp() });
    }
    for (const s of DEFAULT_SKILLS) {
      const { id, updatedAt: _su, ...rest } = s;
      batch.set(doc(db, 'skills', id), { ...rest, updatedAt: serverTimestamp() });
    }
    for (const e of DEFAULT_EXPERIENCES) {
      const { id, updatedAt: _eu, ...rest } = e;
      batch.set(doc(db, 'experiences', id), { ...rest, updatedAt: serverTimestamp() });
    }
    for (const ed of DEFAULT_EDUCATION) {
      const { id, updatedAt: _edu, ...rest } = ed;
      batch.set(doc(db, 'education', id), { ...rest, updatedAt: serverTimestamp() });
    }
    for (const c of DEFAULT_CERTIFICATIONS) {
      const { id, updatedAt: _cu, ...rest } = c;
      batch.set(doc(db, 'certifications', id), { ...rest, updatedAt: serverTimestamp() });
    }
    for (const a of DEFAULT_ACHIEVEMENTS) {
      const { id, updatedAt: _au, ...rest } = a;
      batch.set(doc(db, 'achievements', id), { ...rest, updatedAt: serverTimestamp() });
    }
    const { updatedAt: _ru, ...resumeRest } = DEFAULT_RESUME_META;
    batch.set(doc(db, 'resume_meta', 'main'), {
      ...resumeRest,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return { seeded: true };
  } catch (err) {
    handleFirestoreError(err, 'write', 'portfolio_seed');
  }
}

export async function saveProfile(profile: PortfolioProfile): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    const { updatedAt: _u, ...rest } = profile;
    await setDoc(doc(db, 'portfolio_profile', 'main'), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'write', 'portfolio_profile/main');
  }
}

export async function saveProject(project: ProjectItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    const { id, updatedAt: _u, ...rest } = project;
    await setDoc(doc(db, 'projects', id), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'write', `projects/${project.id}`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `projects/${id}`);
  }
}

export async function saveSkill(skill: SkillItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    const { id, updatedAt: _u, ...rest } = skill;
    await setDoc(doc(db, 'skills', id), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'write', `skills/${skill.id}`);
  }
}

export async function deleteSkill(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await deleteDoc(doc(db, 'skills', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `skills/${id}`);
  }
}

export async function saveExperience(exp: ExperienceItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    const { id, updatedAt: _u, ...rest } = exp;
    await setDoc(doc(db, 'experiences', id), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'write', `experiences/${exp.id}`);
  }
}

export async function deleteExperience(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await deleteDoc(doc(db, 'experiences', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `experiences/${id}`);
  }
}

export async function saveEducation(edu: EducationItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    const { id, updatedAt: _u, ...rest } = edu;
    await setDoc(doc(db, 'education', id), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'write', `education/${edu.id}`);
  }
}

export async function deleteEducation(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await deleteDoc(doc(db, 'education', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `education/${id}`);
  }
}

export async function saveCertification(cert: CertificationItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    const { id, updatedAt: _u, ...rest } = cert;
    await setDoc(doc(db, 'certifications', id), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'write', `certifications/${cert.id}`);
  }
}

export async function deleteCertification(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await deleteDoc(doc(db, 'certifications', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `certifications/${id}`);
  }
}

export async function saveAchievement(ach: AchievementItem): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    const { id, updatedAt: _u, ...rest } = ach;
    await setDoc(doc(db, 'achievements', id), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'write', `achievements/${ach.id}`);
  }
}

export async function deleteAchievement(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await deleteDoc(doc(db, 'achievements', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `achievements/${id}`);
  }
}

export async function saveResumeMeta(meta: ResumeMeta): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    const { updatedAt: _u, ...rest } = meta;
    await setDoc(doc(db, 'resume_meta', 'main'), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, 'write', 'resume_meta/main');
  }
}

export async function submitContactInquiry(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{
  savedToFirestore: boolean;
  emailSent: boolean;
  smtpConfigured: boolean;
  serverMessage: string;
  serverError?: string;
}> {
  const apiRes = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const apiJson = (await apiRes.json()) as {
    validated?: boolean;
    emailSent?: boolean;
    smtpConfigured?: boolean;
    message?: string;
    error?: string;
  };

  if (!apiRes.ok && apiRes.status === 400) {
    throw new Error(apiJson.error || 'Please check your contact form inputs.');
  }

  let savedToFirestore = false;
  if (isFirebaseConfigured && db) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      await setDoc(doc(db, 'contact_messages', messageId), {
        name: payload.name.trim(),
        email: payload.email.trim(),
        subject: payload.subject.trim(),
        message: payload.message.trim(),
        status: 'unread',
        createdAt: serverTimestamp(),
      });
      savedToFirestore = true;
    } catch (err) {
      handleFirestoreError(err, 'create', `contact_messages/${messageId}`);
    }
  }

  return {
    savedToFirestore,
    emailSent: Boolean(apiJson.emailSent),
    smtpConfigured: Boolean(apiJson.smtpConfigured),
    serverMessage: apiJson.message || '',
    serverError: !apiRes.ok ? apiJson.error || 'Email forwarding failed.' : undefined,
  };
}

export async function updateContactMessageStatus(
  id: string,
  status: 'unread' | 'read' | 'replied',
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await updateDoc(doc(db, 'contact_messages', id), { status });
  } catch (err) {
    handleFirestoreError(err, 'update', `contact_messages/${id}`);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await deleteDoc(doc(db, 'contact_messages', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `contact_messages/${id}`);
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadPortfolioAsset(
  file: File,
  folder: 'avatars' | 'projects' | 'certificates' | 'resume',
): Promise<{ url: string; fileName: string; storageProvider: 'firebase-storage' | 'server-uploads' }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  // 1. Attempt Firebase Storage if configured
  if (storage) {
    try {
      const storageRef = ref(storage, `portfolio/${folder}/${Date.now()}_${safeName}`);
      await uploadBytes(storageRef, file, { contentType: file.type || 'application/octet-stream' });
      const url = await getDownloadURL(storageRef);
      return { url, fileName: safeName, storageProvider: 'firebase-storage' };
    } catch (storageErr) {
      console.warn('Firebase Storage unavailable or blocked; falling back to verified server upload.', storageErr);
    }
  }

  // 2. Fallback to authenticated Express server upload endpoint
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to upload files.');
  }
  const idToken = await currentUser.getIdToken();
  const base64Data = await readFileAsBase64(file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      fileName: safeName,
      mimeType: file.type || 'application/octet-stream',
      base64Data,
      folder,
    }),
  });

  const data = (await response.json()) as { url?: string; fileName?: string; error?: string };
  if (!response.ok || !data.url) {
    throw new Error(data.error || 'File upload failed.');
  }

  return {
    url: data.url,
    fileName: data.fileName || safeName,
    storageProvider: 'server-uploads',
  };
}
