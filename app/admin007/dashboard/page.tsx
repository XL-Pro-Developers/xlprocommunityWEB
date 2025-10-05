import { requireAdminOrRedirect } from "../actions"
import { SiteHeader } from "@/components/site-header"
import { AdminDashboardClient } from "@/components/admin-dashboard-client"

export default async function AdminDashboardPage() {
  await requireAdminOrRedirect()

  return (
    <main>
      <SiteHeader />
      <AdminDashboardClient />
    </main>
  )
}
