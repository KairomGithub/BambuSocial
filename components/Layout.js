import { useRouter } from 'next/router'
import Navbar from './Navbar'

export default function Layout({ children, user }) {
  const router = useRouter()
  
  // Xác định các trang không cần Navbar
  const noNavbarPages = ['/login', '/register']
  const showNavbar = !noNavbarPages.includes(router.pathname)
  
  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar user={user} />}
      <main className="container mx-auto max-w-2xl px-4 py-4 flex-grow">
        {children}
      </main>
      <footer className="py-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Bambu Social
      </footer>
    </div>
  )
}