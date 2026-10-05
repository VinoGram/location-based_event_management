# Database Schema Documentation

## Overview
Complete database schema for the Event Management Application with 13 tables supporting all features including OAuth authentication, premium subscriptions, AI recommendations, social features, and admin approval system.

## Core Tables

### 1. **users**
Primary user table with OAuth and premium support
- **OAuth Fields**: `oauth_provider`, `oauth_id`, `profile_picture`
- **Premium Fields**: `is_premium`, `premium_expiry_date`, `used_premium_discount`
- **Profile Fields**: `location`, `interests`, `preferred_categories`, `preferred_vibes`
- **Onboarding**: `onboarded`, `price_range`

### 2. **events**
Main events table with approval system
- **Location**: `latitude`, `longitude`, `venue`, `location_name`
- **Pricing**: `price`, `price_category`, `is_exclusive`
- **Admin**: `status` (pending/approved/rejected), `creator_id`
- **Content**: `title`, `description`, `category`, `date`, `time`, `tags`, `vibe`

## Engagement & Social Tables

### 3. **event_rsvps**
User responses to events
- Status: 'going', 'interested', 'not_going'
- Used for friend activity feeds

### 4. **saved_events**
User's saved/bookmarked events
- Simple many-to-many relationship

### 5. **event_ratings**
5-star rating system
- Constraint: rating between 1-5
- Used for AI recommendations

### 6. **event_comments**
User comments on events
- Includes sentiment analysis field
- Used for engagement scoring

### 7. **event_views**
View tracking for analytics
- Tracks when users view event details
- Used for engagement scoring

## AI & Recommendations

### 8. **user_engagement**
TikTok-style engagement tracking
- **Actions**: 'interested', 'rating_5', 'view_time', 'share', etc.
- **Scoring**: Positive/negative scores for AI recommendations
- **Values**: Additional context data
- **Duration**: Time spent viewing (for view_time actions)

## Social Features

### 9. **groups**
Private group planning
- Creator-owned groups for event planning

### 10. **group_members**
Group membership with roles
- Roles: 'admin', 'member'
- Unique constraint prevents duplicate memberships

### 11. **group_messages**
In-app chat for groups
- Premium feature for group communication

### 12. **friendships**
Friend system
- Status: 'pending', 'accepted', 'blocked'
- Bidirectional relationships

## Commerce

### 13. **ticket_purchases**
Ticket purchase tracking with discounts
- **Pricing**: `original_price`, `discount_percent`, `final_price`
- **Premium Logic**: 50% first purchase, then 10%
- **Free Users**: Always 10% discount

## Key Features Supported

### Authentication
- ✅ Email/password registration and login
- ✅ OAuth (Google, Facebook, Apple) via Supabase
- ✅ JWT token-based authentication

### Premium System
- ✅ Free tier: 50km radius, basic filtering
- ✅ Premium tier: Unlimited radius, advanced features
- ✅ Discount tracking for premium users

### AI Recommendations
- ✅ Content-based filtering (categories, venues, creators)
- ✅ Collaborative filtering (similar users)
- ✅ Engagement scoring system
- ✅ Cold start problem handling
- ✅ Real-time feedback loops

### Social Features
- ✅ Friend system with activity feeds
- ✅ Private group planning
- ✅ In-app messaging
- ✅ Event sharing and discussions

### Admin System
- ✅ Event approval workflow
- ✅ Admin authentication
- ✅ Pending events management

### Search & Discovery
- ✅ Intent recognition ("Friday", "chill vibes")
- ✅ Smart autocomplete
- ✅ Sentiment analysis
- ✅ Location-based search

## Performance Optimizations

### Indexes Created
- Events: date, category, location (lat/lng), status
- RSVPs: user_id, event_id
- Saved events: user_id
- Engagement: user_id, event_id
- Groups: group_id, user_id

### Sample Data Included
- 3 sample users (including admin)
- 5 sample events across different categories
- Ready for immediate testing

## Usage Instructions

1. **Run the SQL script** in your Supabase SQL editor
2. **Update environment variables** with your database credentials
3. **Start the backend server** to test API endpoints
4. **Configure OAuth providers** in Supabase dashboard (optional)

## Table Relationships

```
users (1) ←→ (many) events [creator_id]
users (1) ←→ (many) event_rsvps [user_id]
users (1) ←→ (many) saved_events [user_id]
users (1) ←→ (many) user_engagement [user_id]
users (1) ←→ (many) ticket_purchases [user_id]
users (1) ←→ (many) group_members [user_id]
users (1) ←→ (many) friendships [user_id, friend_id]

events (1) ←→ (many) event_rsvps [event_id]
events (1) ←→ (many) saved_events [event_id]
events (1) ←→ (many) event_ratings [event_id]
events (1) ←→ (many) event_comments [event_id]
events (1) ←→ (many) user_engagement [event_id]
events (1) ←→ (many) ticket_purchases [event_id]

groups (1) ←→ (many) group_members [group_id]
groups (1) ←→ (many) group_messages [group_id]
```

This schema supports all current features and is designed to scale with future enhancements.