import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Logo from "./Logo";


const points = [
  "Boards your whole team can see",
  "Assign tasks and set due dates",
  "Comment right inside each task",
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-linear-to-br from-brand-600 via-brand-700 to-slate-900 p-12 text-[#fff] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#fff]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl" />
        <div className="relative"><Logo light /></div>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">
            Plan together.<br />Ship faster.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3 text-brand-100"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff]/20">
                  <Check size={14} />
                </span>
                {p}
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-brand-100/70">© {new Date().getFullYear()} TaskFlow</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        </motion.div>
      </div>
    </div>
  );
}