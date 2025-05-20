import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext'; // Assuming token might contain user info later

export function DashboardPage() {
  const { token } = useAuth(); // Example: you might decode token for username in future

  // A more complex dashboard would fetch and display summary data (e.g., total warehouses, items)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>Your central hub for warehouse management.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Navigate using the sidebar to manage warehouses, items, and inventory.</p>
            {/* Placeholder for potential user info */}
            {token && <p className="mt-4 text-sm text-gray-600">You are logged in.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>At-a-glance overview of your operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Statistics will be shown here once implemented.</p>
            {/* Example stats (replace with real data later) */}
            <ul className="mt-2 space-y-1 text-sm">
              <li>Total Warehouses: (coming soon)</li>
              <li>Total Items: (coming soon)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
