'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Eye, Clock, ArrowRight, Sparkles, TrendingUp, BookOpen } from 'lucide-react'
import { format } from 'date-fns'

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchPosts()
    fetchCategories()
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?limit=6&status=published')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const featuredPost = posts[0]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DataScience Blog
              </h1>
              <p className="text-xs text-muted-foreground">Learn. Share. Grow.</p>
            </div>
          </Link>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/blog">Explore</Link>
            </Button>
            {user ? (
              <Button asChild>
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Welcome to Our Community</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-in">
            Master Data Science
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in">
            Explore cutting-edge tutorials, insights, and research in Machine Learning, AI, and Data Science. Join thousands of learners worldwide.
          </p>
          <div className="flex gap-4 justify-center animate-in">
            <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/blog">
                Start Reading <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {!user && (
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Join Free</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-bold">Featured Article</h3>
          </div>
          <Card className="overflow-hidden hover:shadow-2xl transition-shadow border-primary/20 animate-in">
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPost.featured_image && (
                <div className="aspect-video md:aspect-auto overflow-hidden">
                  <img
                    src={featuredPost.featured_image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col justify-center">
                {featuredPost.category && (
                  <Badge className="mb-3 w-fit">{featuredPost.category}</Badge>
                )}
                <h4 className="text-3xl font-bold mb-4">{featuredPost.title}</h4>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {featuredPost.excerpt || 'Dive into this comprehensive guide...'}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  {featuredPost.published_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(featuredPost.published_at), 'MMM dd, yyyy')}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {featuredPost.view_count || 0} views
                  </div>
                  {featuredPost.reading_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPost.reading_time_minutes} min
                    </div>
                  )}
                </div>
                <Button size="lg" asChild>
                  <Link href={`/blog/${featuredPost.slug}`}>
                    Read Article <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-6">Browse by Topic</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="group hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-2"
                style={{ borderColor: category.color + '20' }}
              >
                <CardContent className="pt-6 text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    {category.name.charAt(0)}
                  </div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold">Latest Articles</h3>
          <Button variant="outline" asChild>
            <Link href="/blog">View All</Link>
          </Button>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground text-lg">No posts yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post) => (
              <Card key={post.id} className="flex flex-col hover:shadow-xl transition-all group animate-in border-2 border-transparent hover:border-primary/20">
                {post.featured_image && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {post.category && (
                      <Badge variant="secondary">{post.category}</Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.excerpt || 'Discover more...'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.published_at && format(new Date(post.published_at), 'MMM dd')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.view_count || 0}
                    </div>
                    {post.reading_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.reading_time_minutes}m
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/blog/${post.slug}`}>Read More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 container mx-auto px-4">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none shadow-2xl">
            <CardContent className="py-16 text-center">
              <h3 className="text-4xl font-bold mb-4">Join Our Community</h3>
              <p className="text-xl mb-8 text-blue-100">
                Save your favorite articles, highlight important sections, and never miss an update!
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">Sign Up Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t mt-16 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-3">About</h4>
              <p className="text-sm text-muted-foreground">
                Your go-to platform for learning Data Science, Machine Learning, and AI through quality content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary">All Posts</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-primary">Login</Link></li>
                <li><Link href="/register" className="text-muted-foreground hover:text-primary">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 4).map((cat) => (
                  <Badge key={cat.id} variant="outline">{cat.name}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>© 2025 DataScience Blog. Built with Next.js & MongoDB. Made with ❤️ for learners.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
