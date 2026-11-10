import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <Button variant="secondary" className="mt-4" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}