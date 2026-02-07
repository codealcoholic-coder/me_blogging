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

// Simple auth check
function isAuthenticated(request) {
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${process.env.ADMIN_TOKEN || 'admin123'}`
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
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const { email, password } = body

      // Simple hardcoded admin (in production, use proper auth)
      if (email === 'admin@blog.com' && password === 'admin123') {
        return handleCORS(NextResponse.json({
          success: true,
          token: process.env.ADMIN_TOKEN || 'admin123',
          user: { email, role: 'admin' }
        }))
      }

      return handleCORS(NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      ))
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
      if (!isAuthenticated(request)) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const body = await request.json()
      const post = {
        id: uuidv4(),
        ...body,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
      if (!isAuthenticated(request)) {
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
      if (!isAuthenticated(request)) {
        return handleCORS(NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const id = path[1]
      await db.collection('posts').deleteOne({ id })
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
      if (!isAuthenticated(request)) {
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
      if (!isAuthenticated(request)) {
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