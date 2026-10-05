-- Event Management Application - Database Schema Updates
-- PostgreSQL Implementation for New Features

-- =============================================
-- 1. ALTER EXISTING EVENTS TABLE
-- =============================================

ALTER TABLE events ADD COLUMN analytics_views INT DEFAULT 0;
ALTER TABLE events ADD COLUMN analytics_engagement DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE events ADD COLUMN analytics_reach INT DEFAULT 0;
ALTER TABLE events ADD COLUMN analytics_last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE events ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN created_by VARCHAR(24);

ALTER TABLE events ADD COLUMN event_type VARCHAR(20) CHECK (event_type IN ('Concert', 'Festival', 'Workshop', 'Conference', 'Meetup', 'Party', 'Exhibition', 'Performance', 'Competition', 'Networking', 'Other')) DEFAULT 'Other';
ALTER TABLE events ADD COLUMN age_restriction VARCHAR(10) CHECK (age_restriction IN ('all', '18plus', '21plus', 'family', 'kids')) DEFAULT 'all';

ALTER TABLE events ADD COLUMN parking_available BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN parking_cost VARCHAR(100);
ALTER TABLE events ADD COLUMN parking_instructions TEXT;

-- =============================================
-- 2. CREATE NEW TABLES
-- =============================================

CREATE TABLE user_interactions (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    event_id VARCHAR(24) NOT NULL,
    interaction_type VARCHAR(20) CHECK (interaction_type IN ('click', 'save', 'share', 'purchase', 'view', 'rating')) NOT NULL,
    interaction_value DECIMAL(3,2),
    source VARCHAR(50),
    duration INT,
    device_type VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_recommendations (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    event_id VARCHAR(24) NOT NULL,
    score DECIMAL(3,2) NOT NULL,
    rec_type VARCHAR(20) CHECK (rec_type IN ('collaborative', 'content_based', 'trending', 'personalized')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

CREATE TABLE group_event_shares (
    id VARCHAR(24) PRIMARY KEY,
    group_id VARCHAR(24) NOT NULL,
    event_id VARCHAR(24) NOT NULL,
    shared_by VARCHAR(24) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE share_reactions (
    id VARCHAR(24) PRIMARY KEY,
    share_id VARCHAR(24) NOT NULL,
    user_id VARCHAR(24) NOT NULL,
    reaction_type VARCHAR(20) CHECK (reaction_type IN ('like', 'love', 'interested', 'going')) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (share_id, user_id)
);

CREATE TABLE offline_event_data (
    id VARCHAR(24) PRIMARY KEY,
    event_id VARCHAR(24) NOT NULL,
    user_id VARCHAR(24) NOT NULL,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_size INT,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(20) CHECK (sync_status IN ('downloaded', 'synced', 'outdated')) DEFAULT 'downloaded',
    UNIQUE (user_id, event_id)
);

CREATE TABLE event_accessibility (
    event_id VARCHAR(24) NOT NULL,
    accessibility_type VARCHAR(30) CHECK (accessibility_type IN ('wheelchair', 'sign_language', 'audio_description', 'large_print', 'quiet_space')) NOT NULL,
    PRIMARY KEY (event_id, accessibility_type)
);

CREATE TABLE event_languages (
    event_id VARCHAR(24) NOT NULL,
    language VARCHAR(20) CHECK (language IN ('English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Arabic', 'Hindi')) NOT NULL,
    PRIMARY KEY (event_id, language)
);

CREATE TABLE event_tags (
    event_id VARCHAR(24) NOT NULL,
    tag VARCHAR(20) CHECK (tag IN ('outdoor', 'indoor', 'live_music', 'food_drink', 'networking', 'educational', 'entertainment', 'cultural', 'charity', 'seasonal')) NOT NULL,
    PRIMARY KEY (event_id, tag)
);

CREATE TABLE venue_maps (
    id VARCHAR(24) PRIMARY KEY,
    event_id VARCHAR(24) NOT NULL,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(500),
    map_type VARCHAR(20) CHECK (map_type IN ('floor_plan', 'parking', 'emergency_exits')) NOT NULL
);

CREATE TABLE wifi_networks (
    id VARCHAR(24) PRIMARY KEY,
    event_id VARCHAR(24) NOT NULL,
    network_name VARCHAR(100) NOT NULL,
    password VARCHAR(100),
    is_public BOOLEAN DEFAULT TRUE
);

CREATE TABLE emergency_contacts (
    id VARCHAR(24) PRIMARY KEY,
    event_id VARCHAR(24) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50)
);

CREATE TABLE emergency_procedures (
    id VARCHAR(24) PRIMARY KEY,
    event_id VARCHAR(24) NOT NULL,
    procedure_text TEXT NOT NULL,
    procedure_order INT DEFAULT 1
);

CREATE TABLE recommendation_factors (
    id VARCHAR(24) PRIMARY KEY,
    recommendation_id VARCHAR(24) NOT NULL,
    factor_name VARCHAR(50) NOT NULL,
    weight DECIMAL(3,2) NOT NULL,
    factor_value DECIMAL(5,2) NOT NULL
);

-- =============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_events_analytics_views ON events(analytics_views);
CREATE INDEX idx_events_analytics_engagement ON events(analytics_engagement);
CREATE INDEX idx_user_timestamp ON user_interactions(user_id, timestamp);
CREATE INDEX idx_event_type ON user_interactions(event_id, interaction_type);
CREATE INDEX idx_user_score ON event_recommendations(user_id, score);
CREATE INDEX idx_expires ON event_recommendations(expires_at);
CREATE INDEX idx_group_created ON group_event_shares(group_id, created_at);
CREATE INDEX idx_venue_event ON venue_maps(event_id);
CREATE INDEX idx_wifi_event ON wifi_networks(event_id);
CREATE INDEX idx_emergency_event ON emergency_contacts(event_id);
CREATE INDEX idx_procedure_event ON emergency_procedures(event_id, procedure_order);
CREATE INDEX idx_events_event_type_category ON events(event_type, category);
CREATE INDEX idx_events_age_restriction ON events(age_restriction);
CREATE INDEX idx_events_created_by ON events(created_by);

-- =============================================
-- 4. DATA MIGRATION SCRIPTS
-- =============================================

UPDATE events SET 
    analytics_views = 0,
    analytics_engagement = 0.00,
    analytics_reach = 0,
    analytics_last_updated = CURRENT_TIMESTAMP,
    event_type = 'Other',
    age_restriction = 'all',
    parking_available = TRUE
WHERE analytics_views IS NULL;

INSERT INTO event_languages (event_id, language)
SELECT id, 'English' FROM events 
WHERE id NOT IN (SELECT event_id FROM event_languages);

-- =============================================
-- 5. POSTGRESQL FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION track_user_interaction(
    p_user_id VARCHAR(24),
    p_event_id VARCHAR(24),
    p_interaction_type VARCHAR(20),
    p_value DECIMAL(3,2) DEFAULT NULL,
    p_source VARCHAR(50) DEFAULT NULL,
    p_duration INT DEFAULT NULL,
    p_device_type VARCHAR(20) DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_interactions (
        id, user_id, event_id, interaction_type, interaction_value, source, duration, device_type
    ) VALUES (
        EXTRACT(EPOCH FROM NOW())::TEXT || RANDOM()::TEXT, p_user_id, p_event_id, p_interaction_type, p_value, p_source, p_duration, p_device_type
    );
    
    IF p_interaction_type = 'view' THEN
        UPDATE events SET 
            analytics_views = analytics_views + 1,
            analytics_last_updated = CURRENT_TIMESTAMP
        WHERE id = p_event_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_recommendations(
    p_user_id VARCHAR(24),
    p_limit INT DEFAULT 10
) RETURNS TABLE(
    event_data JSON,
    score DECIMAL(3,2),
    recommendation_type VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT row_to_json(e.*), er.score, er.rec_type
    FROM event_recommendations er
    JOIN events e ON er.event_id = e.id
    WHERE er.user_id = p_user_id 
    AND (er.expires_at IS NULL OR er.expires_at > CURRENT_TIMESTAMP)
    ORDER BY er.score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_event_analytics(
    p_event_id VARCHAR(24)
) RETURNS VOID AS $$
DECLARE
    total_interactions INT := 0;
    total_views INT := 0;
    engagement_rate DECIMAL(5,2) := 0.00;
BEGIN
    SELECT COUNT(*) INTO total_interactions
    FROM user_interactions 
    WHERE event_id = p_event_id;
    
    SELECT COUNT(*) INTO total_views
    FROM user_interactions 
    WHERE event_id = p_event_id AND interaction_type = 'view';
    
    IF total_views > 0 THEN
        engagement_rate := ((total_interactions - total_views)::DECIMAL / total_views) * 100;
    END IF;
    
    UPDATE events SET 
        analytics_views = total_views,
        analytics_engagement = engagement_rate,
        analytics_reach = total_interactions,
        analytics_last_updated = CURRENT_TIMESTAMP
    WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql;