-- ============================================================================
-- SIAM Portfolio - Supabase backend schema
-- Run this ONCE in the Supabase Dashboard -> SQL Editor -> New query.
-- It creates:
--   1. projects      (CMS - add/edit/delete projects from the admin panel)
--   2. visitor_logs  (tracking system - all visitor data, incl. GEO coords)
--   3. the storage bucket used by the admin image uploader
--   4. the 3 existing frontend projects as seed rows, so the public site
--      keeps looking exactly the same the moment this schema is applied.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) PROJECTS TABLE (CMS)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                -- URL id: /projects/<slug>
  title text not null,
  description text,
  image_url text,                           -- local path or full https URL
  tech text[] not null default '{}',        -- tech stack pills
  features text[] not null default '{}',    -- Key Features list
  challenges text[] not null default '{}',  -- Challenges Faced list
  improvements text[] not null default '{}',-- Future Improvements list
  github_url text,
  live_url text,
  coming_soon boolean not null default false,
  sort_order integer not null default 0,    -- card order on the homepage
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
-- intentionally no public policies: reads/writes go through the Next.js
-- server with the service role key, so the table is invisible to the public.

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2) VISITOR LOGS TABLE (TRACKING SYSTEM)
-- ---------------------------------------------------------------------------
create table if not exists public.visitor_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor_id text,                          -- anonymous persistent cookie id
  path text,                                -- visited page
  method text,
  ip text,
  user_agent text,
  browser text,                             -- parsed from user agent
  os text,
  device text,                              -- Desktop / Mobile / Tablet / Bot
  is_bot boolean not null default false,
  referer text,
  accept_language text,
  country text,
  country_code text,
  region text,
  city text,
  latitude double precision,                -- GEO coordinates
  longitude double precision,
  timezone text,
  isp text,
  org text,
  proxy_host boolean,                       -- proxy/VPN detected?
  hosting boolean                           -- datacenter IP?
);

alter table public.visitor_logs enable row level security;
-- no public policies - only the server (service role) can read/write.

create index if not exists visitor_logs_created_at_idx
  on public.visitor_logs (created_at desc);
create index if not exists visitor_logs_ip_idx
  on public.visitor_logs (ip);
create index if not exists visitor_logs_country_idx
  on public.visitor_logs (country_code);

-- ---------------------------------------------------------------------------
-- 3) STORAGE BUCKET for admin image uploads
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 4) SEED: the current frontend projects, so nothing changes visually
--    (on conflict = safe to re-run)
-- ---------------------------------------------------------------------------
insert into public.projects
  (slug, title, description, image_url, tech, features, challenges, improvements, github_url, live_url, coming_soon, sort_order)
values
  (
    'branch-office-network',
    'Branch Office Network Implementation',
    'A simulated enterprise branch-office network engineered in Cisco Packet Tracer, demonstrating Layer 2 switching, IEEE 802.1Q VLAN segmentation, and endpoint IP connectivity.',
    '/branch-office-network.png',
    $p${"Cisco Packet Tracer","VLAN Segmentation","802.1Q Trunking","IPv4 Subnetting","Ethernet Switching"}$p$::text[],
    $p${
      "Segmented department endpoints into dedicated VLANs (VLAN 10 and VLAN 20) to isolate broadcast domains and enhance LAN security.",
      "Configured 802.1Q trunking on the inter-switch link (ISL) to transport multi-VLAN traffic between distribution switches.",
      "Implemented a structured IPv4 static addressing scheme with default gateway configurations across all end workstations.",
      "Verified network health using ICMP ping diagnostics, ARP table inspection, and MAC address table mapping."
    }$p$::text[],
    $p${
      "Isolating inter-VLAN broadcast storms while verifying full transparency over switch-to-switch trunk links.",
      "Diagnosing endpoint communication failures caused by trunk encapsulation mismatches and access port assignment errors."
    }$p$::text[],
    $p${
      "Configure Router-on-a-Stick (ROAS) or Layer 3 Switch SVI for controlled inter-VLAN communication.",
      "Implement dynamic IP configuration via DHCP with DHCP Snooping to mitigate rogue DHCP threats.",
      "Enable Cisco Port Security on access ports to enforce MAC-level endpoint restrictions."
    }$p$::text[],
    'https://github.com/osama95uh/Branch-office-network-using-Cisco-Packet-Tracer.git',
    null,
    false,
    0
  ),
  (
    'upcoming-network-lab',
    'Active Directory & Enterprise Helpdesk Lab',
    'A virtualized IT support environment focusing on Windows Server 2022 Active Directory DS, Group Policy Objects (GPO), user onboarding, and remote assistance.',
    '/network-coming-soon.svg',
    $p${"Windows Server","Active Directory","Group Policy","DNS / DHCP","Helpdesk Support"}$p$::text[],
    '{}'::text[], '{}'::text[], '{}'::text[],
    null, null,
    true,
    1
  ),
  (
    'upcoming-infrastructure-project',
    'Multi-Branch Routing & Firewall Support Lab',
    'A routed network lab featuring inter-VLAN routing, NAT/PAT, ACL firewall security policies, and Wireshark packet capture analysis for rapid fault isolation.',
    '/network-coming-soon.svg',
    $p${"Inter-VLAN Routing","NAT / PAT","ACL Firewalls","Wireshark","Network Troubleshooting"}$p$::text[],
    '{}'::text[], '{}'::text[], '{}'::text[],
    null, null,
    true,
    2
  )
on conflict (slug) do nothing;
