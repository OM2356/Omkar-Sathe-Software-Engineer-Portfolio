import { useMemo, useState } from 'react';
import { SKILL_CATEGORIES } from '../data/defaultPortfolio';
import type { SkillCategory, SkillItem } from '../types/portfolio';

interface SkillsVisualizationProps {
  skills: SkillItem[];
}

export function SkillsVisualization({ skills }: SkillsVisualizationProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | SkillCategory>('All');

  const categoryCounts = useMemo(() => {
    const map = new Map<SkillCategory, number>();
    SKILL_CATEGORIES.forEach((cat) => map.set(cat, 0));
    skills.forEach((s) => {
      map.set(s.category, (map.get(s.category) || 0) + 1);
    });
    return SKILL_CATEGORIES.map((cat) => ({
      category: cat,
      count: map.get(cat) || 0,
    }));
  }, [skills]);

  const maxCount = Math.max(1, ...categoryCounts.map((c) => c.count));

  const visibleCategories =
    activeCategory === 'All'
      ? SKILL_CATEGORIES
      : SKILL_CATEGORIES.filter((c) => c === activeCategory);

  return (
    <div className="space-y-10">
      {/* Architecture Layer Distribution Visualization (counts only, zero fabricated proficiency %) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8">
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
            Stack Distribution Across Engineering Domains
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Skills are organized by engineering layer and practical usage context—never represented with arbitrary percentage scores. Select any domain to filter.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            <span>{skills.length} documented capabilities</span>
            <span aria-hidden="true">·</span>
            <span>{SKILL_CATEGORIES.length} core domains</span>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          {categoryCounts.map(({ category, count }) => {
            const widthPct = Math.round((count / maxCount) * 100);
            const isSelected = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(isSelected ? 'All' : category)}
                className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-800 dark:text-slate-200">{category}</span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {count} {count === 1 ? 'skill' : 'skills'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        : 'bg-blue-600/80 dark:bg-cyan-500/75'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit max-w-full">
        <button
          type="button"
          onClick={() => setActiveCategory('All')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeCategory === 'All'
              ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Domains
        </button>
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeCategory === cat
                ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCategories.map((cat) => {
          const items = skills.filter((s) => s.category === cat);
          if (items.length === 0) return null;
          return (
            <div
              key={cat}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6"
            >
              <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                  {cat}
                </h3>
                <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {items.length}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/70">
                {items.map((skill) => (
                  <li key={skill.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {skill.name}
                    </div>
                    {skill.context && (
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {skill.context}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
