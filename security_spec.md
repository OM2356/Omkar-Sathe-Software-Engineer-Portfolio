# Portfolio Security Specification

## 1. Data Invariants
1. All public portfolio content (`portfolio_profile`, `projects`, `skills`, `experiences`, `education`, `certifications`, `achievements`, `resume_meta`) is world-readable for recruiters and visitors, and strictly writable only by verified admin (`omkarsathe3103@gmail.com` or an entry in `/admins/{uid}` with `email_verified == true`).
2. `contact_messages` contains visitor PII (`email`, `name`, `message`). Public `get`, `list`, `update`, and `delete` are strictly forbidden. Only verified admins may read, update status (`unread` -> `read` | `replied`), or delete messages.
3. Public `create` on `contact_messages` enforces strict key allowlists (`hasAll` & `hasOnly`), string length bounds, valid email format, `status == 'unread'`, and server timestamp (`createdAt == request.time`).
4. All document IDs across single-document rules enforce `isValidId(id)` (`^[a-zA-Z0-9_\-]+$` and `size() <= 128`) to prevent ID poisoning.
5. `admins` records cannot be self-created or escalated by non-admin users.

## 2. The "Dirty Dozen" Attack Payloads (Must Return PERMISSION_DENIED)
1. Unauthenticated `create`/`update`/`delete` on `/projects/buddy-elder-ai`.
2. Authenticated non-admin user attempting `update` on `/portfolio_profile/main`.
3. Spoofed admin email with `email_verified == false` attempting `create` on `/skills/rust`.
4. Unauthenticated or non-admin `list` or `get` on `/contact_messages` (PII exfiltration).
5. Visitor submitting `/contact_messages/msg1` with `status: "replied"` (state shortcutting).
6. Visitor submitting `/contact_messages/msg1` with extra ghost field `isAdmin: true` (shadow update).
7. Visitor submitting `/contact_messages/msg1` with client-forged `createdAt` timestamp instead of `request.time`.
8. Visitor submitting `/contact_messages/msg1` with 1MB `message` payload (resource exhaustion).
9. Non-admin user creating `/admins/{uid}` to escalate privileges.
10. Admin update on `/projects/p1` with `technologies` array exceeding 20 items or non-string first element.
11. Unauthenticated `update` on `/contact_messages/msg1` to change `status`.
12. Document ID poisoning (`../../../etc/passwd` or 1KB string ID) on single-document writes.
