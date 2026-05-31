-- Progress / gamification (data tier). One row per (user, exercise).
CREATE TABLE IF NOT EXISTS progress (
    user_id     TEXT        NOT NULL,
    exercise_id TEXT        NOT NULL,
    solved      BOOLEAN     NOT NULL DEFAULT false,
    xp          INTEGER     NOT NULL DEFAULT 0,
    solved_at   TIMESTAMPTZ,
    PRIMARY KEY (user_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON progress (user_id);
