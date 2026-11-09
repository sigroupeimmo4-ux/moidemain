-- Schéma public de moidemain exporté en lecture seule le 2026-11-09 depuis le projet sjhvaaaiwijhcykznfqn.
-- Reconstitué depuis les catalogues Postgres (pas de pg_dump). À relire avant de rejouer sur une base neuve.

create table if not exists public."admin_users" (
  "user_id" uuid not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "admin_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint "admin_users_pkey" PRIMARY KEY (user_id)
);
alter table public."admin_users" enable row level security;

create table if not exists public."fullta_rate_limits" (
  "user_id" uuid not null,
  "bucket" timestamp with time zone not null,
  "used" integer not null default 0,
  constraint "fullta_rate_limits_used_check" CHECK (((used >= 0) AND (used <= 1000))),
  constraint "fullta_rate_limits_pkey" PRIMARY KEY (user_id, bucket)
);
alter table public."fullta_rate_limits" enable row level security;

create table if not exists public."premium_access" (
  "user_id" uuid not null,
  "active" boolean not null default false,
  "stripe_checkout_session" text,
  "purchased_at" timestamp with time zone,
  "created_at" timestamp with time zone not null default now(),
  "payment_provider" text,
  "payment_token" text,
  "amount_xof" integer,
  constraint "premium_access_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint "premium_access_pkey" PRIMARY KEY (user_id),
  constraint "premium_access_stripe_checkout_session_key" UNIQUE (stripe_checkout_session)
);
alter table public."premium_access" enable row level security;
create unique index if not exists premium_access_provider_token_unique ON public.premium_access USING btree (payment_provider, payment_token) WHERE (payment_token IS NOT NULL);

create table if not exists public."premium_careers" (
  "id" text not null,
  "name" text not null,
  "category" text not null,
  "emoji" text not null,
  "detail" text not null,
  "training" text not null,
  "tasks" jsonb not null,
  constraint "premium_careers_tasks_check" CHECK ((jsonb_typeof(tasks) = 'array'::text)),
  constraint "premium_careers_pkey" PRIMARY KEY (id)
);
alter table public."premium_careers" enable row level security;

create table if not exists public."premium_orders" (
  "id" uuid not null,
  "user_id" uuid not null,
  "provider" text not null default 'paydunya'::text,
  "provider_token" text,
  "mode" text not null,
  "amount_xof" integer not null,
  "status" text not null default 'pending'::text,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  constraint "premium_orders_amount_xof_check" CHECK (((amount_xof >= 100) AND (amount_xof <= 1000000))),
  constraint "premium_orders_mode_check" CHECK ((mode = ANY (ARRAY['test'::text, 'live'::text]))),
  constraint "premium_orders_provider_check" CHECK ((provider = 'paydunya'::text)),
  constraint "premium_orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'cancelled'::text, 'failed'::text, 'test_completed'::text]))),
  constraint "premium_orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint "premium_orders_pkey" PRIMARY KEY (id),
  constraint "premium_orders_provider_token_key" UNIQUE (provider_token)
);
alter table public."premium_orders" enable row level security;

create table if not exists public."quiz_history" (
  "id" uuid not null default gen_random_uuid(),
  "user_id" uuid not null,
  "quiz_type" text not null,
  "job_id" text,
  "outcome" text not null,
  "score" smallint,
  "created_at" timestamp with time zone not null default now(),
  constraint "quiz_history_job_id_check" CHECK (((job_id IS NULL) OR (job_id ~ '^[a-z_]{2,40}$'::text))),
  constraint "quiz_history_outcome_check" CHECK (((char_length(outcome) >= 1) AND (char_length(outcome) <= 160))),
  constraint "quiz_history_quiz_type_check" CHECK ((quiz_type = ANY (ARRAY['personality'::text, 'job'::text]))),
  constraint "quiz_history_score_check" CHECK (((score IS NULL) OR ((score >= 0) AND (score <= 6)))),
  constraint "quiz_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint "quiz_history_pkey" PRIMARY KEY (id)
);
alter table public."quiz_history" enable row level security;

