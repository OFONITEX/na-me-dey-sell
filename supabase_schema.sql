-- =========================================================================
-- Nà Mè Dèy Sell — Complete Supabase PostgreSQL Schema & Realtime Setup
-- Copy and paste this script directly into your Supabase SQL Editor and click "Run".
-- =========================================================================

-- 1. Create the EVENTS table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT DEFAULT 'Parties / Nightlife',
  date TEXT NOT NULL,
  time TEXT,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  organizer TEXT NOT NULL,
  organizer_email TEXT,
  created_by TEXT,
  organizer_phone TEXT,
  badge TEXT,
  is_featured BOOLEAN DEFAULT false,
  live_sold_text TEXT,
  xp_reward INTEGER DEFAULT 50,
  going_count INTEGER DEFAULT 1,
  accent_color TEXT DEFAULT '#D4AF37',
  secondary_color TEXT DEFAULT '#10B981',
  image_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  banner_pattern TEXT,
  description TEXT,
  status TEXT DEFAULT 'live',
  tiers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the TICKETS table
CREATE TABLE IF NOT EXISTS public.tickets (
  ticket_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  tier_id TEXT,
  tier_name TEXT NOT NULL,
  tier_price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT '₦',
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'PAID',
  seat_number TEXT,
  status TEXT DEFAULT 'active',
  checked_in_at TIMESTAMPTZ,
  gate_staff TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the BANK_TRANSFERS table (for manual verification queue)
CREATE TABLE IF NOT EXISTS public.bank_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  reference_code TEXT NOT NULL,
  event_id TEXT,
  event_title TEXT,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  sender_name TEXT NOT NULL,
  sender_bank TEXT DEFAULT 'Opay',
  amount NUMERIC NOT NULL,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason TEXT,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transfers ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policies for anonymous/public access
CREATE POLICY "Allow public read access to events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert and update on events"
  ON public.events FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to tickets"
  ON public.tickets FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on tickets for gate admission"
  ON public.tickets FOR UPDATE
  USING (true);

CREATE POLICY "Allow public insert and read on bank transfers"
  ON public.bank_transfers FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Enable Realtime Replication for instant cross-device updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bank_transfers;

-- 7. Seed Initial Events (NAPHSS & Vibes Barn)
INSERT INTO public.events (
  id,
  title,
  subtitle,
  category,
  date,
  time,
  venue,
  city,
  address,
  organizer,
  organizer_email,
  created_by,
  organizer_phone,
  badge,
  is_featured,
  live_sold_text,
  xp_reward,
  going_count,
  accent_color,
  secondary_color,
  image_url,
  banner_pattern,
  description,
  tiers
) VALUES (
  'evt_naphss_dinner_night',
  'NAPHSS Annual Dinner & Awards Night 2026',
  'The most glamorous evening of celebrating academic excellence, leadership honors, red carpet elegance, and student fellowship.',
  'Parties / Nightlife',
  'Oct 24, 2026',
  '06:00 PM - 01:00 AM',
  'Emerald Grand Ballroom & Banquet Center',
  'Uyo, Akwa Ibom',
  'Plot 18 Banking District, Udo Udoma',
  'NAPHSS Executive Council',
  'iamrhobbinraynerhq01@gmail.com',
  'iamrhobbinraynerhq01@gmail.com',
  '+2348030000002',
  '👑 Featured • NAPHSS Gala Night',
  true,
  '148 tickets sold this week',
  90,
  312,
  '#D4AF37',
  '#10B981',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
  'linear-gradient(135deg, #070709 0%, #151d16 50%, #D4AF37 100%)',
  'The National Association of Public Health Science Students (NAPHSS) proudly presents the 2026 Annual Dinner & Awards Night! A night of distinction, elegance, fine dining, student awards, celebrity musical guests, comedy performances, and the crowning of Mr & Miss NAPHSS. Dress to inspire in your finest black-tie or royal traditional attire.',
  '[
    {
      "id": "tier_naphss_student",
      "name": "Standard Student Pass",
      "price": 3500,
      "currency": "₦",
      "capacity": 400,
      "soldCount": 310,
      "description": "Official banquet entry pass, 3-course dinner ticket, red carpet photo access, and digital QR pass.",
      "perks": ["Admission to main ballroom", "3-Course gourmet banquet dinner", "Red carpet photography access", "Official NAPHSS awards program brochure"]
    },
    {
      "id": "tier_naphss_vip",
      "name": "VIP Executive Delegate Pass",
      "price": 10000,
      "currency": "₦",
      "capacity": 100,
      "soldCount": 78,
      "description": "Expedited VIP registration, front-row reserved seat, complimentary cocktail & chops, and awards photo session.",
      "perks": ["Front-row VIP ballroom seating", "Executive cocktail & appetizer service", "Complimentary bottle of wine / champagne per table", "Exclusive photo op with award recipients"]
    },
    {
      "id": "tier_naphss_table",
      "name": "Patrons & Alumni Table of 8",
      "price": 60000,
      "currency": "₦",
      "capacity": 15,
      "soldCount": 12,
      "description": "Full table reserved for 8 alumni/dignitaries with 2 bottles of premium wine, specialized catering, and on-stage honors citation.",
      "perks": ["Reserved table for 8 persons", "2 Bottles of premium wine & mixers", "Dedicated table butler", "Official departmental alumni honors citation"]
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (
  id,
  title,
  subtitle,
  category,
  date,
  time,
  venue,
  city,
  address,
  organizer,
  organizer_email,
  created_by,
  organizer_phone,
  badge,
  live_sold_text,
  xp_reward,
  going_count,
  accent_color,
  secondary_color,
  image_url,
  banner_pattern,
  description,
  tiers
) VALUES (
  'evt_vibes_barn_afe_mbre',
  'Vibes Barn: Afe Mbre Festival',
  'The ultimate cultural groove, live music, beachside culinary feast, and Afro-fusion experience.',
  'Festival',
  'Sep 27, 2026',
  '08:00 PM - 04:00 AM',
  'Ibom Tropicana Entertainment Center',
  'Uyo, Akwa Ibom',
  'Udo Udoma Banking District',
  'Vibes Barn Global',
  'info@vibesbarn.com',
  'info@vibesbarn.com',
  '+2348039991122',
  '🔥 Trending Event',
  '24 tickets sold today',
  50,
  142,
  '#522672',
  '#ff8a65',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  'linear-gradient(135deg, #2D1B4E 0%, #522672 50%, #ff8a65 100%)',
  'Experience the vibrant rhythm of Afe Mbre. Featuring stellar live performances from top afrobeat sensations, high-energy DJ sets, local gourmet street food, cocktail lounges, and interactive light installations under the night sky.',
  '[
    {
      "id": "tier_regular",
      "name": "Regular Access",
      "price": 5000,
      "currency": "₦",
      "capacity": 1000,
      "soldCount": 840,
      "description": "Standard entry pass to main festival grounds, food village, and general stage arena.",
      "perks": ["Access to main stage & festival arena", "Digital scannable ticket pass", "+50 NMDS XP points"]
    },
    {
      "id": "tier_vip",
      "name": "VIP Lounge Pass",
      "price": 25000,
      "currency": "₦",
      "capacity": 250,
      "soldCount": 215,
      "description": "Elevated viewing deck, expedited entry gate, private lounge with complimentary welcome drinks.",
      "perks": ["Express VIP gate check-in", "Access to elevated VIP viewing deck", "Complimentary welcome drink & canapés", "Dedicated air-conditioned restrooms"]
    },
    {
      "id": "tier_table",
      "name": "VVIP Table of 8",
      "price": 250000,
      "currency": "₦",
      "capacity": 20,
      "soldCount": 16,
      "description": "Reserved front-row table for 8 guests, 2 premium bottles, dedicated server, and backstage photo passes.",
      "perks": ["Reserved table for 8 persons", "2 Premium spirits & mixers", "Dedicated table butler & security", "Backstage artist photo access"]
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;
