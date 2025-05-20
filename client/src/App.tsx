import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

function App() {
  const { logout } = useAuth();

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Warehouse Management</h1>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </header>
      <main>
        <p>Welcome to the application! This is a protected area.</p>
        {/* Content of your application will go here */}
      </main>
    </div>
  );
}

export default App;
