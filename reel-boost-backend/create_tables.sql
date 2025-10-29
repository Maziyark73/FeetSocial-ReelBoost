-- ========================================
-- Supabase PostgreSQL Schema
-- Generated from Sequelize Models for ReelBoost
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CORE TABLES
-- ========================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name TEXT NOT NULL DEFAULT '',
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    user_name TEXT UNIQUE,
    email TEXT UNIQUE,
    country_code TEXT NOT NULL DEFAULT '',
    socket_id TEXT NOT NULL DEFAULT '',
    mobile_num TEXT,
    otp INTEGER NOT NULL DEFAULT 0,
    password TEXT NOT NULL DEFAULT ' ',
    login_type TEXT NOT NULL,
    profile_pic TEXT DEFAULT '',
    id_proof TEXT DEFAULT '',
    selfie TEXT DEFAULT '',
    dob DATE,
    gender TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT '',
    country_short_name TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    device_token TEXT NOT NULL DEFAULT '',
    profile_verification_status BOOLEAN NOT NULL DEFAULT false,
    login_verification_status BOOLEAN NOT NULL DEFAULT false,
    is_private BOOLEAN NOT NULL DEFAULT false,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    intrests TEXT[],
    available_coins BIGINT NOT NULL DEFAULT 0,
    account_name TEXT NOT NULL DEFAULT '',
    account_number TEXT NOT NULL DEFAULT '',
    bank_name TEXT NOT NULL DEFAULT '',
    swift_code TEXT NOT NULL DEFAULT '',
    IFSC_code TEXT NOT NULL DEFAULT '',
    total_socials INTEGER NOT NULL DEFAULT 0,
    blocked_by_admin BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    platforms TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Socials/Posts Table
