-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  feeling TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_sets table
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  workout_id TEXT NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  reps NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON public.workouts(date);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_id ON public.workout_sets(workout_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts table
-- Users can only read their own workouts
CREATE POLICY "Users can view their own workouts" ON public.workouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create their own workouts
CREATE POLICY "Users can create their own workouts" ON public.workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own workouts
CREATE POLICY "Users can update their own workouts" ON public.workouts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own workouts
CREATE POLICY "Users can delete their own workouts" ON public.workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for workout_sets table
-- Users can only read sets from their own workouts
CREATE POLICY "Users can view sets from their own workouts" ON public.workout_sets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_sets.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Users can only create sets in their own workouts
CREATE POLICY "Users can create sets in their own workouts" ON public.workout_sets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Users can only update sets in their own workouts
CREATE POLICY "Users can update sets in their own workouts" ON public.workout_sets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_sets.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Users can only delete sets from their own workouts
CREATE POLICY "Users can delete sets from their own workouts" ON public.workout_sets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_sets.workout_id
      AND workouts.user_id = auth.uid()
    )
  );
