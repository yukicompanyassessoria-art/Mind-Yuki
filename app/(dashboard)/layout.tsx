import { Sidebar } from '@/components/sidebar'
import { AuthGuard } from '@/components/auth-guard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-full min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-60 min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