CREATE TABLE IF NOT EXISTS socials (
    social_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    social_desc TEXT NOT NULL DEFAULT '',
    social_type TEXT NOT NULL DEFAULT '',
    aspect_ratio TEXT NOT NULL DEFAULT '',
    video_hight TEXT NOT NULL DEFAULT '',
    reel_thumbnail TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    total_views INTEGER NOT NULL DEFAULT 0,
    total_saves INTEGER NOT NULL DEFAULT 0,
    total_shares INTEGER NOT NULL DEFAULT 0,
    country TEXT NOT NULL DEFAULT '',
    status BOOLEAN NOT NULL DEFAULT true,
    deleted_by_user BOOLEAN NOT NULL DEFAULT false,
    hashtag TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_social_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    social_id INTEGER,
    comment_by INTEGER,
    comment TEXT NOT NULL DEFAULT '',
    comment_ref_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_comment_social FOREIGN KEY (social_id) REFERENCES socials(social_id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (comment_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Likes Table
CREATE TABLE IF NOT EXISTS likes (
    like_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    like_by INTEGER,
    social_id INTEGER,
    comment_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_like_user FOREIGN KEY (like_by) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_social FOREIGN KEY (social_id) REFERENCES socials(social_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_comment FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

-- Follows Table (Join table for user-follow-user)
CREATE TABLE IF NOT EXISTS follows (
    follow_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    follower_id INTEGER NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_follow_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Blocks Table (Join table for user-block-user)
CREATE TABLE IF NOT EXISTS blocks (
    block_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_block_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_block_blocked FOREIGN KEY (blocked_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Saves Table
CREATE TABLE IF NOT EXISTS saves (
    save_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    save_by INTEGER,
    social_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_save_user FOREIGN KEY (save_by) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_save_social FOREIGN KEY (social_id) REFERENCES socials(social_id) ON DELETE CASCADE
);

-- Media Table
CREATE TABLE IF NOT EXISTS medias (
    media_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    social_id INTEGER NOT NULL,
    media_type TEXT NOT NULL DEFAULT '',
    media_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_media_social FOREIGN KEY (social_id) REFERENCES socials(social_id) ON DELETE CASCADE
);

-- Taged Users Table
CREATE TABLE IF NOT EXISTS taged_users (
    taged_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    taged_user_id INTEGER,
    social_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_taged_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_taged_user FOREIGN KEY (taged_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_taged_social FOREIGN KEY (social_id) REFERENCES socials(social_id) ON DELETE CASCADE
);

-- ========================================
-- MESSAGING TABLES
-- ========================================

-- Chats Table
CREATE TABLE IF NOT EXISTS chats (
    chat_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chat_with_user_id INTEGER NOT NULL,
    is_group BOOLEAN NOT NULL DEFAULT false,
    group_name TEXT DEFAULT '',
    group_pic TEXT DEFAULT '',
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_chat_user FOREIGN KEY (chat_with_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    message_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chat_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT DEFAULT '',
    media_url TEXT DEFAULT '',
    media_type TEXT DEFAULT '',
    location_lat DECIMAL(10, 8),
    location_long DECIMAL(11, 8),
    location_name TEXT DEFAULT '',
    message_type TEXT NOT NULL DEFAULT 'text',
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_for_me BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_message_chat FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Message Seen Table
CREATE TABLE IF NOT EXISTS message_seens (
    message_seen_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_seen BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_seen_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    CONSTRAINT fk_seen_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Participants Table (for group chats)
CREATE TABLE IF NOT EXISTS participants (
    participant_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_participant_chat FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE,
    CONSTRAINT fk_participant_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ========================================
-- LIVE STREAMING TABLES
-- ========================================

-- Lives Table
CREATE TABLE IF NOT EXISTS lives (
    live_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    live_title TEXT DEFAULT '',
    live_thumbnail TEXT DEFAULT '',
    stream_url TEXT DEFAULT '',
    stream_key TEXT DEFAULT '',
    viewer_count INTEGER NOT NULL DEFAULT 0,
    is_live BOOLEAN NOT NULL DEFAULT false,
    status TEXT DEFAULT 'pending',
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_live_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Live Hosts Table
CREATE TABLE IF NOT EXISTS live_hosts (
    live_host_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    live_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_livehost_live FOREIGN KEY (live_id) REFERENCES lives(live_id) ON DELETE CASCADE,
    CONSTRAINT fk_livehost_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ========================================
-- GIFTS & TRANSACTIONS TABLES
-- ========================================

-- Gift Categories Table
CREATE TABLE IF NOT EXISTS gift_categories (
    gift_category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name TEXT NOT NULL,
    category_image TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gifts Table
CREATE TABLE IF NOT EXISTS gifts (
    gift_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gift_category_id INTEGER NOT NULL,
    gift_name TEXT NOT NULL,
    gift_image TEXT NOT NULL,
    gift_price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_gift_category FOREIGN KEY (gift_category_id) REFERENCES gift_categories(gift_category_id) ON DELETE CASCADE
);

-- Coin to Coin Transactions Table
CREATE TABLE IF NOT EXISTS coin_to_coins (
    transaction_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    gift_id INTEGER,
    social_id INTEGER,
    coins INTEGER NOT NULL DEFAULT 0,
    transaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_coin_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_coin_receiver FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_coin_gift FOREIGN KEY (gift_id) REFERENCES gifts(gift_id) ON DELETE SET NULL,
    CONSTRAINT fk_coin_social FOREIGN KEY (social_id) REFERENCES socials(social_id) ON DELETE SET NULL
);

-- Money Coin Transactions Table (recharges, withdrawals)
CREATE TABLE IF NOT EXISTS money_coin_transactions (
    transaction_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    coins INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    payment_method TEXT DEFAULT '',
    transaction_status TEXT DEFAULT 'pending',
    transaction_id_provider TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_money_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Transaction Plans Table (pricing tiers)
CREATE TABLE IF NOT EXISTS transaction_plans (
    plan_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    plan_name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    coins INTEGER NOT NULL,
    bonus_coins INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Configuration Table
CREATE TABLE IF NOT EXISTS transaction_confs (
    config_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MUSIC TABLES
-- ========================================

-- Music Table
CREATE TABLE IF NOT EXISTS musics (
    music_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    music_name TEXT NOT NULL,
    music_artist TEXT DEFAULT '',
    music_image TEXT DEFAULT '',
    music_file TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- NOTIFICATIONS & REPORTS
-- ========================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id INTEGER,
    reciever_id INTEGER NOT NULL,
    notification_type TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT false,
    reference_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_notif_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_receiver FOREIGN KEY (reciever_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Broadcast Push Notifications Table
CREATE TABLE IF NOT EXISTS broadcast_push_notifications (
    notification_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    target_audience TEXT DEFAULT 'all',
    sent_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Types Table
CREATE TABLE IF NOT EXISTS report_types (
    report_type_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_type_name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    report_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_by INTEGER NOT NULL,
    report_to INTEGER NOT NULL,
    report_type_id INTEGER NOT NULL,
    report_description TEXT DEFAULT '',
    social_id INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_report_by FOREIGN KEY (report_by) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_report_to FOREIGN KEY (report_to) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_report_type FOREIGN KEY (report_type_id) REFERENCES report_types(report_type_id) ON DELETE CASCADE
);

-- Reported Socials Table
CREATE TABLE IF NOT EXISTS reportedsocials (
    reported_social_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reported_by INTEGER NOT NULL,
    social_id INTEGER NOT NULL,
    report_reason TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_reported_by FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reported_social FOREIGN KEY (social_id) REFERENCES socials(social_id) ON DELETE CASCADE
);

-- Actions Table
CREATE TABLE IF NOT EXISTS actions (
    action_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action_by INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    target_id INTEGER,
    action_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_action_user FOREIGN KEY (action_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ========================================
-- CONTENT MODERATION & ADMIN
-- ========================================

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    admin_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_name TEXT NOT NULL,
    admin_email TEXT UNIQUE NOT NULL,
    admin_password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avatars Table
CREATE TABLE IF NOT EXISTS avatars (
    avatar_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    avatar_name TEXT NOT NULL,
    avatar_image TEXT NOT NULL,
    avatar_gender TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hashtags Table
CREATE TABLE IF NOT EXISTS hashtags (
    hashtag_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hashtag_name TEXT UNIQUE NOT NULL,
    hashtag_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Countries Table
CREATE TABLE IF NOT EXISTS countries (
    country_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    country_flag TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Languages Table
CREATE TABLE IF NOT EXISTS languages (
    language_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    language TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Language Translations Table
CREATE TABLE IF NOT EXISTS language_translations (
    key_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    language TEXT NOT NULL,
    translation_key TEXT NOT NULL,
    translation_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_lang_trans_lang FOREIGN KEY (language) REFERENCES languages(language) ON DELETE CASCADE
);

-- Project Configuration Table
CREATE TABLE IF NOT EXISTS project_confs (
    config_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- E-COMMERCE (if applicable)
-- ========================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_description TEXT DEFAULT '',
    product_price DECIMAL(10, 2) NOT NULL,
    product_category TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_product_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Product Media Table
CREATE TABLE IF NOT EXISTS product_medias (
    product_media_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id INTEGER NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_productmedia_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(user_name);
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_socials_user ON socials(user_id);
CREATE INDEX IF NOT EXISTS idx_socials_status ON socials(status);
CREATE INDEX IF NOT EXISTS idx_socials_deleted ON socials(deleted_by_user);

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_comments_social ON comments(social_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(comment_by);

-- Like indexes
CREATE INDEX IF NOT EXISTS idx_likes_social ON likes(social_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(like_by);
CREATE INDEX IF NOT EXISTS idx_likes_comment ON likes(comment_id);

-- Follow indexes
CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_receiver ON notifications(reciever_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Live indexes
CREATE INDEX IF NOT EXISTS idx_lives_user ON lives(user_id);
CREATE INDEX IF NOT EXISTS idx_lives_status ON lives(is_live);

-- ========================================
-- SET DEFAULT TIMESTAMPS TRIGGER
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%s_updated_at 
                       BEFORE UPDATE ON %I 
                       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', 
                       tbl, tbl);
    END LOOP;
END $$;

