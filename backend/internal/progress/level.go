package progress

import "strings"

// coursePrefix tags records that represent a completed *course* rather than a
// solved exercise. Both live in the same store (keyed by string), so any logic
// that counts exercises must filter this prefix out — and course badges count it in.
const coursePrefix = "course:"

// IsCourse reports whether a record id is a completed-course marker.
func IsCourse(exerciseID string) bool { return strings.HasPrefix(exerciseID, coursePrefix) }

// CourseKey builds the store key used to record a completed course.
func CourseKey(slug string) string { return coursePrefix + slug }

// LevelInfo is the gamification level derived purely from total XP.
type LevelInfo struct {
	Level       int    `json:"level"`       // 1-based level number
	Title       string `json:"title"`       // human-friendly rank
	XP          int    `json:"xp"`          // the total XP this was computed from
	Floor       int    `json:"floor"`       // XP at which the current level began
	NextLevelXP int    `json:"nextLevelXp"` // XP needed to reach the next level (0 at max)
}

// levelTiers are the XP thresholds. Order matters (ascending). The last tier is
// the cap. Tuned so the 10 exercises (≈2050 XP) walk a learner through the ranks.
var levelTiers = []struct {
	min   int
	title string
}{
	{0, "Intern"},
	{300, "Junior SRE"},
	{700, "SRE"},
	{1200, "Senior SRE"},
	{2000, "Incident Commander"},
	{3000, "K8s Wizard"},
}

// Level maps a total XP amount to its level, rank title and the XP needed for the
// next level (0 when already at the top tier).
func Level(totalXP int) LevelInfo {
	idx := 0
	for i, t := range levelTiers {
		if totalXP >= t.min {
			idx = i
		}
	}
	info := LevelInfo{
		Level: idx + 1,
		Title: levelTiers[idx].title,
		XP:    totalXP,
		Floor: levelTiers[idx].min,
	}
	if idx+1 < len(levelTiers) {
		info.NextLevelXP = levelTiers[idx+1].min
	}
	return info
}

// Badge is a gamification achievement. Earned is computed from the user's records.
type Badge struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Desc   string `json:"desc"`
	Earned bool   `json:"earned"`
}

// Badges derives the achievement set from a user's records. totalExercises and
// totalCourses are the catalog sizes (needed for the "complete everything" badges).
// Exercise counts deliberately exclude course:* records, and vice-versa.
func Badges(records []Record, totalExercises, totalCourses int) []Badge {
	solvedExos, solvedCourses := 0, 0
	for _, rec := range records {
		if !rec.Solved {
			continue
		}
		if IsCourse(rec.ExerciseID) {
			solvedCourses++
		} else {
			solvedExos++
		}
	}

	return []Badge{
		{"first-blood", "First Blood", "Solve your first incident", solvedExos >= 1},
		{"triage", "Triage Officer", "Solve 3 incidents", solvedExos >= 3},
		{"half-way", "Halfway There", "Solve half of all incidents", totalExercises > 0 && solvedExos*2 >= totalExercises},
		{"incident-commander", "Incident Commander", "Solve every incident", totalExercises > 0 && solvedExos >= totalExercises},
		{"scholar", "Scholar", "Finish your first course", solvedCourses >= 1},
		{"completionist", "Completionist", "Finish every course", totalCourses > 0 && solvedCourses >= totalCourses},
	}
}
