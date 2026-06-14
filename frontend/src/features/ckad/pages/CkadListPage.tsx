import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { lessonsListQuery } from '@/features/lessons/api/lessons.queries'
import { isCkadLesson } from '@/features/lessons/types'
import { completedLessonSlugs, solvedStepKeys, useProgressSummary } from '@/features/progress/hooks'
import { ProgressRing } from '@/shared/components/ProgressRing/ProgressRing'
import { useLang } from '@/core/i18n/lang'

// The public CKAD domains and their weights, shown as a quick reference.
const DOMAINS = [
  { name: 'Application Design and Build', weight: 20 },
  { name: 'Application Deployment', weight: 20 },
  { name: 'Application Observability and Maintenance', weight: 15 },
  { name: 'Application Environment, Configuration and Security', weight: 25 },
  { name: 'Services and Networking', weight: 20 },
]

export function CkadListPage() {
  const { lang } = useLang()
  const { data, isLoading, error } = useQuery(lessonsListQuery(lang))
  const summary = useProgressSummary()
  const done = completedLessonSlugs(summary.data)
  const solvedSteps = solvedStepKeys(summary.data)

  if (isLoading) return <p className="catalog">Loading CKAD track…</p>
  if (error) return <p className="catalog error">Failed to load the CKAD track.</p>

  const lessons = data?.filter(isCkadLesson) ?? []
  const lessonsDone = lessons.filter((l) => done.has(l.slug)).length
  const nextSlug = lessons.find((l) => !done.has(l.slug))?.slug

  return (
    <div className="catalog">
      <p className="eyebrow">Certification track</p>
      <h1>CKAD preparation</h1>
      <p className="catalog__hint">
        Hands-on drills that mirror the public CKAD exam conditions: performance-based,
        command-line, on a real cluster (exam software version Kubernetes v1.35, 2&nbsp;hours).
        These are original exercises, not copied exam questions.
      </p>

      <div className="ckad-domains">
        {DOMAINS.map((d) => (
          <div key={d.name} className="ckad-domains__row">
            <span className="ckad-domains__name">{d.name}</span>
            <span className="ckad-domains__weight">{d.weight}%</span>
          </div>
        ))}
      </div>

      <div className="section-title">
        <h2>Modules</h2>
        <span className="count">
          {lessonsDone}/{lessons.length} complete
        </span>
      </div>

      <ul className="card-list">
        {lessons.map((l) => {
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
                <ProgressRing value={mastery} size={40} stroke={4} label={done.has(l.slug) ? '✓' : ''} />
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
