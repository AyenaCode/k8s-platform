package progress

import (
	"strings"
	"time"
)

// Records share one string-keyed store. We namespace keys by prefix so the same
// table holds both per-step and per-lesson progress, and counting logic can tell
// them apart. Adding a new kind of progress later = a new prefix, no schema change.
const (
	lessonPrefix = "lesson:"
	stepPrefix   = "step:"
)

// LessonKey is the record id for completing a whole lesson.
func LessonKey(slug string) string { return lessonPrefix + slug }

// StepKey is the record id for solving one step of a lesson.
func StepKey(slug, stepID string) string { return stepPrefix + slug + "/" + stepID }

func isLesson(id string) bool { return strings.HasPrefix(id, lessonPrefix) }
func isStep(id string) bool   { return strings.HasPrefix(id, stepPrefix) }

// LevelInfo is the gamification level derived purely from total XP.
type LevelInfo struct {
	Level       int    `json:"level"`
	Title       string `json:"title"`
	XP          int    `json:"xp"`
	Floor       int    `json:"floor"`
	NextLevelXP int    `json:"nextLevelXp"` // 0 at the top tier
}

// levelTiers: ascending XP thresholds with a rank title. Last tier is the cap.
var levelTiers = []struct {
	min   int
	title string
}{
	{0, "Beginner"},
	{200, "Apprentice"},
	{500, "Operator"},
	{1000, "Practitioner"},
	{1800, "Engineer"},
	{3000, "K8s Expert"},
}

// Level maps total XP to its level, rank title and the XP needed for the next
// level (0 when already at the top tier).
func Level(totalXP int) LevelInfo {
	idx := 0
	for i, t := range levelTiers {
		if totalXP >= t.min {
			idx = i
		}
	}
	info := LevelInfo{Level: idx + 1, Title: levelTiers[idx].title, XP: totalXP, Floor: levelTiers[idx].min}
	if idx+1 < len(levelTiers) {
		info.NextLevelXP = levelTiers[idx+1].min
	}
	return info
}

// Badge is a gamification achievement; Earned is derived from a user's records.
type Badge struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Desc   string `json:"desc"`
	Earned bool   `json:"earned"`
}

// Badges derives the achievement set. totalLessons is the catalog size (for the
// "finish everything" badge) and streak is the current consecutive-day streak.
func Badges(records []Record, totalLessons, streak int) []Badge {
	steps, lessons := 0, 0
	for _, rec := range records {
		if !rec.Solved {
			continue
		}
		switch {
		case isLesson(rec.ExerciseID):
			lessons++
		case isStep(rec.ExerciseID):
			steps++
		}
	}
	return []Badge{
		{"first-step", "First Step", "Complete your first task", steps >= 1},
		{"apprentice", "Apprentice", "Complete 5 tasks", steps >= 5},
		{"first-lesson", "Quick Learner", "Finish your first lesson", lessons >= 1},
		{"graduate", "Graduate", "Finish every lesson", totalLessons > 0 && lessons >= totalLessons},
		{"on-fire", "On Fire", "Reach a 3-day streak", streak >= 3},
		{"dedicated", "Dedicated", "Reach a 7-day streak", streak >= 7},
	}
}

// Streak is the number of consecutive days (ending today or yesterday) on which
// the user solved at least one step or lesson. `now` is injected so the function
// stays pure and testable.
func Streak(records []Record, now time.Time) int {
	days := make(map[int64]bool)
	for _, rec := range records {
		if rec.Solved && rec.SolvedAt != nil {
			days[dayIndex(*rec.SolvedAt)] = true
		}
	}
	if len(days) == 0 {
		return 0
	}
	today := dayIndex(now)
	// Allow the streak to "end" yesterday (the user hasn't practised yet today).
	start := today
	if !days[today] {
		start = today - 1
	}
	streak := 0
	for d := start; days[d]; d-- {
		streak++
	}
	return streak
}

// dayIndex collapses a timestamp to a UTC day number for streak comparison.
func dayIndex(t time.Time) int64 {
	return t.UTC().Unix() / 86400
}
