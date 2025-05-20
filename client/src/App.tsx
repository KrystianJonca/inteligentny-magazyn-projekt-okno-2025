import { Home, Package, LogOut, ListChecks } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

function App() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // AuthContext handles navigation to /auth
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-muted/40 border-r border-border p-6 flex flex-col">
        <div className="text-2xl font-semibold text-foreground mb-8">Warehouse Inc.</div>
        <nav className="space-y-2 flex-grow">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/warehouses"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          >
            <Package className="h-5 w-5" />
            <span>Warehouses</span>
          </Link>
          <Link
            to="/items"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
          >
            <ListChecks className="h-5 w-5" />
            <span>Items</span>
          </Link>
          {/* Add more navigation links here as needed */}
        </nav>
        <div className="mt-auto">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center space-x-3 justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="bg-background border-b border-border p-4">
          {/* You can add a dynamic header title or breadcrumbs here */}
          <h1 className="text-xl font-semibold text-foreground">My Application</h1>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* Nested routes will render here */}
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;
