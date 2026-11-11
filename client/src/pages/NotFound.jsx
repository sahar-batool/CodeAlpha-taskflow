import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="text-xl font-bold">Page not found</h1>
      <p className="text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/"><Button className="mt-2">Back home</Button></Link>
    </div>
  );
}