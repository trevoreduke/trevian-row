CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'rower' CHECK (role IN ('coach', 'coxswain', 'rower')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  photo_url TEXT,
  push_subscription JSONB,
  auth_code TEXT,
  auth_code_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE boats (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE boat_members (
  boat_id INTEGER REFERENCES boats(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (boat_id, user_id)
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  type TEXT NOT NULL DEFAULT 'update' CHECK (type IN ('result', 'pr', 'photo', 'shoutout', 'update')),
  title TEXT,
  body TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL DEFAULT '🔥',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

CREATE TABLE crew_calls (
  id SERIAL PRIMARY KEY,
  boat_id INTEGER REFERENCES boats(id),
  sender_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