create table if not exists public."site_announcements" (
  "id" uuid not null default gen_random_uuid(),
  "title" text not null,
  "body" text not null,
  "published" boolean not null default false,
  "created_at" timestamp with time zone not null default now(),
  constraint "site_announcements_body_check" CHECK (((char_length(body) >= 3) AND (char_length(body) <= 1100))),
  constraint "site_announcements_title_check" CHECK (((char_length(title) >= 3) AND (char_length(title) <= 110))),
  constraint "site_announcements_pkey" PRIMARY KEY (id)
);
alter table public."site_announcements" enable row level security;

create table if not exists public."support_tickets" (
  "id" uuid not null default gen_random_uuid(),
  "user_id" uuid not null,
  "category" text not null,
  "message" text not null,
  "status" text not null default 'ouvert'::text,
  "created_at" timestamp with time zone not null default now(),
  constraint "support_tickets_category_check" CHECK ((category = ANY (ARRAY['bug'::text, 'contenu'::text, 'compte'::text, 'vie_privee'::text, 'premium'::text, 'autre'::text]))),
  constraint "support_tickets_message_check" CHECK (((char_length(message) >= 10) AND (char_length(message) <= 800))),
  constraint "support_tickets_status_check" CHECK ((status = ANY (ARRAY['ouvert'::text, 'resolu'::text]))),
  constraint "support_tickets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint "support_tickets_pkey" PRIMARY KEY (id)
);
alter table public."support_tickets" enable row level security;

create table if not exists public."user_avatars" (
  "id" uuid not null default gen_random_uuid(),
  "user_id" uuid not null,
  "name" text not null default 'Mon compagnon'::text,
  "animal" text not null,
  "color" text not null,
  "accessory" text not null,
  "outfit" text not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "user_avatars_accessory_check" CHECK ((accessory = ANY (ARRAY['aucun'::text, 'noeud'::text, 'lunettes'::text, 'couronne'::text]))),
  constraint "user_avatars_animal_check" CHECK ((animal = ANY (ARRAY['lapin'::text, 'renard'::text, 'chat'::text, 'hibou'::text]))),
  constraint "user_avatars_color_check" CHECK ((color = ANY (ARRAY['lavande'::text, 'rose'::text, 'menthe'::text, 'ciel'::text]))),
  constraint "user_avatars_name_check" CHECK (((char_length(name) >= 1) AND (char_length(name) <= 24))),
  constraint "user_avatars_outfit_check" CHECK ((outfit = ANY (ARRAY['peche'::text, 'violet'::text, 'menthe'::text, 'bleu'::text]))),
  constraint "user_avatars_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint "user_avatars_pkey" PRIMARY KEY (id)
);
alter table public."user_avatars" enable row level security;

create table if not exists public."user_favorites" (
  "user_id" uuid not null,
  "job_id" text not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "user_favorites_job_id_check" CHECK ((job_id ~ '^[a-z_]{2,40}$'::text)),
  constraint "user_favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint "user_favorites_pkey" PRIMARY KEY (user_id, job_id)
);
alter table public."user_favorites" enable row level security;

create table if not exists public."user_profiles" (
  "user_id" uuid not null,
  "display_name" text not null default ''::text,
  "age_group" text not null default 'non_renseigne'::text,
  "updated_at" timestamp with time zone not null default now(),
  constraint "user_profiles_age_group_check" CHECK ((age_group = ANY (ARRAY['non_renseigne'::text, '8-11'::text, '12-15'::text, '16-18'::text, 'adulte'::text]))),
  constraint "user_profiles_display_name_check" CHECK ((char_length(display_name) <= 30)),
  constraint "user_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint "user_profiles_pkey" PRIMARY KEY (user_id)
);
alter table public."user_profiles" enable row level security;

-- Politiques RLS
create policy "admin_self_read" on public."admin_users" as permissive for select to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "premium_access_read_own" on public."premium_access" as permissive for select to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "premium_careers_admin_delete" on public."premium_careers" as permissive for delete to authenticated
  using ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))));
create policy "premium_careers_admin_insert" on public."premium_careers" as permissive for insert to authenticated
  with check ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))));
