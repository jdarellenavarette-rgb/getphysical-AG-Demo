-- =============================================================================
-- Realtime: postgres_changes respects RLS, so subscribers only receive rows
-- they are allowed to SELECT. This replaces the old public broadcast channel.
-- =============================================================================
alter publication supabase_realtime add table
  public.messages,
  public.conversations,
  public.access_scans,
  public.facilities;
