-- Increment bookmark view count with security definer fallback
create or replace function public.increment_bookmark_view(p_bookmark_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update bookmarks
  set view_count = coalesce(view_count, 0) + 1
  where id = p_bookmark_id
  returning view_count into updated_count;

  return coalesce(updated_count, 0);
end;
$$;

grant execute on function public.increment_bookmark_view(uuid) to anon;
grant execute on function public.increment_bookmark_view(uuid) to authenticated;
