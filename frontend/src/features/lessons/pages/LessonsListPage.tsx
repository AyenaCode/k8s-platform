import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { lessonsListQuery } from '@/features/lessons/api/lessons.queries'
import { completedLessonSlugs, solvedStepKeys, useProgressSummary } from '@/features/progress/hooks'
import { ProgressRing } from '@/shared/components/ProgressRing/ProgressRing'
import { useLang } from '@/core/i18n/lang'

export function LessonsListPage() {
  const { lang } = useLang()
  const { data, isLoading, error } = useQuery(lessonsListQuery(lang))
  const summary = useProgressSummary()
  const done = completedLessonSlugs(summary.data)
  const solvedSteps = solvedStepKeys(summary.data)

  if (isLoading) return <p className="catalog">Loading missions…</p>
  if (error) return <p className="catalog error">Failed to load missions.</p>

  // The next mission to attack: first one that isn't fully cleared.
  const nextSlug = data?.find((l) => !done.has(l.slug))?.slug

  return (
    <div className="catalog">
      <p className="eyebrow">Mission log</p>
      <h1>Missions</h1>
      <p className="catalog__hint">
        Read the brief, run it live against a real cluster, then verify. Every task you verify banks XP.
      </p>
      <ul className="card-list">
        {data?.map((l) => {
          const here = [...solvedSteps].filter((k) => k.startsWith(`step:${l.slug}/`)).length
          const mastery = l.verifyCount > 0 ? here / l.verifyCount : done.has(l.slug) ? 1 : 0
          const isNext = l.slug === nextSlug
          return (
            <li key={l.slug}>
              <Link
                to="/lessons/$slug"
                params={{ slug: l.slug }}
                className={isNext ? 'is-next' : undefined}
              >
                <ProgressRing
                  value={mastery}
                  size={40}
                  stroke={4}
                  label={done.has(l.slug) ? '✓' : ''}
                />
                <div className="card-body">
                  <strong>{l.title}</strong>
                  <span className="muted">{l.summary}</span>
                  <span className="card-meta">
                    {l.estMinutes} min · {l.stepCount} steps · {l.xp} XP
                    {l.verifyCount > 0 && ` · ${Math.round(mastery * 100)}% mastered`}
                  </span>
                </div>
                {isNext && <span className="next-flag">Next up</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
