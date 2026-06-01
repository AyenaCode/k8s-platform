package progress

import (
	"testing"
	"time"
)

func TestLevel(t *testing.T) {
	cases := []struct {
		xp        int
		wantLevel int
		wantTitle string
		wantNext  int
	}{
		{0, 1, "Beginner", 200},
		{199, 1, "Beginner", 200},
		{200, 2, "Apprentice", 500},
		{1000, 4, "Practitioner", 1800},
		{5000, 6, "K8s Expert", 0}, // top tier => no next
	}
	for _, c := range cases {
		got := Level(c.xp)
		if got.Level != c.wantLevel || got.Title != c.wantTitle || got.NextLevelXP != c.wantNext {
			t.Errorf("Level(%d) = {lvl %d, %q, next %d}; want {lvl %d, %q, next %d}",
				c.xp, got.Level, got.Title, got.NextLevelXP, c.wantLevel, c.wantTitle, c.wantNext)
		}
	}
}

func TestBadgesSeparatesStepsAndLessons(t *testing.T) {
	recs := []Record{
		{ExerciseID: StepKey("01-pods", "create"), Solved: true, XP: 50},
		{ExerciseID: StepKey("01-pods", "inspect"), Solved: true, XP: 50},
		{ExerciseID: LessonKey("01-pods"), Solved: true, XP: 150},
	}
	badges := byID(Badges(recs, 3, 0))

	if !badges["first-step"].Earned {
		t.Error("first-step should be earned with >=1 step")
	}
	if badges["apprentice"].Earned {
		t.Error("apprentice needs 5 steps; only 2 solved")
	}
	if !badges["first-lesson"].Earned {
		t.Error("first-lesson should be earned with 1 lesson")
	}
	if badges["graduate"].Earned {
		t.Error("graduate needs all 3 lessons; only 1 done (lesson record must not be counted as a step either)")
	}
}

func TestBadgesGraduateAndStreak(t *testing.T) {
	recs := []Record{
		{ExerciseID: LessonKey("a"), Solved: true, XP: 150},
		{ExerciseID: LessonKey("b"), Solved: true, XP: 150},
	}
	badges := byID(Badges(recs, 2, 7))
	if !badges["graduate"].Earned {
		t.Error("graduate should be earned when all lessons finished")
	}
	if !badges["on-fire"].Earned || !badges["dedicated"].Earned {
		t.Error("on-fire (>=3) and dedicated (>=7) should be earned at streak 7")
	}
}

func TestStreak(t *testing.T) {
	now := time.Date(2026, 5, 31, 12, 0, 0, 0, time.UTC)
	day := 24 * time.Hour
	at := func(d time.Duration) *time.Time { tt := now.Add(-d); return &tt }

	// today, yesterday, 2 days ago => streak 3
	recs := []Record{
		{ExerciseID: StepKey("l", "a"), Solved: true, SolvedAt: at(0)},
		{ExerciseID: StepKey("l", "b"), Solved: true, SolvedAt: at(day)},
		{ExerciseID: StepKey("l", "c"), Solved: true, SolvedAt: at(2 * day)},
		{ExerciseID: StepKey("l", "old"), Solved: true, SolvedAt: at(10 * day)}, // gap, ignored
	}
	if s := Streak(recs, now); s != 3 {
		t.Errorf("Streak = %d; want 3", s)
	}

	if s := Streak(nil, now); s != 0 {
		t.Errorf("empty Streak = %d; want 0", s)
	}

	// Only yesterday (none today) still counts as an active 1-day streak.
	only := []Record{{ExerciseID: StepKey("l", "a"), Solved: true, SolvedAt: at(day)}}
	if s := Streak(only, now); s != 1 {
		t.Errorf("yesterday-only Streak = %d; want 1", s)
	}
}

func byID(badges []Badge) map[string]Badge {
	m := make(map[string]Badge, len(badges))
	for _, b := range badges {
		m[b.ID] = b
	}
	return m
}
