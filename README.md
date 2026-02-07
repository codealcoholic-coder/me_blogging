# Data Science Blog Platform 📚

A modern, full-stack blog platform built with Next.js 14, MongoDB, and shadcn/ui. Features a powerful admin panel for content management and **social sharing capabilities** to share posts across multiple platforms.

## ✨ Key Features

### Core Features
- 🎨 **Modern UI** - Built with Next.js 14 App Router and shadcn/ui components
- 📝 **Rich Content** - Full-featured blog posts with categories, tags, and metadata
- 🔐 **Admin Panel** - Secure admin dashboard for content management
- 📱 **Responsive Design** - Mobile-friendly layout with Tailwind CSS
- 🗄️ **MongoDB Backend** - Scalable database for all content

### **Social Sharing Features** 🌐 (MAIN FEATURE)
Share blog posts directly to multiple platforms with one click:
- **Twitter/X** - Share with pre-filled text and link
- **LinkedIn** - Professional network sharing
- **Facebook** - Social media distribution
- **WhatsApp** - Direct messaging to contacts
- **Copy Link** - Quick clipboard copy with visual feedback
- **Native Share API** - Mobile-optimized sharing on supported devices
- **Share Dialog** - Fallback UI for desktop browsers

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and yarn
- MongoDB running locally

### Installation

1. **Install dependencies:**
```bash
yarn install
```

2. **Seed the database:**
```bash
node scripts/seed-data.js
```

3. **Start the development server:**
```bash
yarn dev
```

4. **Open your browser:**
```
http://localhost:3000
```

## 📖 Usage Guide

### Public Site

#### Home Page (`/`)
- Browse latest posts
- View categories
- Featured content showcase

#### Blog Listing (`/blog`)
- View all published posts
- Search functionality
- Filter by category

#### Single Post (`/blog/[slug]`)
- Read full post content
- **Share buttons** for social platforms
- View metadata (views, reading time, publish date)
- Tags and category information

### Admin Panel

#### Login (`/admin`)
Default credentials:
- **Email:** `admin@blog.com`
- **Password:** `admin123`

#### Dashboard (`/admin`)
- View statistics (total posts, views)
- Quick actions for common tasks

#### Manage Posts (`/admin/posts`)
- View all posts (published and drafts)
- Edit or delete existing posts
- Quick status overview

#### Create Post (`/admin/posts/new`)
Create new blog posts with:
- Title and slug
- Content (HTML supported)
- Excerpt
- Category selection
- Tags (comma-separated)
- Featured image URL
- Status (draft/published)
- Reading time estimate

## 🎯 Social Sharing Implementation

The ShareButtons component (`/components/blog/ShareButtons.jsx`) provides:

### Features:
1. **Platform-specific sharing:**
   - Opens sharing dialog in new window
   - Pre-fills post title and URL
   - Platform-specific formatting

2. **Native Web Share API:**
   - Automatic detection of browser support
   - Mobile-optimized experience
   - System-native share sheet

3. **Copy to Clipboard:**
   - One-click link copying
   - Visual feedback with check icon
   - Toast notification

4. **Responsive Design:**
   - Icon-only buttons on small screens
   - Tooltips for better UX
   - Dialog fallback for unsupported browsers

### Usage Example:
```jsx
import ShareButtons from '@/components/blog/ShareButtons'

<ShareButtons 
  title="Your Post Title"
  excerpt="Brief description"
  url="/blog/your-post-slug"
/>
```

## 🗂️ Project Structure

```
/app
├── app/
│   ├── page.js                      # Home page
│   ├── layout.js                    # Root layout
│   ├── blog/
│   │   ├── page.jsx                 # Blog listing
│   │   └── [slug]/
│   │       └── page.jsx             # Single post (with share buttons)
│   ├── admin/
│   │   ├── page.jsx                 # Admin dashboard
│   │   └── posts/
│   │       ├── page.jsx             # Manage posts
│   │       └── new/
│   │           └── page.jsx         # Create new post
│   └── api/
│       └── [[...path]]/
│           └── route.js             # API routes
├── components/
│   ├── blog/
│   │   └── ShareButtons.jsx         # Social sharing component ⭐
│   └── ui/                          # shadcn/ui components
├── scripts/
│   └── seed-data.js                 # Database seeding script
└── .env                             # Environment variables
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /api/posts` - List all posts (with filters)
- `GET /api/posts/[slug]` - Get single post
- `GET /api/categories` - List categories
- `GET /api/tags` - List tags

### Admin Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `POST /api/posts` - Create new post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/categories` - Create category
- `POST /api/tags` - Create tag

## 🎨 Customization

### Adding More Categories
1. Go to `/admin`
2. Use the API or modify `scripts/seed-data.js`
3. Add new categories with name, slug, and color

### Customizing Share Buttons
Edit `/components/blog/ShareButtons.jsx` to:
- Add more platforms (Reddit, Telegram, Email)
- Change button styles
- Modify share text format
- Add analytics tracking

### Styling
- Global styles: `/app/globals.css`
- Tailwind config: `tailwind.config.js`
- Component styles: Use Tailwind utility classes

## 🔐 Security Notes

⚠️ **Important for Production:**

1. **Change default admin credentials** in `/app/api/[[...path]]/route.js`
2. **Use proper authentication** (implement JWT or session-based auth)
3. **Add CSRF protection** for forms
4. **Sanitize user input** to prevent XSS attacks
5. **Use environment variables** for sensitive data
6. **Enable HTTPS** in production
7. **Set ADMIN_TOKEN** in `.env` file

## 🌍 Environment Variables

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=blog_db
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
CORS_ORIGINS=*
ADMIN_TOKEN=your-secure-token-here
```

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Date Handling:** date-fns
- **Forms:** React Hook Form + Zod

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Manual Deployment
1. Build: `yarn build`
2. Start: `yarn start`
3. Set up MongoDB connection
4. Configure environment variables

## 📝 Sample Data

The seed script creates:
- **4 Categories:** Machine Learning, Data Science, Deep Learning, Python
- **5 Tags:** Python, TensorFlow, PyTorch, Tutorial, Beginner
- **3 Sample Posts:** With full content, images, and metadata

Run: `node scripts/seed-data.js` to reset data

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo supervisorctl status mongodb

# Restart MongoDB
sudo supervisorctl restart mongodb
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
yarn build
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 🎯 Future Enhancements

Potential features to add:
- [ ] Comment system
- [ ] Reaction buttons (like, love, insightful)
- [ ] Newsletter subscription
- [ ] Full-text search
- [ ] Reading progress bar
- [ ] Table of contents
- [ ] Series/collections
- [ ] Code syntax highlighting
- [ ] Math notation support (LaTeX)
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] RSS feed
- [ ] Sitemap generation

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments

---

**Built with ❤️ using Next.js and MongoDB**

Enjoy building your blog! Don't forget to share your posts using the social sharing buttons! 🚀
