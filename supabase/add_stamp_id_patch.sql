-- One-time patch: adds the stamp_id column used by the stamp picker in
-- compose. Safe to run once against the schema you already applied.
-- (schema.sql has been updated to include this column for future fresh
-- installs — you won't need this file again.)

alter table public.postcards
  add column stamp_id text not null default 'compass';
