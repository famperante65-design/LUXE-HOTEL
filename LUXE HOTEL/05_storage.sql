-- 05: IMAGE UPLOADS FOR ROOMS (run after 01-03)
-- Creates a public "room-images" bucket. Anyone can VIEW the photos (clients need to see rooms),
-- but only an ADMIN can upload, replace or delete them.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('room-images', 'room-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "room images are public"     on storage.objects;
drop policy if exists "admin uploads room images"  on storage.objects;
drop policy if exists "admin updates room images"  on storage.objects;
drop policy if exists "admin deletes room images"  on storage.objects;

create policy "room images are public" on storage.objects for select
  using (bucket_id = 'room-images');

create policy "admin uploads room images" on storage.objects for insert
  with check (bucket_id = 'room-images' and my_role() = 'admin');

create policy "admin updates room images" on storage.objects for update
  using (bucket_id = 'room-images' and my_role() = 'admin');

create policy "admin deletes room images" on storage.objects for delete
  using (bucket_id = 'room-images' and my_role() = 'admin');
