package progress

import "testing"

func TestLevel(t *testing.T) {
	cases := []struct {
		xp        int
		wantLevel int
		wantTitle string
		wantNext  int
	}{
		{0, 1, "Intern", 300},
		{299, 1, "Intern", 300},
		{300, 2, "Junior SRE", 700},
		{1500, 4, "Senior SRE", 2000},
		{5000, 6, "K8s Wizard", 0}, // max tier => no next
	}
	for _, c := range cases {
		got := Level(c.xp)
		if got.Level != c.wantLevel || got.Title != c.wantTitle || got.NextLevelXP != c.wantNext {
			t.Errorf("Level(%d) = {lvl %d, %q, next %d}; want {lvl %d, %q, next %d}",
				c.xp, got.Level, got.Title, got.NextLevelXP, c.wantLevel, c.wantTitle, c.wantNext)
		}
	}
}

func TestBadgesFiltersCoursePrefix(t *testing.T) {
	recs := []Record{
		{ExerciseID: "ticket-001", Solved: true, XP: 100},
		{ExerciseID: "ticket-002", Solved: true, XP: 100},
		{ExerciseID: "ticket-003", Solved: true, XP: 200},
		{ExerciseID: CourseKey("01-architecture"), Solved: true, XP: 50},
	}
	badges := byID(Badges(recs, 10, 7))

	// 3 exercises solved (course record must NOT inflate the exercise tally).
	if !badges["first-blood"].Earned || !badges["triage"].Earned {
		t.Error("first-blood and triage should be earned with 3 exercises solved")
	}
	if badges["incident-commander"].Earned {
		t.Error("incident-commander must not be earned with 3/10 exercises (course record must not count)")
	}
	if !badges["scholar"].Earned {
		t.Error("scholar should be earned with 1 course finished")
	}
	if badges["completionist"].Earned {
		t.Error("completionist must not be earned with 1/7 courses")
	}
	if badges["half-way"].Earned {
		t.Error("half-way must not be earned with 3/10 exercises")
	}
}

func TestBadgesAllSolved(t *testing.T) {
	recs := []Record{
		{ExerciseID: "ticket-001", Solved: true, XP: 100},
		{ExerciseID: "ticket-002", Solved: true, XP: 100},
		{ExerciseID: CourseKey("a"), Solved: true, XP: 50},
		{ExerciseID: CourseKey("b"), Solved: true, XP: 50},
	}
	badges := byID(Badges(recs, 2, 2))
	if !badges["incident-commander"].Earned {
		t.Error("incident-commander should be earned when all exercises solved")
	}
	if !badges["completionist"].Earned {
		t.Error("completionist should be earned when all courses finished")
	}
}

func byID(badges []Badge) map[string]Badge {
	m := make(map[string]Badge, len(badges))
	for _, b := range badges {
		m[b.ID] = b
	}
	return m
}
