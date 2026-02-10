'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Eye, Plus, MessageSquare, Users, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState({ total_posts: 0, total_views: 0, pending_comments: 0, subscribers: 0 })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          setIsAuthenticated(true)
          fetchStats(token)
        } else {
          localStorage.removeItem('admin_token')
        }
      } catch (error) {
        localStorage.removeItem('admin_token')
      }
    }
    setLoading(false)
  }

  const fetchStats = async (token) => {
    try {
      // Fetch posts
      const postsResponse = await fetch('/api/posts?limit=1000&all=true')
      const postsData = await postsResponse.json()
      const posts = postsData.posts || []
      const publishedPosts = posts.filter(p => p.status === 'published')
      const totalViews = publishedPosts.reduce((sum, post) => sum + (post.view_count || 0), 0)
      
      // Fetch pending comments
      const commentsResponse = await fetch('/api/admin/comments?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const commentsData = await commentsResponse.json()
      
      // Fetch subscribers
      const subscribersResponse = await fetch('/api/subscribers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const subscribersData = await subscribersResponse.json()
      const activeSubscribers = Array.isArray(subscribersData) 
        ? subscribersData.filter(s => s.subscribed).length 
        : 0
      
      setStats({
        total_posts: posts.length,
        total_views: totalViews,
        pending_comments: Array.isArray(commentsData) ? commentsData.length : 0,
        subscribers: activeSubscribers
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('admin_token', data.token)
        setIsAuthenticated(true)
        fetchStats(data.token)
        toast.success('Logged in successfully!')
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Sign in to manage your blog</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Credentials are set in .env file (ADMIN_EMAIL, ADMIN_PASSWORD)
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your blog content</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/">View Site</Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_posts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_views}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_comments}</div>
              {stats.pending_comments > 0 && (
                <p className="text-xs text-orange-500">Needs attention</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subscribers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/posts/new')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Post
                </CardTitle>
                <CardDescription>
                  Write and publish a new blog post
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/posts')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Manage Posts
                </CardTitle>
                <CardDescription>
                  View and edit existing posts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/comments')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Moderate Comments
                  {stats.pending_comments > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                      {stats.pending_comments}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Approve or reject comments
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/subscribers')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Subscribers
                </CardTitle>
                <CardDescription>
                  View newsletter subscribers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
