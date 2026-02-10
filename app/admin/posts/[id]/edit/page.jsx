'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Save, Send, Eye } from 'lucide-react'
import TiptapEditor from '@/components/editor/TiptapEditor'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featured_image: '',
    status: 'draft',
    reading_time_minutes: 5
  })
  const [saving, setSaving] = useState(false)
  const [originalStatus, setOriginalStatus] = useState('draft')

  useEffect(() => {
    checkAuth()
    fetchCategories()
    fetchPost()
  }, [params.id])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
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

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/posts?all=true&limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      const post = data.posts?.find(p => p.id === params.id)
      
      if (post) {
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          category: post.category || '',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
          featured_image: post.featured_image || '',
          status: post.status || 'draft',
          reading_time_minutes: post.reading_time_minutes || 5
        })
        setOriginalStatus(post.status || 'draft')
      } else {
        toast.error('Post not found')
        router.push('/admin/posts')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (status) => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required')
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('admin_token')
      
      const postData = {
        ...formData,
        status,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        if (status === 'published' && originalStatus !== 'published') {
          toast.success('Post published! Newsletter notifications sent.')
        } else if (status === 'published') {
          toast.success('Post updated!')
        } else {
          toast.success('Post saved as draft!')
        }
        router.push('/admin/posts')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/admin/posts">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Edit Post</h1>
                <p className="text-muted-foreground">Update your blog post</p>
              </div>
            </div>
            <div className="flex gap-2">
              {formData.status === 'published' && (
                <Button variant="outline" asChild>
                  <Link href={`/blog/${formData.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    View Post
                  </Link>
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => handleSubmit('draft')} 
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button 
                onClick={() => handleSubmit('published')} 
                disabled={saving}
              >
                <Send className="mr-2 h-4 w-4" />
                {originalStatus === 'published' ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter post title"
                  className="text-xl font-semibold"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <TiptapEditor
                  content={formData.content}
                  onChange={(html) => handleChange('content', html)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="post-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="python, machine-learning, tutorial"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => handleChange('featured_image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.featured_image && (
                    <img 
                      src={formData.featured_image} 
                      alt="Preview" 
                      className="mt-2 rounded-md max-h-32 object-cover"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reading_time">Reading Time (minutes)</Label>
                  <Input
                    id="reading_time"
                    type="number"
                    value={formData.reading_time_minutes}
                    onChange={(e) => handleChange('reading_time_minutes', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  placeholder="Brief description of the post"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
