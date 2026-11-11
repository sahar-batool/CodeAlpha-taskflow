import { Link } from "react-router-dom";
import { Layers } from "lucide-react";

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${light ? "bg-[#fff]/20" : "bg-brand-600"} text-[#fff]`}>
        <Layers size={20} />
      </span>
      <span className={`text-lg font-bold tracking-tight ${light ? "text-[#fff]" : "text-slate-900"}`}>
        TaskFlow
      </span>
    </Link>
  );
}