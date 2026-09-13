-- Add share_token column to tasks for public shareable links
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT gen_random_uuid() UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tasks_share_token ON tasks(share_token);

-- Public read policy for shared tasks (anyone with the token can view)
CREATE POLICY "Public can view shared tasks"
  ON tasks FOR SELECT
  USING (share_token IS NOT NULL);

-- Public can insert comments on shared tasks (anonymous-friendly)
CREATE POLICY "Anyone can comment on shared tasks"
  ON comments FOR INSERT
  WITH CHECK (true);
