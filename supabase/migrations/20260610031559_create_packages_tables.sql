-- Profiles table for satpam users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'satpam',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name TEXT NOT NULL,
  recipient_room TEXT,
  sender_name TEXT NOT NULL,
  sender_relation TEXT,
  contents TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_by UUID REFERENCES profiles(id),
  notes TEXT,
  
  -- Pickup info
  picked_up_by TEXT,
  pickup_method TEXT CHECK (pickup_method IN ('pemilik', 'orang_lain')),
  picker_name TEXT,
  picker_relation TEXT,
  picked_up_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'masuk' CHECK (status IN ('masuk', 'diambil', 'done')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Packages policies - satpam can manage all packages
CREATE POLICY "select_packages" ON packages FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_packages" ON packages FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_packages" ON packages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_packages" ON packages FOR DELETE
  TO authenticated USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