create policy "premium_careers_admin_read" on public."premium_careers" as permissive for select to authenticated
  using ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))));
create policy "premium_careers_admin_update" on public."premium_careers" as permissive for update to authenticated
  using ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))))
  with check ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))));
create policy "premium_careers_paid_only" on public."premium_careers" as permissive for select to authenticated
  using ((EXISTS ( SELECT 1
   FROM premium_access a
  WHERE ((a.user_id = ( SELECT auth.uid() AS uid)) AND (a.active = true)))));
create policy "premium_orders_read_own" on public."premium_orders" as permissive for select to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "history_self_delete" on public."quiz_history" as permissive for delete to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "history_self_insert" on public."quiz_history" as permissive for insert to authenticated
  with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "history_self_select" on public."quiz_history" as permissive for select to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "announcements_admin_delete" on public."site_announcements" as permissive for delete to authenticated
  using ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))));
create policy "announcements_admin_insert" on public."site_announcements" as permissive for insert to authenticated
  with check ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))));
create policy "announcements_admin_update" on public."site_announcements" as permissive for update to authenticated
  using ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))))
  with check ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))));
create policy "announcements_public_read" on public."site_announcements" as permissive for select to anon,authenticated
  using (((published = true) OR (EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid))))));
create policy "support_admin_update" on public."support_tickets" as permissive for update to authenticated
  using ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))))
  with check ((EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid)))));
create policy "support_delete_self" on public."support_tickets" as permissive for delete to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "support_insert_self" on public."support_tickets" as permissive for insert to authenticated
  with check (((( SELECT auth.uid() AS uid) = user_id) AND (status = 'ouvert'::text)));
create policy "support_read_own_and_admin" on public."support_tickets" as permissive for select to authenticated
  using (((( SELECT auth.uid() AS uid) = user_id) OR (EXISTS ( SELECT 1
   FROM admin_users a
  WHERE (a.user_id = ( SELECT auth.uid() AS uid))))));
create policy "avatars_self_delete" on public."user_avatars" as permissive for delete to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "avatars_self_insert" on public."user_avatars" as permissive for insert to authenticated
  with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "avatars_self_select" on public."user_avatars" as permissive for select to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "avatars_self_update" on public."user_avatars" as permissive for update to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id))
  with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "favorites_self_delete" on public."user_favorites" as permissive for delete to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "favorites_self_insert" on public."user_favorites" as permissive for insert to authenticated
  with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "favorites_self_select" on public."user_favorites" as permissive for select to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "profile_self_delete" on public."user_profiles" as permissive for delete to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "profile_self_insert" on public."user_profiles" as permissive for insert to authenticated
  with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "profile_self_select" on public."user_profiles" as permissive for select to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id));
create policy "profile_self_update" on public."user_profiles" as permissive for update to authenticated
  using ((( SELECT auth.uid() AS uid) = user_id))
  with check ((( SELECT auth.uid() AS uid) = user_id));

-- Fonctions
CREATE OR REPLACE FUNCTION public.consume_fullta_quota(p_user uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare changed integer;
begin
 if p_user is null then return false; end if;
 insert into public.fullta_rate_limits (user_id,bucket,used)
 values (p_user,date_trunc('hour',now()),1)
 on conflict (user_id,bucket) do update
 set used=public.fullta_rate_limits.used+1
 where public.fullta_rate_limits.used<20;
 get diagnostics changed = row_count;
 return changed=1;
end; $function$
;

-- Droits
grant select on public."admin_users" to authenticated;
grant select on public."premium_access" to authenticated;
grant select, insert, update, delete on public."premium_careers" to authenticated;
grant select on public."premium_orders" to authenticated;
grant select, insert, delete on public."quiz_history" to authenticated;
grant select on public."site_announcements" to anon;
grant update, delete, select, insert on public."site_announcements" to authenticated;
grant select, delete, insert, update on public."support_tickets" to authenticated;
grant insert, select, update, delete on public."user_avatars" to authenticated;
grant delete, insert, select, update on public."user_favorites" to authenticated;
grant delete, update, select, insert on public."user_profiles" to authenticated;
