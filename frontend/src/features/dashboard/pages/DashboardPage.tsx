// DashboardPage is the "Ops Console" home: a glanceable cockpit that pulls the
// learner straight back in — a one-click Resume, a course-completion ring, the
// streak, today's XP goal, and per-mission mastery. Everything here exists to
// shorten the path from "open the app" to "solve the next task".
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { lessonsListQuery } from '@/features/lessons/api/lessons.queries'
import { BadgeGrid } from '@/features/gamification/BadgeGrid'
import { XpBar } from '@/features/gamification/XpBar'
import { completedLessonSlugs, solvedStepKeys, useProgressSummary } from '@/features/progress/hooks'
import { ProgressRing } from '@/shared/components/ProgressRing/ProgressRing'
import { useLang } from '@/core/i18n/lang'

const DAILY_GOAL_XP = 100

// XP earned since local midnight — drives the daily-goal ring.
function xpToday(records: { xp: number; solvedAt?: string }[]): number {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const t0 = start.getTime()
  return records.reduce((sum, r) => (r.solvedAt && new Date(r.solvedAt).getTime() >= t0 ? sum + r.xp : sum), 0)
}

export function DashboardPage() {
  const { lang } = useLang()
  const summary = useProgressSummary()
  const lessons = useQuery(lessonsListQuery(lang))

  if (summary.isLoading || lessons.isLoading) return <p className="dashboard">Loading…</p>

  const data = summary.data
  const list = lessons.data ?? []
  const done = completedLessonSlugs(data)
  const solvedSteps = solvedStepKeys(data)

  const masteryOf = (slug: string, verifyCount: number) => {
    if (verifyCount <= 0) return done.has(slug) ? 1 : 0
    const here = [...solvedSteps].filter((k) => k.startsWith(`step:${slug}/`)).length
    return here / verifyCount
  }

  const lessonsDone = list.filter((l) => done.has(l.slug)).length
  const coursePct = list.length ? lessonsDone / list.length : 0
  const resume = list.find((l) => !done.has(l.slug)) ?? list[list.length - 1]
  const today = data ? xpToday(data.records) : 0
  const goalPct = Math.min(1, today / DAILY_GOAL_XP)

  return (
    <div className="dashboard">
      <div className="dashboard__grid">
        {/* ---- hero: resume + course completion ---- */}
        <section className="hero reveal">
          <div className="hero__lead">
            <p className="eyebrow">Ops Console</p>
            <h1 className="hero__title">
              {coursePct >= 1 ? 'Cluster mastered.' : lessonsDone === 0 ? 'Boot the cluster.' : 'Pick up where you left off.'}
            </h1>
            <p className="hero__sub">
              {coursePct >= 1
                ? 'Every mission cleared. Re-run any drill to keep your edge sharp.'
                : 'Read the brief, run it live in the terminal, verify. One task at a time.'}
            </p>
            {resume && (
              <Link to="/lessons/$slug" params={{ slug: resume.slug }} className="hero__cta">
                {done.has(resume.slug) ? 'Replay' : lessonsDone === 0 ? 'Start' : 'Resume'}: {resume.title}
                <span className="arrow">→</span>
              </Link>
            )}
          </div>
          <div className="hero__ring">
            <ProgressRing value={coursePct} size={92} stroke={7} label={`${Math.round(coursePct * 100)}%`} />
            <small>{lessonsDone}/{list.length} missions</small>
          </div>
        </section>

        {/* ---- level progress ---- */}
        {data && (
          <section className="card reveal">
            <XpBar level={data.level} />
          </section>
        )}

        {/* ---- stat strip ---- */}
        {data && (
          <section className="stats reveal">
            <div className="stat stat--streak">
              <span className="stat__k">Streak</span>
              <span className="stat__v">
                {data.streak} <small>{data.streak === 1 ? 'day' : 'days'}</small>
              </span>
              <span className="stat__hint">{data.streak > 0 ? '🔥 keep it alive — solve one today' : 'Solve a task to start a streak'}</span>
            </div>
            <div className="stat" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
              <ProgressRing value={goalPct} size={52} stroke={5} label={goalPct >= 1 ? '✓' : ''} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span className="stat__k">Today</span>
                <span className="stat__v" style={{ fontSize: '1.3rem' }}>
                  {today} <small>/ {DAILY_GOAL_XP} XP</small>
                </span>
                <span className="stat__hint">{goalPct >= 1 ? 'Daily goal reached 🎯' : 'Daily goal'}</span>
              </div>
            </div>
            <div className="stat stat--xp">
              <span className="stat__k">Tasks solved</span>
              <span className="stat__v">{solvedSteps.size}</span>
              <span className="stat__hint">{data.totalXp} XP total earned</span>
            </div>
          </section>
        )}

        {/* ---- badges ---- */}
        {data && (
          <section className="reveal">
            <div className="section-title">
              <h2>Badges</h2>
              <span className="count">{data.badges.filter((b) => b.earned).length}/{data.badges.length}</span>
            </div>
            <BadgeGrid badges={data.badges} />
          </section>
        )}

        {/* ---- missions ---- */}
        <section className="reveal">
          <div className="section-title">
            <h2>Missions</h2>
            <span className="count">{lessonsDone}/{list.length} complete</span>
          </div>
          <ul className="progress-list">
            {list.map((l) => {
              const m = masteryOf(l.slug, l.verifyCount)
              const here = [...solvedSteps].filter((k) => k.startsWith(`step:${l.slug}/`)).length
              return (
                <li key={l.slug}>
                  <Link to="/lessons/$slug" params={{ slug: l.slug }}>
                    <ProgressRing
                      value={m}
                      size={32}
                      stroke={3}
                      label={done.has(l.slug) ? '✓' : ''}
                    />
                    <span className="pl-title">{l.title}</span>
                    <span className="card-meta">
                      {l.verifyCount > 0 ? `${here}/${l.verifyCount} tasks` : 'reading'} · {l.xp} XP
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
