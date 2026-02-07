'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Code, 
  Brain, 
  Sparkles, 
  Heart,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Coffee,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'

export default function AboutPage() {
  const socialLinks = {
    instagram: 'https://instagram.com/yourprofile',
    youtube: 'https://youtube.com/@yourchannel',
    linkedin: 'https://linkedin.com/in/yourprofile',
    email: 'contact@yourdomain.com'
  }

  const skills = [
    'Machine Learning',
    'Deep Learning',
    'Python',
    'TensorFlow',
    'PyTorch',
    'Data Analysis',
    'Computer Vision',
    'NLP',
    'SQL',
    'AWS/Cloud'
  ]

  const stats = [
    { label: 'Articles Published', value: '50+' },
    { label: 'Community Members', value: '10K+' },
    { label: 'Years Experience', value: '5+' },
    { label: 'Countries Reached', value: '30+' }
  ]

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
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">About Me</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-in">
            Hi, I'm [Your Name] 👋
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-in leading-relaxed">
            A passionate <span className="font-semibold text-primary">Data Scientist</span> and <span className="font-semibold text-primary">AI Enthusiast</span> on a mission to make complex concepts simple and accessible to everyone. I share my journey, insights, and learnings through tutorials, articles, and videos.
          </p>

          {/* Profile Image Placeholder */}
          <div className="mb-8 animate-in">
            <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-6xl font-bold shadow-2xl">
              YN
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 justify-center mb-8 animate-in">
            <Button size="lg" variant="outline" asChild className="group">
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram className="mr-2 h-5 w-5 group-hover:text-pink-600 transition-colors" />
                Instagram
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="group">
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                <Youtube className="mr-2 h-5 w-5 group-hover:text-red-600 transition-colors" />
                YouTube
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="group">
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 h-5 w-5 group-hover:text-blue-600 transition-colors" />
                LinkedIn
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About Content */}
      <section className="py-12 container mx-auto px-4 max-w-4xl">
        <div className="space-y-12">
          {/* My Story */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-8 w-8 text-primary" />
                <h3 className="text-3xl font-bold">My Story</h3>
              </div>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                <p>
                  My journey into Data Science began [X years ago] when I first discovered the power of extracting insights from data. What started as curiosity quickly turned into a passion that drives everything I do today.
                </p>
                <p>
                  I've worked on projects ranging from predictive analytics to computer vision, natural language processing to recommendation systems. Each project taught me something new and reinforced my belief that data, when understood correctly, can solve real-world problems.
                </p>
                <p>
                  But knowledge is meant to be shared. That's why I started this blog – to create a space where learners at all levels can find quality content, practical tutorials, and inspiration to pursue their own data science journey.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What I Do */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Code className="h-8 w-8 text-primary" />
                <h3 className="text-3xl font-bold">What I Do</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Content Creation
                  </h4>
                  <p className="text-muted-foreground">
                    Writing in-depth tutorials, creating video content, and sharing practical insights on Machine Learning, Deep Learning, and AI.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Data Science Projects
                  </h4>
                  <p className="text-muted-foreground">
                    Building end-to-end ML pipelines, deploying models, and solving complex problems with data-driven solutions.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-primary" />
                    Video Tutorials
                  </h4>
                  <p className="text-muted-foreground">
                    Creating engaging video content on YouTube to make learning visual and interactive for the community.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Community Building
                  </h4>
                  <p className="text-muted-foreground">
                    Helping learners grow, answering questions, and fostering a supportive community of data enthusiasts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-base px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none shadow-2xl">
            <CardContent className="py-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-6 animate-pulse" />
              <h3 className="text-4xl font-bold mb-4">Support My Work</h3>
              <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                If you find my content helpful and want to support the creation of more quality tutorials, consider buying me a coffee or becoming a patron!
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <Button size="lg" variant="secondary" asChild>
                  <a href="https://buymeacoffee.com/yourprofile" target="_blank" rel="noopener noreferrer">
                    <Coffee className="mr-2 h-5 w-5" />
                    Buy Me a Coffee
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                  <a href="https://patreon.com/yourprofile" target="_blank" rel="noopener noreferrer">
                    <Heart className="mr-2 h-5 w-5" />
                    Become a Patron
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="pt-8 border-t border-white/20">
                <p className="text-sm text-blue-100 mb-4">Follow me on social media for daily updates:</p>
                <div className="flex gap-4 justify-center">
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <Instagram className="h-8 w-8" />
                  </a>
                  <a 
                    href={socialLinks.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <Youtube className="h-8 w-8" />
                  </a>
                  <a 
                    href={socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <Linkedin className="h-8 w-8" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-8 w-8 text-primary" />
                <h3 className="text-3xl font-bold">Get In Touch</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Have a question, collaboration idea, or just want to say hi? I'd love to hear from you!
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <a href={`mailto:${socialLinks.email}`}>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Email
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/blog">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Read My Articles
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-2xl">
          <CardContent className="py-16 text-center">
            <h3 className="text-4xl font-bold mb-4">Join the Community</h3>
            <p className="text-xl mb-8 text-purple-100">
              Subscribe to get the latest tutorials, insights, and updates directly in your inbox!
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Get Started Free
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 DataScience Blog. Built with passion and Next.js. Made with ❤️ for learners.</p>
        </div>
      </footer>
    </div>
  )
}
