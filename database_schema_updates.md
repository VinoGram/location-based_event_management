# Database Schema Updates for New Features

## 1. Events Collection Updates

### Add Analytics Fields
```javascript
analytics: {
  views: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 }, // Percentage
  reach: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}
```

### Add Ownership & Admin Fields
```javascript
isOwner: { type: Boolean, default: false },
isAdmin: { type: Boolean, default: false },
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
```

### Add Enhanced Filtering Fields
```javascript
eventType: { 
  type: String, 
  enum: ["Concert", "Festival", "Workshop", "Conference", "Meetup", "Party", "Exhibition", "Performance", "Competition", "Networking"],
  default: "Other"
},
accessibility: [{
  type: String,
  enum: ["Wheelchair Accessible", "Sign Language Interpreter", "Audio Description", "Large Print Materials", "Quiet Space Available"]
}],
ageRestriction: {
  type: String,
  enum: ["", "18+", "21+", "family", "kids"],
  default: ""
},
language: [{
  type: String,
  enum: ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Arabic", "Hindi"]
}],
tags: [{
  type: String,
  enum: ["Outdoor", "Indoor", "Live Music", "Food & Drink", "Networking", "Educational", "Entertainment", "Cultural", "Charity", "Seasonal"]
}]
```

### Add Offline Support Fields
```javascript
offlineData: {
  venueMaps: [{
    name: String,
    url: String,
    type: { type: String, enum: ["floor_plan", "parking", "emergency_exits"] }
  }],
  wifiNetworks: [{
    name: String,
    password: String,
    isPublic: { type: Boolean, default: true }
  }],
  emergencyInfo: {
    contacts: [{
      name: String,
      phone: String,
      role: String
    }],
    procedures: [String],
    exits: [String],
    meetingPoints: [String]
  },
  parkingInfo: {
    available: { type: Boolean, default: true },
    cost: String,
    instructions: String,
    alternatives: [String]
  }
}
```

## 2. New Collections

### User Interactions Collection
```javascript
const userInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  interactionType: { 
    type: String, 
    enum: ['click', 'save', 'share', 'purchase', 'view', 'rating'],
    required: true 
  },
  value: Number, // For ratings or other numeric values
  timestamp: { type: Date, default: Date.now },
  metadata: {
    source: String, // Where the interaction came from
    duration: Number, // Time spent viewing
    deviceType: String
  }
});
```

### Event Recommendations Collection
```javascript
const eventRecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  score: { type: Number, required: true }, // 0-1 recommendation score
  type: { 
    type: String, 
    enum: ['collaborative', 'content_based', 'trending', 'personalized'],
    required: true 
  },
  factors: [{
    name: String,
    weight: Number,
    value: Number
  }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7*24*60*60*1000) } // 7 days
});
```

### Group Event Shares Collection
```javascript
const groupEventShareSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['like', 'love', 'interested', 'going'] },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
```

### Offline Event Data Collection
```javascript
const offlineEventDataSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloadedAt: { type: Date, default: Date.now },
  dataSize: Number, // Size in bytes
  lastAccessed: { type: Date, default: Date.now },
  syncStatus: { 
    type: String, 
    enum: ['downloaded', 'synced', 'outdated'],
    default: 'downloaded'
  }
});
```

## 3. API Endpoints to Implement

### Analytics Endpoints
```javascript
// Track event view
POST /api/events/:eventId/analytics/view

// Get event analytics (owner/admin only)
GET /api/events/:eventId/analytics

// Update event analytics
PUT /api/events/:eventId/analytics
```

### Interaction Tracking Endpoints
```javascript
// Track user interaction
POST /api/interactions
Body: { eventId, interactionType, value?, metadata? }

// Get user interactions
GET /api/users/:userId/interactions

// Get event interactions
GET /api/events/:eventId/interactions
```

### Recommendation Endpoints
```javascript
// Get personalized recommendations
GET /api/recommendations/personalized?limit=12

// Get content-based recommendations
GET /api/recommendations/similar/:eventId?limit=3

// Get trending events
GET /api/recommendations/trending?limit=8
```

### Offline Data Endpoints
```javascript
// Download event for offline access
POST /api/events/:eventId/offline/download

// Check offline availability
GET /api/events/:eventId/offline/status

// Get offline event data
GET /api/events/:eventId/offline/data
```

### Group Sharing Endpoints
```javascript
// Share event to group
POST /api/groups/:groupId/share-event
Body: { eventId, message? }

// Get group shared events
GET /api/groups/:groupId/shared-events

// React to shared event
POST /api/groups/:groupId/shared-events/:shareId/react
Body: { type }
```

## 4. Database Indexes for Performance

```javascript
// User Interactions
db.userinteractions.createIndex({ userId: 1, timestamp: -1 });
db.userinteractions.createIndex({ eventId: 1, interactionType: 1 });

// Event Recommendations
db.eventrecommendations.createIndex({ userId: 1, score: -1 });
db.eventrecommendations.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Events - Enhanced filtering
db.events.createIndex({ eventType: 1, category: 1 });
db.events.createIndex({ accessibility: 1 });
db.events.createIndex({ ageRestriction: 1 });
db.events.createIndex({ language: 1 });
db.events.createIndex({ tags: 1 });

// Analytics
db.events.createIndex({ "analytics.views": -1 });
db.events.createIndex({ "analytics.engagement": -1 });
```

## 5. Migration Scripts

### Update Existing Events
```javascript
// Add default values for new fields
db.events.updateMany(
  {},
  {
    $set: {
      analytics: { views: 0, engagement: 0, reach: 0, lastUpdated: new Date() },
      eventType: "Other",
      accessibility: [],
      ageRestriction: "",
      language: ["English"],
      tags: [],
      offlineData: {
        venueMaps: [],
        wifiNetworks: [],
        emergencyInfo: { contacts: [], procedures: [], exits: [], meetingPoints: [] },
        parkingInfo: { available: true, cost: "", instructions: "", alternatives: [] }
      }
    }
  }
);
```

### Set Owner Flags
```javascript
// Set isOwner flag for event creators
db.events.updateMany(
  {},
  [
    {
      $set: {
        isOwner: { $eq: ["$creator._id", "$userId"] }, // Assuming userId is current user
        createdBy: "$creator._id"
      }
    }
  ]
);
```

## 6. Environment Variables

Add to `.env`:
```
# Recommendation System
RECOMMENDATION_REFRESH_INTERVAL=3600000  # 1 hour in ms
MAX_RECOMMENDATIONS_PER_USER=50

# Analytics
ANALYTICS_BATCH_SIZE=100
ANALYTICS_UPDATE_INTERVAL=300000  # 5 minutes

# Offline Data
MAX_OFFLINE_DATA_SIZE=50MB
OFFLINE_DATA_RETENTION_DAYS=30
```

## Implementation Priority

1. **High Priority**: Analytics system, Enhanced filtering, Interaction tracking
2. **Medium Priority**: Recommendation system, Group sharing
3. **Low Priority**: Offline data system (complex implementation)

## Notes

- All new fields are optional to maintain backward compatibility
- Indexes should be created during low-traffic periods
- Consider implementing analytics in batches to avoid performance issues
- Recommendation system may require machine learning model integration
- Offline data system requires careful consideration of storage limits