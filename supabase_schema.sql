-- InsightBridge Supabase PostgreSQL Database Schema
-- 이 스크립트는 Supabase 데이터베이스 설정 및 RLS(Row Level Security) 설정을 위해 사용됩니다.

-- 1. Profiles Table (사용자 추가 프로필 정보)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    role TEXT CHECK (role IN ('reader', 'creator', 'admin')) DEFAULT 'reader',
    bank_name TEXT, -- 정산 은행명
    account_number TEXT, -- 정산 계좌번호
    account_holder TEXT, -- 예금주명
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS 정책
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Posts Table (지식 콘텐츠 아티클 정보)
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- 유료 구독자용 전체 본문
    preview_content TEXT NOT NULL, -- 무료 공개용 본문 일부
    is_premium BOOLEAN DEFAULT false NOT NULL, -- 유료 아티클 여부
    category TEXT NOT NULL,
    status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts RLS 정책
-- 1. 누구나 published 상태의 무료 아티클 또는 preview_content는 볼 수 있음 (웹 구현 시 제어 가능하나, DB 보안을 위해 세부 설정 가능)
CREATE POLICY "Anyone can view published posts"
ON public.posts FOR SELECT
USING (status = 'published');

CREATE POLICY "Creators can insert their own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = creator_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'creator'
));

CREATE POLICY "Creators can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = creator_id);

-- 3. Subscriptions Table (독자 - 크리에이터 구독 관계)
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('active', 'canceled', 'expired')) DEFAULT 'active' NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_creator_sub UNIQUE (user_id, creator_id)
);

-- RLS 활성화
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions RLS 정책
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Creators can view their subscribers"
ON public.subscriptions FOR SELECT
USING (auth.uid() = creator_id);

-- 4. Payments Table (결제 로그)
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    status TEXT CHECK (status IN ('paid', 'failed', 'refunded')) DEFAULT 'paid' NOT NULL,
    pg_tid TEXT UNIQUE, -- PG사 거래 ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments RLS 정책
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

-- 5. Payouts Table (크리에이터 정산 이력 로그)
CREATE TABLE public.payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending' NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- RLS 활성화
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Payouts RLS 정책
CREATE POLICY "Admin can view all payouts"
ON public.payouts FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Creators can view their own payouts"
ON public.payouts FOR SELECT
USING (auth.uid() = creator_id);

-- 6. Trigger: auth.users 테이블에 신규 행 삽입 시 public.profiles에 자동 행 삽입
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'reader')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
