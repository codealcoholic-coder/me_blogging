'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Calendar, Eye, Clock, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import ShareButtons from '@/components/blog/ShareButtons'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (params.slug) {
      fetchPost()
    }
  }, [params.slug])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}`)
      if (!response.ok) {
        throw new Error('Post not found')
      }
      const data = await response.json()
      setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/blog')}>← Back to Blog</Button>
        </Card>
      </div>
    )
  }

  const postUrl = `/blog/${post.slug}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </header>

      {/* Post Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Featured Image */}
        {post.featured_image && (
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Post Header */}
        <div className="mb-8">
          {/* Category */}
          {post.category && (
            <Badge className="mb-4">{post.category}</Badge>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {post.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.published_at), 'MMMM dd, yyyy')}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.view_count || 0} views
            </div>
            {post.reading_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_time_minutes} min read
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Share Buttons - MAIN FEATURE */}
          <div className="border-t border-b py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Share this post:</span>
              <ShareButtons
                title={post.title}
                excerpt={post.excerpt}
                url={postUrl}
              />
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Bottom Share Section */}
        <Card className="p-6 bg-muted/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Found this helpful?</h3>
              <p className="text-sm text-muted-foreground">Share it with your network!</p>
            </div>
            <ShareButtons
              title={post.title}
              excerpt={post.excerpt}
              url={postUrl}
            />
          </div>
        </Card>

        {/* Navigation */}
        <div className="mt-12 flex justify-center">
          <Button asChild>
            <Link href="/blog">← Back to All Posts</Link>
          </Button>
        </div>
      </article>
    </div>
  )
}