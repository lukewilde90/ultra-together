import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopNav from './TopNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-stone-50">
      <TopNav />
      <main className="pt-14 pb-24">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
