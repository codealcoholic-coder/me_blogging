'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function NewsletterModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(true)
        toast.success('Successfully subscribed to newsletter!')
        // Store in localStorage to not show again
        localStorage.setItem('newsletter_subscribed', 'true')
      } else {
        toast.error(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Subscribe error:', error)
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-2">You're In!</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for subscribing. You'll receive notifications when new articles are published.
            </p>
            <Button onClick={onClose}>Continue Reading</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-center">Stay Updated</DialogTitle>
          <DialogDescription className="text-center">
            Subscribe to get notified when new articles are published. No spam, just quality content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-foreground/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                className="pl-10 py-6"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full py-6" disabled={isLoading}>
              {isLoading ? 'Subscribing...' : 'Subscribe to Newsletter'}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
