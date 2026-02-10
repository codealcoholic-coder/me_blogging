'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, Eye, Clock, ArrowLeft, ThumbsUp, MessageSquare, Send } from 'lucide-react'
import { format } from 'date-fns'
import ShareButtons from '@/components/blog/ShareButtons'
import { toast } from 'sonner'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Upvote state
  const [upvoted, setUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [visitorId, setVisitorId] = useState('')
  
  // Comments state
  const [comments, setComments] = useState([])
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' })
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    // Get or create visitor ID
    let vid = localStorage.getItem('visitor_id')
    if (!vid) {
      vid = 'visitor_' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('visitor_id', vid)
    }
    setVisitorId(vid)

    if (params.slug) {
      fetchPost()
      fetchComments()
    }
  }, [params.slug])

  useEffect(() => {
    if (post && visitorId) {
      fetchUpvoteStatus()
    }
  }, [post, visitorId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}`)
      if (!response.ok) {
        throw new Error('Post not found')
      }
      const data = await response.json()
      setPost(data)
      setUpvoteCount(data.upvote_count || 0)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUpvoteStatus = async () => {
    if (!post) return
    try {
      const response = await fetch(`/api/posts/${post.id}/upvote?visitor_id=${visitorId}`)
      const data = await response.json()
      setUpvoted(data.upvoted)
      setUpvoteCount(data.count)
    } catch (error) {
      console.error('Error fetching upvote status:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}/comments`)
      const data = await response.json()
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleUpvote = async () => {
    if (!post) return
    try {
      const response = await fetch(`/api/posts/${post.id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: visitorId })
      })
      const data = await response.json()
      setUpvoted(data.upvoted)
      setUpvoteCount(data.count)
      toast.success(data.upvoted ? 'Thanks for the upvote!' : 'Upvote removed')
    } catch (error) {
      console.error('Error upvoting:', error)
      toast.error('Failed to upvote')
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentForm.name || !commentForm.email || !commentForm.content) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/posts/${params.slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      })
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Comment submitted! It will appear after moderation.')
        setCommentForm({ name: '', email: '', content: '' })
      } else {
        toast.error(data.error || 'Failed to submit comment')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Failed to submit comment')
    } finally {
      setSubmittingComment(false)
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

          {/* Share & Upvote Section */}
          <div className="border-t border-b py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">Share:</span>
                <ShareButtons
                  title={post.title}
                  excerpt={post.excerpt}
                  url={postUrl}
                />
              </div>
              <Button
                variant={upvoted ? "default" : "outline"}
                size="sm"
                onClick={handleUpvote}
                className="flex items-center gap-2"
              >
                <ThumbsUp className={`h-4 w-4 ${upvoted ? 'fill-current' : ''}`} />
                {upvoteCount}
              </Button>
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
        <Card className="p-6 bg-muted/50 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Found this helpful?</h3>
              <p className="text-sm text-muted-foreground">Share it with your network!</p>
            </div>
            <div className="flex items-center gap-4">
              <ShareButtons
                title={post.title}
                excerpt={post.excerpt}
                url={postUrl}
              />
              <Button
                variant={upvoted ? "default" : "outline"}
                onClick={handleUpvote}
                className="flex items-center gap-2"
              >
                <ThumbsUp className={`h-4 w-4 ${upvoted ? 'fill-current' : ''}`} />
                Upvote ({upvoteCount})
              </Button>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
          </div>

          {/* Comment Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Your email won't be published</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Comment *</Label>
                <Textarea
                  id="content"
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  placeholder="Write your comment..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" disabled={submittingComment}>
                {submittingComment ? 'Submitting...' : 'Submit Comment'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                Comments are moderated and will appear after approval.
              </p>
            </form>
          </Card>

          {/* Comments List */}
          {comments.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{comment.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

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
