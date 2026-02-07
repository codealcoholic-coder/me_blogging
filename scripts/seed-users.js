const { MongoClient } = require('mongodb')
const { v4: uuidv4 } = require('uuid')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'blog_db'

async function seedUsers() {
  const client = new MongoClient(MONGO_URL)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    
    // Clear existing users
    await db.collection('users').deleteMany({})
    console.log('Cleared existing users')
    
    // Create admin user
    const adminToken = uuidv4()
    const adminUser = {
      id: uuidv4(),
      email: 'admin@blog.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      token: adminToken,
      avatar_url: 'https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    // Create test user
    const userToken = uuidv4()
    const testUser = {
      id: uuidv4(),
      email: 'user@blog.com',
      password: 'user123',
      name: 'Test User',
      role: 'user',
      token: userToken,
      avatar_url: 'https://ui-avatars.com/api/?name=Test+User&background=10b981&color=fff',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('users').insertMany([adminUser, testUser])
    console.log('✓ Created users:')
    console.log('  Admin: admin@blog.com / admin123')
    console.log('  User: user@blog.com / user123')
    
    // Create sample notification for test user
    const notification = {
      id: uuidv4(),
      user_id: testUser.id,
      title: 'Welcome to the Blog!',
      message: 'Thanks for joining our community. Start exploring amazing content!',
      type: 'welcome',
      read: false,
      created_at: new Date()
    }
    
    await db.collection('notifications').deleteMany({})
    await db.collection('notifications').insertOne(notification)
    console.log('✓ Created sample notification')
    
    console.log('\n✅ User seeding complete!')
    
  } catch (error) {
    console.error('Error seeding users:', error)
  } finally {
    await client.close()
  }
}

seedUsers()