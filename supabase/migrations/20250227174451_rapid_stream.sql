/*
  # Create initial database schema for Onix AI Sales Agent

  1. New Tables
    - `users` - Stores user information
    - `chats` - Stores chat sessions
    - `messages` - Stores individual messages
    - `user_preferences` - Stores user preferences
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  mode TEXT NOT NULL,
  documents TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  mode TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system',
  font_size TEXT NOT NULL DEFAULT 'medium',
  bubble_style TEXT NOT NULL DEFAULT 'modern',
  code_theme TEXT NOT NULL DEFAULT 'github',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
  ON users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create policies for chats table
CREATE POLICY "Users can view their own chats" 
  ON chats 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" 
  ON chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" 
  ON chats 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" 
  ON chats 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for messages table
CREATE POLICY "Users can view their own messages" 
  ON messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" 
  ON messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
  ON messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
  ON messages 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for user_preferences table
CREATE POLICY "Users can view their own preferences" 
  ON user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at,
    NEW.created_at
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);