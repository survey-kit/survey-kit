import * as React from 'react'
import { Award, Lock } from 'lucide-react'

import { cn } from '../../../lib/utils'

export interface GamificationBadgeItem {
  id: string
  label: string
  description: string
  unlocked: boolean
}

export interface BadgeCardProps {
  badge: GamificationBadgeItem
  className?: string
}

export const BadgeCard = React.forwardRef<HTMLDivElement, BadgeCardProps>(
  ({ badge, className }, ref) => {
    const { unlocked, label, description, id } = badge
    const statusLabel = unlocked ? 'Unlocked' : 'Locked'

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-4 flex flex-col gap-2 min-h-[7.5rem] transition-colors',
          unlocked
            ? 'border-ocean-blue/40 bg-background shadow-sm'
            : 'border-muted bg-muted/30',
          className
        )}
        role="group"
        aria-labelledby={`badge-${id}-title`}
        aria-describedby={`badge-${id}-desc`}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
              unlocked
                ? 'border-ocean-blue bg-ocean-blue/10 text-ocean-blue'
                : 'border-muted-foreground/30 bg-background text-muted-foreground'
            )}
            aria-hidden
          >
            {unlocked ? (
              <Award className="h-5 w-5" aria-hidden />
            ) : (
              <Lock className="h-5 w-5" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p
              id={`badge-${id}-title`}
              className="font-semibold text-foreground leading-tight"
            >
              {label}
            </p>
            <p
              className="text-xs text-muted-foreground mt-0.5"
              aria-live="polite"
            >
              {statusLabel}
              {!unlocked ? ' — complete more surveys to unlock.' : ''}
            </p>
          </div>
        </div>
        <p id={`badge-${id}-desc`} className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    )
  }
)
BadgeCard.displayName = 'BadgeCard'

export interface BadgeListProps {
  badges: GamificationBadgeItem[]
  title?: string
  className?: string
  listClassName?: string
}

export function BadgeList({
  badges,
  title = 'Your badges',
  className,
  listClassName,
}: BadgeListProps) {
  const headingId = React.useId()

  return (
    <section
      className={cn('w-full max-w-4xl mx-auto', className)}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="text-lg font-semibold text-foreground mb-4">
        {title}
      </h2>
      <ul
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0',
          listClassName
        )}
      >
        {badges.map((b) => (
          <li key={b.id} className="min-w-0">
            <BadgeCard badge={b} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export interface ParticipantSummaryProps {
  points: number
  completedCount: number
  currentStreak: number
  /** Full sentence for screen readers, e.g. from streakAriaLabel() in core */
  streakDescription: string
  className?: string
}

export function ParticipantSummary({
  points,
  completedCount,
  currentStreak,
  streakDescription,
  className,
}: ParticipantSummaryProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 rounded-lg border border-border bg-card p-4 text-card-foreground',
        className
      )}
    >
      <div className="min-w-[8rem]">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Points
        </p>
        <p className="text-2xl font-semibold tabular-nums" aria-live="polite">
          {points}
        </p>
      </div>
      <div className="min-w-[8rem]">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Surveys completed
        </p>
        <p className="text-2xl font-semibold tabular-nums" aria-live="polite">
          {completedCount}
        </p>
      </div>
      <div className="min-w-[8rem] flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Streak (UTC days)
        </p>
        <p
          className="text-2xl font-semibold tabular-nums"
          aria-label={streakDescription}
        >
          {currentStreak}
          <span className="sr-only"> {streakDescription}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1 sm:hidden">
          {streakDescription}
        </p>
      </div>
    </div>
  )
}
