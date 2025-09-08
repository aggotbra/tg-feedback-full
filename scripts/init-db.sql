CREATE TABLE IF NOT EXISTS suggestions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  username TEXT,
  product TEXT NOT NULL,
  topic TEXT NOT NULL,
  text TEXT NOT NULL,
  votes_up INT DEFAULT 0,
  votes_down INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
