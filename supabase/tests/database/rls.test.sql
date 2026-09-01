BEGIN;
SELECT plan(8);

-- Test 1: Ensure tables exist
SELECT has_table('students');
SELECT has_table('sessions');
SELECT has_table('attempts');
SELECT has_table('evaluations');

-- Set up test data
INSERT INTO auth.users (id, email) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'student1@test.com'),
  ('00000000-0000-0000-0000-000000000002', 'student2@test.com');

INSERT INTO curriculum_stages (id, level_number, name) VALUES 
  ('11111111-1111-1111-1111-111111111111', 1, 'Stage 1');

INSERT INTO students (id, auth_user_id, display_name, current_stage_id) VALUES 
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0000-0000-000000000001', 'Student 1', '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Student 2', '11111111-1111-1111-1111-111111111111');

-- Test 2: RLS Isolation for students
-- Authenticate as student1
SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

-- Student 1 should see only their own profile
SELECT results_eq(
  'SELECT auth_user_id FROM students',
  $$VALUES ('00000000-0000-0000-0000-000000000001'::uuid)$$,
  'Student 1 should only see their own profile'
);

-- Test 3: Students cannot update their profile (Service Role handles this)
UPDATE students SET display_name = 'Hacked' WHERE auth_user_id = '00000000-0000-0000-0000-000000000001';
SELECT results_eq(
  'SELECT display_name FROM students WHERE auth_user_id = ''00000000-0000-0000-0000-000000000001''',
  $$VALUES ('Student 1')$$,
  'Student should not be able to update their profile via RLS'
);

-- Test 4: Students cannot insert records (Service Role handles this)
SELECT throws_ok(
  $$ INSERT INTO students (auth_user_id, display_name, current_stage_id) VALUES ('00000000-0000-0000-0000-000000000001', 'Hacked', '11111111-1111-1111-1111-111111111111') $$,
  '42501',
  NULL,
  'Student should not be able to insert profiles'
);

-- Reset auth context
RESET ROLE;

-- Test 5: Service role bypasses RLS
SET ROLE service_role;
SELECT results_eq(
  'SELECT count(*) FROM students',
  ARRAY[2::bigint],
  'Service role should see all students'
);

SELECT * FROM finish();
ROLLBACK;
