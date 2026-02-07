import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Data Science Blog',
  description: 'A modern blog platform for Data Science insights and tutorials',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}