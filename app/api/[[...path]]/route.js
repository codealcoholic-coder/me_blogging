import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'blog_db')
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Get user from token
async function getUserFromToken(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)
  const db = await connectToMongo()
  const user = await db.collection('users').findOne({ token })
  return user
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Blog API Ready" }))
    }

    // ============ AUTH ROUTES ============
    
    // Register new user
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json()
      const { email, password, name } = body

      // Check if user exists
      const existingUser = await db.collection('users').findOne({ email })
      if (existingUser) {
        return handleCORS(NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        ))
      }

      const token = uuidv4()
      const user = {
        id: uuidv4(),
        email,
        password, // In production, hash this!
        name,
        role: 'user', // 'user' or 'admin'
        token,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('users').insertOne(user)
      const { _id, password: _, ...userData } = user
      return handleCORS(NextResponse.json({ success: true, token, user: userData }))
    }

    // Login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const { email, password } = body

      const user = await db.collection('users').findOne({ email, password })
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        ))
      }

      const { _id, password: _, ...userData } = user
      return handleCORS(NextResponse.json({
        success: true,
        token: user.token,
        user: userData
      }))
    }

    // Get current user
    if (route === '/auth/me' && method === 'GET') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }
      const { _id, password, ...userData } = user
      return handleCORS(NextResponse.json(userData))
    }

    // ============ POSTS ROUTES ============
    
    // GET all posts (public)
    if (route === '/posts' && method === 'GET') {
      const url = new URL(request.url)
      const category = url.searchParams.get('category')
      const status = url.searchParams.get('status') || 'published'
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const skip = parseInt(url.searchParams.get('skip') || '0')

      const query = { status }
      if (category) query.category = category

      const posts = await db.collection('posts')
        .find(query)
        .sort({ published_at: -1 })
        .limit(limit)
        .skip(skip)
        .toArray()

      const total = await db.collection('posts').countDocuments(query)

      return handleCORS(NextResponse.json({
        posts: posts.map(({ _id, ...rest }) => rest),
        total,
        limit,
        skip
      }))
    }

    // GET single post by slug (public)
    if (route.match(/^\/posts\/[^/]+$/) && method === 'GET') {
      const slug = path[1]
      const post = await db.collection('posts').findOne({ slug })

      if (!post) {
        return handleCORS(NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        ))
      }

      // Increment view count
      await db.collection('posts').updateOne(
        { slug },
        { $inc: { view_count: 1 } }
      )

      const { _id, ...postData } = post
      return handleCORS(NextResponse.json(postData))
    }

    // POST create new post (admin only)
    if (route === '/posts' && method === 'POST') {
      const user = await getUserFromToken(request)
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized - Admin only" },
          { status: 401 }
        ))
      }

      const body = await request.json()
      const post = {
        id: uuidv4(),
        ...body,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        author_id: user.id,
        author_name: user.name,
        view_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: body.status === 'published' ? new Date() : null
      }

      await db.collection('posts').insertOne(post)
      const { _id, ...postData } = post
      return handleCORS(NextResponse.json(postData))
    }

    // PUT update post (admin only)
    if (route.match(/^\/posts\/[^/]+$/) && method === 'PUT') {
      const user = await getUserFromToken(request)
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const id = path[1]
      const body = await request.json()
      
      const updateData = {
        ...body,
        updated_at: new Date()
      }

      if (body.status === 'published' && !body.published_at) {
        updateData.published_at = new Date()
      }

      await db.collection('posts').updateOne(
        { id },
        { $set: updateData }
      )

      const updatedPost = await db.collection('posts').findOne({ id })
      const { _id, ...postData } = updatedPost
      return handleCORS(NextResponse.json(postData))
    }

    // DELETE post (admin only)
    if (route.match(/^\/posts\/[^/]+$/) && method === 'DELETE') {
      const user = await getUserFromToken(request)
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const id = path[1]
      await db.collection('posts').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ============ BOOKMARKS ROUTES ============
    
    // Get user's bookmarks
    if (route === '/bookmarks' && method === 'GET') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const bookmarks = await db.collection('bookmarks')
        .find({ user_id: user.id })
        .sort({ created_at: -1 })
        .toArray()

      // Get post details for each bookmark
      const postIds = bookmarks.map(b => b.post_id)
      const posts = await db.collection('posts')
        .find({ id: { $in: postIds }, status: 'published' })
        .toArray()

      const bookmarksWithPosts = bookmarks.map(bookmark => {
        const post = posts.find(p => p.id === bookmark.post_id)
        return {
          ...bookmark,
          post: post ? { _id: undefined, ...post } : null
        }
      }).filter(b => b.post)

      return handleCORS(NextResponse.json(
        bookmarksWithPosts.map(({ _id, ...rest }) => rest)
      ))
    }

    // Add bookmark
    if (route === '/bookmarks' && method === 'POST') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const body = await request.json()
      const { post_id } = body

      // Check if already bookmarked
      const existing = await db.collection('bookmarks').findOne({
        user_id: user.id,
        post_id
      })

      if (existing) {
        return handleCORS(NextResponse.json(
          { error: "Already bookmarked" },
          { status: 400 }
        ))
      }

      const bookmark = {
        id: uuidv4(),
        user_id: user.id,
        post_id,
        created_at: new Date()
      }

      await db.collection('bookmarks').insertOne(bookmark)
      const { _id, ...bookmarkData } = bookmark
      return handleCORS(NextResponse.json(bookmarkData))
    }

    // Remove bookmark
    if (route.match(/^\/bookmarks\/[^/]+$/) && method === 'DELETE') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const post_id = path[1]
      await db.collection('bookmarks').deleteOne({
        user_id: user.id,
        post_id
      })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ============ HIGHLIGHTS ROUTES ============
    
    // Get user's highlights for a post
    if (route.match(/^\/highlights\/post\/[^/]+$/) && method === 'GET') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ highlights: [] }))
      }

      const post_id = path[2]
      const highlights = await db.collection('highlights')
        .find({ user_id: user.id, post_id })
        .sort({ created_at: -1 })
        .toArray()

      return handleCORS(NextResponse.json(
        highlights.map(({ _id, ...rest }) => rest)
      ))
    }

    // Get all user highlights
    if (route === '/highlights' && method === 'GET') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const highlights = await db.collection('highlights')
        .find({ user_id: user.id })
        .sort({ created_at: -1 })
        .toArray()

      // Get post details
      const postIds = [...new Set(highlights.map(h => h.post_id))]
      const posts = await db.collection('posts')
        .find({ id: { $in: postIds } })
        .toArray()

      const highlightsWithPosts = highlights.map(highlight => {
        const post = posts.find(p => p.id === highlight.post_id)
        return {
          ...highlight,
          post: post ? { id: post.id, title: post.title, slug: post.slug } : null
        }
      })

      return handleCORS(NextResponse.json(
        highlightsWithPosts.map(({ _id, ...rest }) => rest)
      ))
    }

    // Add highlight
    if (route === '/highlights' && method === 'POST') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const body = await request.json()
      const { post_id, text, color = 'yellow' } = body

      const highlight = {
        id: uuidv4(),
        user_id: user.id,
        post_id,
        text,
        color,
        created_at: new Date()
      }

      await db.collection('highlights').insertOne(highlight)
      const { _id, ...highlightData } = highlight
      return handleCORS(NextResponse.json(highlightData))
    }

    // Delete highlight
    if (route.match(/^\/highlights\/[^/]+$/) && method === 'DELETE') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const id = path[1]
      await db.collection('highlights').deleteOne({
        id,
        user_id: user.id
      })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ============ NOTIFICATIONS ROUTES ============
    
    // Get user notifications
    if (route === '/notifications' && method === 'GET') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const notifications = await db.collection('notifications')
        .find({ user_id: user.id })
        .sort({ created_at: -1 })
        .limit(50)
        .toArray()

      return handleCORS(NextResponse.json(
        notifications.map(({ _id, ...rest }) => rest)
      ))
    }

    // Mark notification as read
    if (route.match(/^\/notifications\/[^/]+\/read$/) && method === 'PUT') {
      const user = await getUserFromToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const id = path[1]
      await db.collection('notifications').updateOne(
        { id, user_id: user.id },
        { $set: { read: true, read_at: new Date() } }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ============ CATEGORIES ROUTES ============
    
    if (route === '/categories' && method === 'GET') {
      const categories = await db.collection('categories')
        .find({})
        .sort({ sort_order: 1 })
        .toArray()

      return handleCORS(NextResponse.json(
        categories.map(({ _id, ...rest }) => rest)
      ))
    }

    if (route === '/categories' && method === 'POST') {
      const user = await getUserFromToken(request)
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const body = await request.json()
      const category = {
        id: uuidv4(),
        ...body,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        created_at: new Date()
      }

      await db.collection('categories').insertOne(category)
      const { _id, ...categoryData } = category
      return handleCORS(NextResponse.json(categoryData))
    }

    // ============ TAGS ROUTES ============
    
    if (route === '/tags' && method === 'GET') {
      const tags = await db.collection('tags')
        .find({})
        .sort({ name: 1 })
        .toArray()

      return handleCORS(NextResponse.json(
        tags.map(({ _id, ...rest }) => rest)
      ))
    }

    if (route === '/tags' && method === 'POST') {
      const user = await getUserFromToken(request)
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const body = await request.json()
      const tag = {
        id: uuidv4(),
        ...body,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        created_at: new Date()
      }

      await db.collection('tags').insertOne(tag)
      const { _id, ...tagData } = tag
      return handleCORS(NextResponse.json(tagData))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute