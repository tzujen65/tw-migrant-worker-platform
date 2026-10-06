-- ==============================================================================
-- 台灣移工媒合平台：會員認證、Email 驗證開通與角色權限 (RBAC) 資料庫設定腳本
-- ==============================================================================

-- 1. 建立角色列舉型別 (User Roles)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'company_admin', 'user');
  END IF;
END$$;

-- 2. 建立 profiles 表格 (使用者詳細檔案與角色)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  company_name TEXT,
  company_tax_id TEXT,
  phone TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true, -- 申請公司管理者需經審核，一般使用者預設為 true
  email_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 3. 建立觸發器：新使用者透過 Supabase Auth 註冊時，自動建立 profiles 記錄
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role user_role := 'user';
  v_company_name text := null;
  v_company_tax_id text := null;
  v_phone text := null;
  v_full_name text := null;
  v_is_approved boolean := true;
BEGIN
  -- 從 auth.users 的 raw_user_meta_data 提取資料
  IF (new.raw_user_meta_data->>'role') = 'admin' THEN
    v_role := 'admin';
  ELSIF (new.raw_user_meta_data->>'role') = 'company_admin' THEN
    v_role := 'company_admin';
    v_is_approved := false; -- 公司管理者申請預設待審核
  ELSE
    v_role := 'user';
  END IF;

  v_company_name := new.raw_user_meta_data->>'company_name';
  v_company_tax_id := new.raw_user_meta_data->>'company_tax_id';
  v_phone := new.raw_user_meta_data->>'phone';
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    company_name,
    company_tax_id,
    phone,
    is_approved,
    email_confirmed,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    v_full_name,
    v_role,
    v_company_name,
    v_company_tax_id,
    v_phone,
    v_is_approved,
    new.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_confirmed = (new.email_confirmed_at IS NOT NULL),
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 綁定 Trigger 到 auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. 啟用 Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 所有人可讀取公開資料
DROP POLICY IF EXISTS "Public can view basic profiles" ON profiles;
CREATE POLICY "Public can view basic profiles"
  ON profiles FOR SELECT
  USING (true);

-- 使用者可更新自己的資料
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 系統最高管理者可更新任何帳號角色與狀態 (基於 metadata 或 role='admin')
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;
CREATE POLICY "Admin can manage all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==============================================================================
-- 5. 快速升級為最高管理者指令 (請將 your-admin-email@example.com 替換為您的 Email)
-- ==============================================================================
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'your-admin-email@example.com';
