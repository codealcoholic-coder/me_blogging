'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Share2, Twitter, Linkedin, Facebook, MessageCircle, Link2, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function ShareButtons({ title, excerpt, url, className = '' }) {
  const [showDialog, setShowDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  // Construct full URL
  const fullUrl = url.startsWith('http') ? url : `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedExcerpt = encodeURIComponent(excerpt || title)

  // Share URLs for different platforms
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  }

  // Handle native share (for mobile devices)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt || title,
          url: fullUrl,
        })
        toast.success('Shared successfully!')
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
          setShowDialog(true)
        }
      }
    } else {
      setShowDialog(true)
    }
  }

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Failed to copy link')
    }
  }

  // Handle platform share
  const handlePlatformShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    toast.success(`Sharing on ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`)
  }

  return (
    <>
      <TooltipProvider>
        <div className={`flex items-center gap-2 ${className}`}>
          {/* Main Share Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNativeShare}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this post</p>
            </TooltipContent>
          </Tooltip>

          {/* Twitter/X */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePlatformShare('twitter')}
                className="hover:bg-[#1DA1F2] hover:text-white transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on Twitter/X</p>
            </TooltipContent>
          </Tooltip>

          {/* LinkedIn */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePlatformShare('linkedin')}
                className="hover:bg-[#0A66C2] hover:text-white transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on LinkedIn</p>
            </TooltipContent>
          </Tooltip>

          {/* Facebook */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePlatformShare('facebook')}
                className="hover:bg-[#1877F2] hover:text-white transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on Facebook</p>
            </TooltipContent>
          </Tooltip>

          {/* WhatsApp */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePlatformShare('whatsapp')}
                className="hover:bg-[#25D366] hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on WhatsApp</p>
            </TooltipContent>
          </Tooltip>

          {/* Copy Link */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? 'Copied!' : 'Copy link'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Share Dialog (fallback for non-mobile) */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this post</DialogTitle>
            <DialogDescription>
              Choose a platform to share this article
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:bg-[#1DA1F2] hover:text-white transition-colors"
              onClick={() => {
                handlePlatformShare('twitter')
                setShowDialog(false)
              }}
            >
              <Twitter className="h-6 w-6" />
              <span>Twitter/X</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:bg-[#0A66C2] hover:text-white transition-colors"
              onClick={() => {
                handlePlatformShare('linkedin')
                setShowDialog(false)
              }}
            >
              <Linkedin className="h-6 w-6" />
              <span>LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:bg-[#1877F2] hover:text-white transition-colors"
              onClick={() => {
                handlePlatformShare('facebook')
                setShowDialog(false)
              }}
            >
              <Facebook className="h-6 w-6" />
              <span>Facebook</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:bg-[#25D366] hover:text-white transition-colors"
              onClick={() => {
                handlePlatformShare('whatsapp')
                setShowDialog(false)
              }}
            >
              <MessageCircle className="h-6 w-6" />
              <span>WhatsApp</span>
            </Button>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                handleCopyLink()
                setShowDialog(false)
              }}
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}