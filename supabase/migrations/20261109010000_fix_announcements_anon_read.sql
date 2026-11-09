-- Correctif : la lecture publique des annonces échouait (401, "permission denied for table admin_users")
-- pour les visiteurs non connectés, car la politique interrogeait admin_users, illisible par le rôle anon.
-- On sépare : annonces publiées (tout le monde) et lecture complète (admins).
begin;
drop policy if exists "announcements_public_read" on public."site_announcements";
create policy "announcements_public_read" on public."site_announcements" as permissive for select to anon, authenticated
  using (published = true);
create policy "announcements_admin_read" on public."site_announcements" as permissive for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
commit;
