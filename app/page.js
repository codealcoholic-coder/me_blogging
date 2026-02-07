'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, Eye, Clock, BookOpen, Minus } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">静かに読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <Link href="/" className="group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-foreground flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">思考の庭</h1>
                <p className="text-xs text-muted-foreground tracking-wide">Garden of Thoughts</p>
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/about" className="text-sm hover:text-foreground/60 transition-colors">About</Link>
            <Link href="/blog" className="text-sm hover:text-foreground/60 transition-colors">Archive</Link>
            {user ? (
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className="text-sm px-4 py-2 border border-foreground hover:bg-foreground hover:text-background transition-all duration-300">
                {user.role === 'admin' ? 'Admin' : 'Dashboard'}
              </Link>
            ) : (
              <Link href="/login" 
                className="text-sm px-4 py-2 border border-foreground hover:bg-foreground hover:text-background transition-all duration-300">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Zen Hero Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8 fade-in">
            <div className="space-y-4">
              <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">Knowledge • Simplicity • Clarity</p>
              <h2 className="text-4xl md:text-6xl font-serif font-semibold tracking-tight leading-tight">
                A Space for
                <br />
                <span className="inline-block mt-2">Deep Learning</span>
              </h2>
              <div className="zen-divider"></div>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Exploring the intersection of data science, artificial intelligence, and thoughtful analysis.
                <br />One insight at a time.
              </p>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/blog" 
                className="px-8 py-3 border border-foreground hover:bg-foreground hover:text-background transition-all duration-300">
                Explore Articles
              </Link>
              {!user && (
                <Link href="/register" 
                  className="px-8 py-3 text-muted-foreground hover:text-foreground transition-colors">
                  Join Community
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredPost && (
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12 text-center">
                <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase mb-2">Featured</p>
                <div className="zen-divider"></div>
              </div>
              
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden zen-card hover:shadow-lg transition-all duration-500 border-border/50">
                  <div className="grid md:grid-cols-5 gap-0">
                    {featuredPost.featured_image && (
                      <div className="md:col-span-2 aspect-[4/3] md:aspect-auto overflow-hidden">
                        <img
                          src={featuredPost.featured_image}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                    )}
                    <div className="md:col-span-3 p-12 flex flex-col justify-center">
                      {featuredPost.category && (
                        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-4">{featuredPost.category}</p>
                      )}
                      <h3 className="text-3xl md:text-4xl font-serif font-semibold mb-6 leading-tight hover:text-muted-foreground transition-colors">
                        {featuredPost.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-8">
                        {featuredPost.excerpt || 'A deep dive into this topic...'}
                      </p>
                      <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        {featuredPost.published_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(featuredPost.published_at), 'MMM dd, yyyy')}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          {featuredPost.view_count || 0}
                        </div>
                        {featuredPost.reading_time_minutes && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {featuredPost.reading_time_minutes} min
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12 text-center">
                <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase mb-2">Topics</p>
                <div className="zen-divider"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="text-center p-8 border border-border/50 hover:border-foreground/20 transition-all duration-300 zen-hover"
                  >
                    <div className="mb-4">
                      <Minus className="h-6 w-6 mx-auto text-muted-foreground" />
                    </div>
                    <h4 className="text-sm font-medium mb-2">{category.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {category.description?.split(' ').slice(0, 4).join(' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Articles */}
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div className="text-center flex-1">
                <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase mb-2">Recent Writings</p>
                <div className="zen-divider"></div>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground text-lg">The garden awaits its first thoughts...</p>
              </div>
            ) : (
              <div className="space-y-1">
                {posts.slice(1).map((post, index) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <div className="py-8 border-b border-border/50 hover:bg-muted/30 transition-colors duration-300 px-6 group">
                      <div className="grid md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-2 text-xs text-muted-foreground">
                          {post.published_at && format(new Date(post.published_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="md:col-span-6">
                          {post.category && (
                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-2">
                              {post.category}
                            </p>
                          )}
                          <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-muted-foreground transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="md:col-span-4 flex justify-end items-center gap-6 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            {post.view_count || 0}
                          </div>
                          {post.reading_time_minutes && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {post.reading_time_minutes}m
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-16">
              <Link href="/blog" 
                className="inline-block px-8 py-3 border border-foreground hover:bg-foreground hover:text-background transition-all duration-300">
                View All Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Quote */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="zen-divider"></div>
            <blockquote className="text-2xl md:text-3xl font-serif leading-relaxed text-muted-foreground italic">
              "In the beginner's mind there are many possibilities,
              <br />but in the expert's there are few."
            </blockquote>
            <p className="text-sm tracking-[0.2em] text-muted-foreground">— SHUNRYU SUZUKI</p>
            <div className="zen-divider"></div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              <div>
                <h4 className="text-sm font-medium mb-4 tracking-wide">Philosophy</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Simplicity in design, depth in content. Every article is crafted to bring clarity to complex ideas.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4 tracking-wide">Navigate</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/blog" className="hover:text-foreground transition-colors">All Articles</Link></li>
                  <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                  <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4 tracking-wide">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 4).map((cat) => (
                    <span key={cat.id} className="text-xs px-3 py-1 border border-border/50 text-muted-foreground">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground tracking-wide">
                © 2025 Garden of Thoughts. Crafted with intention.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}