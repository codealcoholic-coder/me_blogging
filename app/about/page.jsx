'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  BookOpen, 
  Code, 
  Brain, 
  Heart,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Coffee,
  Minus
} from 'lucide-react'

export default function AboutPage() {
  const socialLinks = {
    instagram: 'https://instagram.com/yourprofile',
    youtube: 'https://youtube.com/@yourchannel',
    linkedin: 'https://linkedin.com/in/shishir.naresh',
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
    'Cloud Computing',
    'Agentic AI',
    'LLMs',
    'RAG Development'
  ]

  const stats = [
    { label: 'Articles', value: '50+' },
    { label: 'Readers', value: '10K+' },
    { label: 'Experience', value: '5Y' },
    { label: 'Countries', value: '30+' }
  ]

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
                <h1 className="text-lg font-semibold tracking-tight">विचारोद्यानम्</h1>
                <p className="text-xs text-muted-foreground tracking-wide">Garden of Thoughts</p>
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/blog" className="text-sm hover:text-foreground/60 transition-colors">Archive</Link>
            <Link href="/" className="text-sm hover:text-foreground/60 transition-colors">Home</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 md:py-32 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8 fade-in">
            <div className="space-y-4">
              <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">About</p>
              <h2 className="text-4xl md:text-6xl font-serif font-semibold tracking-tight leading-tight">
                Shishir K. Naresh
              </h2>
              <div className="zen-divider"></div>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Data Scientist. Writer. Learner.
                <br />
                Simplifying complex ideas through thoughtful analysis.
              </p>
            </div>

            {/* Profile Avatar */}
            {/* <div className="my-12">
              <div className="w-32 h-32 mx-auto border-2 border-foreground/20 flex items-center justify-center text-4xl font-serif">
                S.K.N
              </div>
            </div> */}
            {/* Profile Avatar */}
            <div className="my-12">
              <div className="w-32 h-32 mx-auto border-2 border-foreground/20 flex items-center justify-center overflow-hidden rounded-full">
                <img
                  src="/avatar.png"
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>


            {/* Social Links */}
            <div className="flex gap-6 justify-center pt-4">
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                className="p-3 border border-border hover:border-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                className="p-3 border border-border hover:border-foreground transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                className="p-3 border border-border hover:border-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href={`mailto:${socialLinks.email}`}
                className="p-3 border border-border hover:border-foreground transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-1">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-8 border-r border-border/50 last:border-r-0">
                  <div className="text-3xl font-serif font-semibold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase mb-2">My Journey</p>
              <div className="zen-divider"></div>
            </div>
            
            <div className="space-y-8 text-muted-foreground reading-content">
              <p className="leading-relaxed">
                My journey into Data Science began several years ago when I first discovered 
                the power of extracting insights from data. What started as curiosity quickly 
                turned into a passion that drives everything I do today.
              </p>
              
              <p className="leading-relaxed">
                I've worked on projects ranging from predictive analytics to computer vision, 
                natural language processing to recommendation systems. Each project taught me 
                something new and reinforced my belief that data, when understood correctly, 
                can solve real-world problems.
              </p>
              
              <p className="leading-relaxed">
                But knowledge is meant to be shared. That's why I created this space – 
                to document my learning, share insights, and help others on their own 
                journey through the world of data science and artificial intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What I Do */}
      <section className="py-24 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase mb-2">Focus Areas</p>
              <div className="zen-divider"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-1">
              <div className="p-12 border border-border/50">
                <div className="mb-6">
                  <Code className="h-8 w-8 text-foreground/60" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-4">Writing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Creating in-depth tutorials and sharing practical insights on Machine Learning, 
                  Deep Learning, and AI. Making complex concepts accessible.
                </p>
              </div>

              <div className="p-12 border border-border/50">
                <div className="mb-6">
                  <Brain className="h-8 w-8 text-foreground/60" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-4">Research</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Building end-to-end ML pipelines, deploying models, and solving complex 
                  problems with data-driven solutions.
                </p>
              </div>

              <div className="p-12 border border-border/50">
                <div className="mb-6">
                  <Youtube className="h-8 w-8 text-foreground/60" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-4">Teaching</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Creating video content to make learning visual and interactive. 
                  Engaging with the community through various platforms.
                </p>
              </div>

              <div className="p-12 border border-border/50">
                <div className="mb-6">
                  <Heart className="h-8 w-8 text-foreground/60" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-4">Community</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Helping learners grow, answering questions, and fostering a supportive 
                  community of data enthusiasts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-24 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase mb-2">Expertise</p>
              <div className="zen-divider"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {skills.map((skill, index) => (
                <div key={index} className="text-center p-6 border border-border/50 hover:border-foreground/20 transition-colors">
                  <Minus className="h-4 w-4 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-xs">{skill}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-24 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase mb-2">Support</p>
              <div className="zen-divider"></div>
            </div>
            
            <h3 className="text-3xl font-serif font-semibold">Support My Work</h3>
            
            <p className="text-muted-foreground leading-relaxed">
              If you find my content helpful and want to support the creation of more 
              quality tutorials, consider buying me a coffee.
            </p>

            <div className="flex gap-4 justify-center pt-4">
              <a href="https://buymeacoffee.com/yourprofile" target="_blank" rel="noopener noreferrer"
                className="px-8 py-3 border border-foreground hover:bg-foreground hover:text-background transition-all duration-300 flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Buy Me a Coffee
              </a>
            </div>

            <div className="pt-8">
              <p className="text-xs text-muted-foreground mb-4">Follow for daily updates</p>
              <div className="flex gap-4 justify-center">
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                  className="p-2 hover:text-foreground/60 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                  className="p-2 hover:text-foreground/60 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                  className="p-2 hover:text-foreground/60 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase mb-2">Connect</p>
              <div className="zen-divider"></div>
            </div>
            
            <h3 className="text-3xl font-serif font-semibold">Get In Touch</h3>
            
            <p className="text-muted-foreground leading-relaxed">
              Have a question, collaboration idea, or just want to say hi?
              <br />I'd love to hear from you.
            </p>

            <div className="flex gap-4 justify-center pt-4">
              <a href={`mailto:${socialLinks.email}`}
                className="px-8 py-3 border border-foreground hover:bg-foreground hover:text-background transition-all duration-300">
                Send Email
              </a>
              <Link href="/blog"
                className="px-8 py-3 text-muted-foreground hover:text-foreground transition-colors">
                Read Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Quote */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="zen-divider"></div>
            <blockquote className="text-2xl md:text-3xl font-serif leading-relaxed text-muted-foreground italic">
              "The journey of a thousand miles
              <br />begins with a single step."
            </blockquote>
            <p className="text-sm tracking-[0.2em] text-muted-foreground">— LAO TZU</p>
            <div className="zen-divider"></div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground tracking-wide">
            © 2025 Garden of Thoughts. Crafted with intention.
          </p>
        </div>
      </footer>
    </div>
  )
}