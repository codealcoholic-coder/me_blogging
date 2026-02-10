'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Check, X, Trash2, MessageSquare, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function CommentsPage() {
  const router = useRouter()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    checkAuth()
    fetchComments()
  }, [filter])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
    }
  }

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/comments?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (commentId, status) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Comment ${status}!`)
        fetchComments()
      } else {
        toast.error('Failed to update comment')
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Comment deleted!')
        fetchComments()
      } else {
        toast.error('Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Comment Moderation</h1>
              <p className="text-muted-foreground">Approve, reject, or delete comments</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {comments.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No {filter === 'all' ? '' : filter} comments
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {comment.name}
                            {getStatusBadge(comment.status)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {comment.email} • {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {comment.post_title && (
                            <Link 
                              href={`/blog/${comment.post_slug}`} 
                              target="_blank"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              On: {comment.post_title}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {comment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 hover:bg-green-100 text-green-700"
                                onClick={() => handleUpdateStatus(comment.id, 'approved')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-50 hover:bg-red-100 text-red-700"
                                onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {comment.status === 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 hover:bg-green-100 text-green-700"
                              onClick={() => handleUpdateStatus(comment.id, 'approved')}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          )}
                          {comment.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 hover:bg-red-100 text-red-700"
                              onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
