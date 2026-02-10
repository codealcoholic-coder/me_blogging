import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// MongoDB connection with proper caching for serverless
const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME

// Admin credentials from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@blog.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// Resend for email
const RESEND_API_KEY = process.env.RESEND_API_KEY
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev'

if (!MONGO_URL) {
  throw new Error('Please define MONGO_URL environment variable')
}

if (!DB_NAME) {
  throw new Error('Please define DB_NAME environment variable')
}

// Use global to preserve connection across hot reloads in development
let cached = global.mongo

if (!cached) {
  cached = global.mongo = { conn: null, promise: null }
}

async function connectToMongo() {
  if (cached.conn) {
    try {
      await cached.conn.db(DB_NAME).command({ ping: 1 })
      return cached.conn.db(DB_NAME)
    } catch (e) {
      console.log('Connection stale, reconnecting...')
      cached.conn = null
      cached.promise = null
    }
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
      waitQueueTimeoutMS: 2500,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      w: 'majority',
    }

    cached.promise = MongoClient.connect(MONGO_URL, opts)
      .then((client) => {
        console.log('✅ New MongoDB connection established')
        return client
      })
      .catch((err) => {
        cached.promise = null
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn.db(DB_NAME)
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

// Get admin from token
async function getAdminFromToken(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)
  const db = await connectToMongo()
  const admin = await db.collection('admins').findOne({ token })
  return admin
}

// Send newsletter emails to all subscribers
async function sendNewsletterEmails(post, db) {
  if (!RESEND_API_KEY || RESEND_API_KEY === 're_your_api_key_here') {
    console.log('Resend API key not configured, skipping email notifications')
    return
  }

  try {
    const resend = new Resend(RESEND_API_KEY)
    const subscribers = await db.collection('subscribers').find({ subscribed: true }).toArray()
    
    if (subscribers.length === 0) {
      console.log('No subscribers to notify')
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const postUrl = `${baseUrl}/blog/${post.slug}`

    for (const subscriber of subscribers) {
      try {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: [subscriber.email],
          subject: `New Post: ${post.title}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; font-size: 24px;">${post.title}</h1>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                ${post.excerpt || 'A new article has been published on Garden of Thoughts.'}
              </p>
              <a href="${postUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; font-size: 14px;">
                Read Article
              </a>
              <p style="margin-top: 30px; font-size: 12px; color: #999;">
                You're receiving this because you subscribed to Garden of Thoughts.<br/>
                <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #999;">Unsubscribe</a>
              </p>
            </div>
          `
        })
        console.log(`Email sent to ${subscriber.email}`)
      } catch (emailError) {
        console.error(`Failed to send email to ${subscriber.email}:`, emailError)
      }
    }
  } catch (error) {
    console.error('Error sending newsletter emails:', error)
  }
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

    // ============ ADMIN AUTH ROUTES ============
    
    // Admin Login (static credentials)
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const { email, password } = body

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Check if admin exists, create if not
        let admin = await db.collection('admins').findOne({ email: ADMIN_EMAIL })
        
        if (!admin) {
          const token = uuidv4()
          admin = {
            id: uuidv4(),
            email: ADMIN_EMAIL,
            name: 'Admin',
            role: 'admin',
            token,
            created_at: new Date()
          }
          await db.collection('admins').insertOne(admin)
        } else {
          // Update token
          const token = uuidv4()
          await db.collection('admins').updateOne(
            { email: ADMIN_EMAIL },
            { $set: { token, updated_at: new Date() } }
          )
          admin.token = token
        }

        return handleCORS(NextResponse.json({
          success: true,
          token: admin.token,
          user: { id: admin.id, email: admin.email, name: admin.name, role: 'admin' }
        }))
      }

      return handleCORS(NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      ))
    }

    // Get current admin
    if (route === '/auth/me' && method === 'GET') {
      const admin = await getAdminFromToken(request)
      if (!admin) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }
      const { _id, token, ...adminData } = admin
      return handleCORS(NextResponse.json(adminData))
    }

    // ============ SUBSCRIBERS ROUTES ============
    
    // Subscribe to newsletter
    if (route === '/subscribers' && method === 'POST') {
      const body = await request.json()
      const { email } = body

      if (!email || !email.includes('@')) {
        return handleCORS(NextResponse.json(
          { error: "Valid email is required" },
          { status: 400 }
        ))
      }

      // Check if already subscribed
      const existing = await db.collection('subscribers').findOne({ email })
      if (existing) {
        if (existing.subscribed) {
          return handleCORS(NextResponse.json(
            { error: "Email already subscribed" },
            { status: 400 }
          ))
        } else {
          // Re-subscribe
          await db.collection('subscribers').updateOne(
            { email },
            { $set: { subscribed: true, updated_at: new Date() } }
          )
          return handleCORS(NextResponse.json({ success: true, message: "Re-subscribed successfully" }))
        }
      }

      const subscriber = {
        id: uuidv4(),
        email,
        subscribed: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('subscribers').insertOne(subscriber)
      return handleCORS(NextResponse.json({ success: true, message: "Subscribed successfully" }))
    }

    // Get all subscribers (admin only)
    if (route === '/subscribers' && method === 'GET') {
      const admin = await getAdminFromToken(request)
      if (!admin) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const subscribers = await db.collection('subscribers')
        .find({})
        .sort({ created_at: -1 })
        .toArray()

      return handleCORS(NextResponse.json(
        subscribers.map(({ _id, ...rest }) => rest)
      ))
    }

    // Unsubscribe
    if (route === '/subscribers/unsubscribe' && method === 'POST') {
      const body = await request.json()
      const { email } = body

      await db.collection('subscribers').updateOne(
        { email },
        { $set: { subscribed: false, updated_at: new Date() } }
      )

      return handleCORS(NextResponse.json({ success: true, message: "Unsubscribed successfully" }))
    }

    // ============ POSTS ROUTES ============
    
    // GET all posts (public)
    if (route === '/posts' && method === 'GET') {
      const url = new URL(request.url)
      const category = url.searchParams.get('category')
      const status = url.searchParams.get('status') || 'published'
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const skip = parseInt(url.searchParams.get('skip') || '0')
      const all = url.searchParams.get('all') === 'true'

      const query = all ? {} : { status }
      if (category) query.category = category

      const posts = await db.collection('posts')
        .find(query)
        .sort({ published_at: -1, created_at: -1 })
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

      // Get upvote count
      const upvoteCount = await db.collection('upvotes').countDocuments({ post_id: post.id })

      const { _id, ...postData } = post
      return handleCORS(NextResponse.json({ ...postData, upvote_count: upvoteCount }))
    }

    // POST create new post (admin only)
    if (route === '/posts' && method === 'POST') {
      const admin = await getAdminFromToken(request)
      if (!admin) {
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
        author_id: admin.id,
        author_name: admin.name,
        view_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: body.status === 'published' ? new Date() : null
      }

      await db.collection('posts').insertOne(post)

      // Send newsletter if published
      if (body.status === 'published') {
        sendNewsletterEmails(post, db)
      }

      const { _id, ...postData } = post
      return handleCORS(NextResponse.json(postData))
    }

    // PUT update post (admin only)
    if (route.match(/^\/posts\/[^/]+$/) && method === 'PUT') {
      const admin = await getAdminFromToken(request)
      if (!admin) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const id = path[1]
      const body = await request.json()
      
      // Get current post to check if it was draft
      const currentPost = await db.collection('posts').findOne({ id })
      const wasPublished = currentPost?.status === 'published'
      
      const updateData = {
        ...body,
        updated_at: new Date()
      }

      if (body.status === 'published' && !currentPost?.published_at) {
        updateData.published_at = new Date()
      }

      await db.collection('posts').updateOne(
        { id },
        { $set: updateData }
      )

      const updatedPost = await db.collection('posts').findOne({ id })
      
      // Send newsletter if just published (was draft before)
      if (!wasPublished && body.status === 'published') {
        sendNewsletterEmails(updatedPost, db)
      }

      const { _id, ...postData } = updatedPost
      return handleCORS(NextResponse.json(postData))
    }

    // DELETE post (admin only)
    if (route.match(/^\/posts\/[^/]+$/) && method === 'DELETE') {
      const admin = await getAdminFromToken(request)
      if (!admin) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const id = path[1]
      await db.collection('posts').deleteOne({ id })
      // Also delete related comments and upvotes
      await db.collection('comments').deleteMany({ post_id: id })
      await db.collection('upvotes').deleteMany({ post_id: id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ============ UPVOTES ROUTES ============
    
    // Upvote a post
    if (route.match(/^\/posts\/[^/]+\/upvote$/) && method === 'POST') {
      const postId = path[1]
      const body = await request.json()
      const visitorId = body.visitor_id || uuidv4()

      // Check if already upvoted
      const existing = await db.collection('upvotes').findOne({
        post_id: postId,
        visitor_id: visitorId
      })

      if (existing) {
        // Remove upvote (toggle)
        await db.collection('upvotes').deleteOne({ id: existing.id })
        const count = await db.collection('upvotes').countDocuments({ post_id: postId })
        return handleCORS(NextResponse.json({ upvoted: false, count, visitor_id: visitorId }))
      }

      const upvote = {
        id: uuidv4(),
        post_id: postId,
        visitor_id: visitorId,
        created_at: new Date()
      }

      await db.collection('upvotes').insertOne(upvote)
      const count = await db.collection('upvotes').countDocuments({ post_id: postId })
      return handleCORS(NextResponse.json({ upvoted: true, count, visitor_id: visitorId }))
    }

    // Get upvote status
    if (route.match(/^\/posts\/[^/]+\/upvote$/) && method === 'GET') {
      const postId = path[1]
      const url = new URL(request.url)
      const visitorId = url.searchParams.get('visitor_id')

      const count = await db.collection('upvotes').countDocuments({ post_id: postId })
      let upvoted = false

      if (visitorId) {
        const existing = await db.collection('upvotes').findOne({
          post_id: postId,
          visitor_id: visitorId
        })
        upvoted = !!existing
      }

      return handleCORS(NextResponse.json({ upvoted, count }))
    }

    // ============ COMMENTS ROUTES ============
    
    // Get approved comments for a post (public)
    if (route.match(/^\/posts\/[^/]+\/comments$/) && method === 'GET') {
      const postId = path[1]
      
      const comments = await db.collection('comments')
        .find({ post_id: postId, status: 'approved' })
        .sort({ created_at: -1 })
        .toArray()

      return handleCORS(NextResponse.json(
        comments.map(({ _id, email, ...rest }) => rest) // Hide email from public
      ))
    }

    // Submit a comment (public - goes to moderation)
    if (route.match(/^\/posts\/[^/]+\/comments$/) && method === 'POST') {
      const postId = path[1]
      const body = await request.json()
      const { name, email, content } = body

      if (!name || !email || !content) {
        return handleCORS(NextResponse.json(
          { error: "Name, email, and content are required" },
          { status: 400 }
        ))
      }

      const comment = {
        id: uuidv4(),
        post_id: postId,
        name,
        email,
        content,
        status: 'pending', // pending, approved, rejected
        created_at: new Date()
      }

      await db.collection('comments').insertOne(comment)
      return handleCORS(NextResponse.json({ 
        success: true, 
        message: "Comment submitted for moderation" 
      }))
    }

    // Get all comments (admin only)
    if (route === '/admin/comments' && method === 'GET') {
      const admin = await getAdminFromToken(request)
      if (!admin) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const url = new URL(request.url)
      const status = url.searchParams.get('status') // pending, approved, rejected, or all

      const query = status && status !== 'all' ? { status } : {}
      
      const comments = await db.collection('comments')
        .find(query)
        .sort({ created_at: -1 })
        .toArray()

      // Get post titles for each comment
      const postIds = [...new Set(comments.map(c => c.post_id))]
      const posts = await db.collection('posts')
        .find({ id: { $in: postIds } })
        .toArray()

      const commentsWithPosts = comments.map(comment => {
        const post = posts.find(p => p.id === comment.post_id)
        return {
          ...comment,
          post_title: post?.title || 'Unknown Post',
          post_slug: post?.slug
        }
      })

      return handleCORS(NextResponse.json(
        commentsWithPosts.map(({ _id, ...rest }) => rest)
      ))
    }

    // Update comment status (admin only)
    if (route.match(/^\/admin\/comments\/[^/]+$/) && method === 'PUT') {
      const admin = await getAdminFromToken(request)
      if (!admin) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const id = path[2]
      const body = await request.json()
      const { status } = body // approved or rejected

      await db.collection('comments').updateOne(
        { id },
        { $set: { status, moderated_at: new Date() } }
      )

      return handleCORS(NextResponse.json({ success: true }))
    }

    // Delete comment (admin only)
    if (route.match(/^\/admin\/comments\/[^/]+$/) && method === 'DELETE') {
      const admin = await getAdminFromToken(request)
      if (!admin) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const id = path[2]
      await db.collection('comments').deleteOne({ id })
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
      const admin = await getAdminFromToken(request)
      if (!admin) {
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
      const admin = await getAdminFromToken(request)
      if (!admin) {
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
