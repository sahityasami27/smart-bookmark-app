import './globals.css'

export const metadata = {
  title: 'Smart Bookmark App',
  description: 'Save and organize your links',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}