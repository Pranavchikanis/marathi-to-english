-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
CREATE TYPE modality_type AS ENUM ('TEXT', 'VOICE');
CREATE TYPE grade_type AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');
CREATE TYPE session_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');
CREATE TYPE mastery_status AS ENUM ('NOT_INTRODUCED', 'INTRODUCED', 'PRACTICING', 'DEVELOPING', 'PROFICIENT', 'NEEDS_REVIEW');
CREATE TYPE error_category AS ENUM ('GRAMMAR', 'TENSE', 'ARTICLE', 'PREPOSITION', 'WORD_ORDER', 'AGREEMENT', 'VOCABULARY', 'SPELLING', 'MISSING_WORD', 'EXTRA_WORD', 'MEANING', 'NATURALNESS');

-- Create Tables
CREATE TABLE curriculum_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES curriculum_stages(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE RESTRICT,
    marathi_prompt TEXT NOT NULL,
    reference_translations TEXT[] NOT NULL,
    difficulty_level INT NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 6)
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    total_xp INT NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
    current_stage_id UUID NOT NULL REFERENCES curriculum_stages(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status session_status NOT NULL DEFAULT 'IN_PROGRESS',
    xp_earned INT NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    summary_data JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE session_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    order_index INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SKIPPED', 'COMPLETED')),
    UNIQUE(session_id, order_index)
);

CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_exercise_id UUID NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
    modality modality_type NOT NULL,
    raw_transcription TEXT,
    submitted_answer TEXT NOT NULL,
    was_edited BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL UNIQUE REFERENCES attempts(id) ON DELETE CASCADE,
    grade grade_type NOT NULL,
    corrected_text TEXT,
    explanation_marathi TEXT,
    alternative_valid_translations TEXT[],
    ai_metadata JSONB NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evaluation_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    category error_category NOT NULL
);

CREATE TABLE mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    status mastery_status NOT NULL DEFAULT 'INTRODUCED',
    correct_attempts INT NOT NULL DEFAULT 0,
    incorrect_attempts INT NOT NULL DEFAULT 0,
    last_practiced_at TIMESTAMPTZ,
    UNIQUE(student_id, concept_id)
);

-- Create Indexes
CREATE INDEX idx_sessions_student_status ON sessions(student_id, status);
CREATE INDEX idx_session_exercises_session_order ON session_exercises(session_id, order_index);
CREATE INDEX idx_mastery_student_status ON mastery(student_id, status);
CREATE INDEX idx_attempts_session_exercise ON attempts(session_exercise_id);

-- Enable Row Level Security (RLS)
ALTER TABLE curriculum_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Curriculum is readable by anyone authenticated (or anon, depending on app setup)
CREATE POLICY "Curriculum stages are viewable by everyone" ON curriculum_stages FOR SELECT USING (true);
CREATE POLICY "Concepts are viewable by everyone" ON concepts FOR SELECT USING (true);
CREATE POLICY "Exercises are viewable by everyone" ON exercises FOR SELECT USING (true);

-- Student data is only readable by the student who owns it
CREATE POLICY "Students can view their own profile" ON students FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Students can view their own sessions" ON sessions FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Students can view their own session exercises" ON session_exercises FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()))
);

CREATE POLICY "Students can view their own attempts" ON attempts FOR SELECT USING (
    session_exercise_id IN (
        SELECT id FROM session_exercises WHERE session_id IN (
            SELECT id FROM sessions WHERE student_id IN (
                SELECT id FROM students WHERE auth_user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Students can view their own evaluations" ON evaluations FOR SELECT USING (
    attempt_id IN (
        SELECT id FROM attempts WHERE session_exercise_id IN (
            SELECT id FROM session_exercises WHERE session_id IN (
                SELECT id FROM sessions WHERE student_id IN (
                    SELECT id FROM students WHERE auth_user_id = auth.uid()
                )
            )
        )
    )
);

CREATE POLICY "Students can view their own evaluation errors" ON evaluation_errors FOR SELECT USING (
    evaluation_id IN (
        SELECT id FROM evaluations WHERE attempt_id IN (
            SELECT id FROM attempts WHERE session_exercise_id IN (
                SELECT id FROM session_exercises WHERE session_id IN (
                    SELECT id FROM sessions WHERE student_id IN (
                        SELECT id FROM students WHERE auth_user_id = auth.uid()
                    )
                )
            )
        )
    )
);

CREATE POLICY "Students can view their own mastery" ON mastery FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
);

-- Note: All INSERT, UPDATE, DELETE operations for student data are handled by the server 
-- using the service_role key, which bypasses RLS. So no client-side write policies are created.
