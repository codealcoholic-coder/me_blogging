# 🗄️ Complete Database Schema & Configuration

## Database: MongoDB (blog_db)

### Collections Overview

1. **users** - User accounts (OAuth & email)
2. **posts** - Blog articles
3. **categories** - Post categories
4. **tags** - Post tags
5. **comments** - User comments on posts
6. **highlights** - User text highlights
7. **bookmarks** - Saved/pinned posts
8. **likes** - Post upvotes
9. **notifications** - User notifications
10. **sessions** - NextAuth sessions
11. **accounts** - OAuth accounts

---

## 📋 Detailed Schemas

### 1. Users Collection

```javascript
{
  _id: ObjectId,
  id: UUID,                          // App ID
  email: String (unique, required),
  password: String (hashed, optional), // For email auth
  name: String (required),
  role: String,                      // 'admin' | 'user'
  token: UUID,                       // Session token
  avatar_url: String,
  email_verified: Boolean,
  provider: String,                  // 'google' | 'microsoft' | 'email'
  provider_account_id: String,       // OAuth provider ID
  created_at: Date,
  updated_at: Date,
  last_login: Date
}
```

**Indexes:**
- `email` (unique)
- `id` (unique)
- `token`
- `provider_account_id`

---

### 2. Posts Collection

```javascript
{
  _id: ObjectId,
  id: UUID (unique),
  title: String (required),
  slug: String (unique, required),
  excerpt: String,
  content: String (HTML from Tiptap, required),
  featured_image: String (URL),
  featured_video: String (URL),
  
  // Organization
  category: String,
  category_id: UUID,
  tags: Array<String>,
  
  // Author
  author_id: UUID (required),
  author_name: String,
  author_avatar: String,
  
  // Publishing
  status: String,                    // 'draft' | 'published' | 'archived'
  published_at: Date,
  scheduled_at: Date,
  
  // Engagement
  view_count: Number (default: 0),
  like_count: Number (default: 0),
  comment_count: Number (default: 0),
  bookmark_count: Number (default: 0),
  
  // Meta
  reading_time_minutes: Number,
  meta_title: String,
  meta_description: String,
  canonical_url: String,
  
  // Settings
  allow_comments: Boolean (default: true),
  is_featured: Boolean (default: false),
  
  // Embedded content
  embedded_notebooks: Array<{
    type: String,                    // 'colab' | 'kaggle' | 'github'
    url: String,
    title: String
  }>,
  
  // Timestamps
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `slug` (unique)
- `id` (unique)
- `author_id`
- `status`
- `published_at` (descending)
- `category_id`
- `tags` (multikey)

---

### 3. Categories Collection

```javascript
{
  _id: ObjectId,
  id: UUID (unique),
  name: String (unique, required),
  slug: String (unique, required),
  description: String,
  color: String,                     // Hex color code
  icon: String,
  sort_order: Number (default: 0),
  post_count: Number (default: 0),
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `slug` (unique)
- `id` (unique)
- `sort_order`

---

### 4. Tags Collection

```javascript
{
  _id: ObjectId,
  id: UUID (unique),
  name: String (unique, required),
  slug: String (unique, required),
  post_count: Number (default: 0),
  created_at: Date
}
```

**Indexes:**
- `slug` (unique)
- `id` (unique)
- `name`

---

### 5. Comments Collection

```javascript
{
  _id: ObjectId,
  id: UUID (unique),
  post_id: UUID (required),
  user_id: UUID (required),
  
  // Author info (denormalized for performance)
  author_name: String,
  author_email: String,
  author_avatar: String,
  
  // Content
  content: String (required),
  
  // Threading
  parent_id: UUID,                   // For replies
  depth: Number (default: 0),        // Nesting level
  
  // Moderation
  status: String,                    // 'pending' | 'approved' | 'spam' | 'deleted'
  
  // Engagement
  like_count: Number (default: 0),
  reply_count: Number (default: 0),
  
  // Timestamps
  created_at: Date,
  updated_at: Date,
  edited_at: Date
}
```

**Indexes:**
- `post_id`
- `user_id`
- `parent_id`
- `status`
- `created_at` (descending)

---

### 6. Highlights Collection

```javascript
{
  _id: ObjectId,
  id: UUID (unique),
  user_id: UUID (required),
  post_id: UUID (required),
  
  // Highlighted text
  text: String (required),
  
  // Position tracking
  start_offset: Number,
  end_offset: Number,
  selected_html: String,
  
  // Styling
  color: String (default: 'yellow'), // 'yellow' | 'green' | 'blue' | 'pink'
  
  // Optional note
  note: String,
  
  // Timestamps
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `user_id`
- `post_id`
- `created_at` (descending)
- Compound: `[user_id, post_id]`

---

### 7. Bookmarks Collection

```javascript
{
  _id: ObjectId,
  id: UUID (unique),
  user_id: UUID (required),
  post_id: UUID (required),
  
  // Post info (denormalized)
  post_title: String,
  post_slug: String,
  post_excerpt: String,
  post_image: String,
  
  // Organization
  folder: String,                    // For future folder feature
  tags: Array<String>,               // Personal tags
  
  // Notes
  notes: String,
  
  // Timestamps
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `user_id`
- `post_id`
- `created_at` (descending)
- Compound unique: `[user_id, post_id]`

---

### 8. Likes Collection

```javascript
{
  _id: ObjectId,
  id: UUID (unique),
  user_id: UUID (required),
  post_id: UUID (required),
  type: String,                      // 'post' | 'comment'
  target_id: UUID,                   // post_id or comment_id
  created_at: Date
}
```

**Indexes:**
- `user_id`
- `post_id`
- `target_id`
- `type`
- Compound unique: `[user_id, target_id, type]`

---

### 9. Notifications Collection

```javascript
{
  _id: ObjectId,
  id: UUID (unique),
  user_id: UUID (required),
  
  // Notification details
  type: String (required),           // 'comment' | 'reply' | 'like' | 'new_post' | 'welcome'
  title: String (required),
  message: String (required),
  
  // Related entities
  post_id: UUID,
  comment_id: UUID,
  sender_id: UUID,
  sender_name: String,
  sender_avatar: String,
  
  // Link
  action_url: String,                // Where to go when clicked
  
  // Status
  read: Boolean (default: false),
  read_at: Date,
  
  // Timestamps
  created_at: Date,
  expires_at: Date                   // Optional expiration
}
```

**Indexes:**
- `user_id`
- `read`
- `created_at` (descending)
- Compound: `[user_id, read]`

---

### 10. Sessions Collection (NextAuth)

```javascript
{
  _id: ObjectId,
  sessionToken: String (unique, required),
  userId: UUID (required),
  expires: Date (required),
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `sessionToken` (unique)
- `userId`
- `expires`

---

### 11. Accounts Collection (NextAuth OAuth)

```javascript
{
  _id: ObjectId,
  userId: UUID (required),
  type: String (required),           // 'oauth' | 'email'
  provider: String (required),       // 'google' | 'microsoft' | 'credentials'
  providerAccountId: String (required),
  
  // OAuth tokens
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
  
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `userId`
- Compound unique: `[provider, providerAccountId]`

---

## 🔐 Password Hashing Configuration

### Using bcryptjs

```javascript
import bcrypt from 'bcryptjs'

// Hash password
const saltRounds = 12
const hashedPassword = await bcrypt.hash(password, saltRounds)

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword)
```

**Security Settings:**
- Salt rounds: 12 (good balance of security and performance)
- Never store plain text passwords
- Always hash before saving to database

---

## 🔑 OAuth Configuration

### Environment Variables Required

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=blog_db
```

### OAuth Provider Setup

**Google:**
1. Go to: https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

**Microsoft:**
1. Go to: https://portal.azure.com/
2. App registrations > New registration
3. Add redirect URI:
   - `http://localhost:3000/api/auth/callback/microsoft`
   - `https://yourdomain.com/api/auth/callback/microsoft`
4. Create client secret
5. API permissions: User.Read

---

## 📊 Sample Data Relationships

### Post with Full Relations

```javascript
{
  post: {
    id: "post-123",
    title: "Machine Learning Basics",
    author_id: "user-456",
    category_id: "cat-789"
  },
  
  // Relations
  author: users.findOne({ id: "user-456" }),
  category: categories.findOne({ id: "cat-789" }),
  comments: comments.find({ post_id: "post-123" }),
  likes: likes.countDocuments({ post_id: "post-123" }),
  bookmarks: bookmarks.find({ post_id: "post-123" }),
  highlights: highlights.find({ post_id: "post-123", user_id: currentUserId })
}
```

---

## 🚀 Database Initialization Script

```javascript
// scripts/init-db.js
const { MongoClient } = require('mongodb')

async function initializeDatabase() {
  const client = new MongoClient(process.env.MONGO_URL)
  await client.connect()
  const db = client.db(process.env.DB_NAME)
  
  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('users').createIndex({ id: 1 }, { unique: true })
  
  await db.collection('posts').createIndex({ slug: 1 }, { unique: true })
  await db.collection('posts').createIndex({ published_at: -1 })
  await db.collection('posts').createIndex({ author_id: 1 })
  
  await db.collection('comments').createIndex({ post_id: 1 })
  await db.collection('comments').createIndex({ user_id: 1 })
  
  await db.collection('highlights').createIndex({ user_id: 1, post_id: 1 })
  await db.collection('bookmarks').createIndex({ user_id: 1, post_id: 1 }, { unique: true })
  await db.collection('likes').createIndex({ user_id: 1, target_id: 1, type: 1 }, { unique: true })
  
  await db.collection('notifications').createIndex({ user_id: 1, read: 1 })
  
  await db.collection('sessions').createIndex({ sessionToken: 1 }, { unique: true })
  await db.collection('accounts').createIndex({ provider: 1, providerAccountId: 1 }, { unique: true })
  
  console.log('✅ Database indexes created successfully!')
  
  await client.close()
}

initializeDatabase()
```

---

## 📈 Performance Optimizations

### 1. Denormalization Strategy
- Store author name/avatar in posts for quick display
- Store post title/slug in bookmarks
- Cache like counts, comment counts

### 2. Indexing Strategy
- Compound indexes for common queries
- Sort indexes for list pages
- Unique indexes for constraints

### 3. Aggregation Pipelines
```javascript
// Get posts with engagement stats
db.posts.aggregate([
  { $match: { status: 'published' } },
  {
    $lookup: {
      from: 'likes',
      localField: 'id',
      foreignField: 'post_id',
      as: 'likes'
    }
  },
  {
    $lookup: {
      from: 'comments',
      localField: 'id',
      foreignField: 'post_id',
      as: 'comments'
    }
  },
  {
    $addFields: {
      like_count: { $size: '$likes' },
      comment_count: { $size: '$comments' }
    }
  },
  { $sort: { published_at: -1 } },
  { $limit: 10 }
])
```

---

## 🔒 Security Considerations

1. **Password Storage**
   - Always use bcrypt with salt rounds ≥ 12
   - Never log passwords
   - Rate limit login attempts

2. **OAuth Tokens**
   - Store refresh tokens securely
   - Encrypt sensitive fields
   - Set appropriate expiration times

3. **User Data**
   - Validate all inputs
   - Sanitize HTML content
   - Implement CSRF protection

4. **API Security**
   - Authenticate all write operations
   - Implement rate limiting
   - Validate user permissions

---

## 📝 Migration Notes

When updating schema:
1. Create migration script
2. Test on staging first
3. Backup production data
4. Run migration during low traffic
5. Verify data integrity

---

This schema supports all requested features:
✅ Admin content creation with rich editor
✅ User text highlighting and saving
✅ Comments on articles
✅ Post upvoting/likes
✅ OAuth (Google, Microsoft) + Email auth
✅ Password hashing (bcrypt)
✅ Bookmarks/pinning
✅ Notifications
✅ Full user engagement tracking
