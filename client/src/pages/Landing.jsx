import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard, Users, MessageSquare, Zap, Shield, Bell } from "lucide-react";
import Logo from "../components/Logo";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12 } }),
};

const features = [
  { icon: LayoutDashboard, title: "Kanban boards", text: "Drag tasks between columns and see progress at a glance." },
  { icon: Users, title: "Team projects", text: "Invite teammates and assign tasks to the right people." },
  { icon: MessageSquare, title: "Task discussions", text: "Keep every conversation next to the work it belongs to." },
  { icon: Zap, title: "Real-time updates", text: "Changes appear instantly for everyone. No refresh needed." },
  { icon: Bell, title: "Notifications", text: "Get notified when you're assigned or mentioned." },
  { icon: Shield, title: "Private and secure", text: "Only project members can ever see your project data." },
];

const steps = [
  { n: "1", title: "Create a project", text: "Start a board in seconds with ready-made columns." },
  { n: "2", title: "Invite your team", text: "Add members by email and assign tasks." },
  { n: "3", title: "Collaborate", text: "Move cards, comment, and watch progress live." },
];

const board = [
  { title: "To Do", cards: [{ t: "Design homepage", c: "bg-red-100 text-red-700", p: "High" }, { t: "Write API docs", c: "bg-amber-100 text-amber-700", p: "Medium" }] },
  { title: "In Progress", cards: [{ t: "Build auth flow", c: "bg-red-100 text-red-700", p: "High" }] },
  { title: "Done", cards: [{ t: "Project setup", c: "bg-emerald-100 text-emerald-700", p: "Low" }, { t: "Pick tech stack", c: "bg-emerald-100 text-emerald-700", p: "Low" }] },
];

function Navbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          {user ? (
            <Link to="/dashboard"><Button>Open dashboard</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost">Log in</Button></Link>
              <Link to="/signup"><Button>Get started</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function BoardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="mx-auto mt-16 max-w-4xl"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-2xl shadow-brand-600/10 backdrop-blur sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {board.map((col, ci) => (
            <div key={col.title} className="rounded-2xl bg-slate-100/80 p-3">
              <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{col.title}</p>
              <div className="space-y-2.5">
                {col.cards.map((card, i) => (
                  <motion.div
                    key={card.t}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + ci * 0.2 + i * 0.12 }}
                    className="rounded-xl bg-white p-3 text-left shadow-sm"
                  >
                    <p className="text-sm font-medium text-slate-800">{card.t}</p>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${card.c}`}>{card.p}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="overflow-x-hidden">
      <Navbar />

      <section className="relative px-6 pb-24 pt-20 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-brand-100 blur-3xl" />
        <motion.div initial="hidden" animate="show" className="mx-auto max-w-3xl">
          <motion.span variants={fadeUp} custom={0} className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
            Real-time project collaboration
          </motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="mt-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Manage projects with your team,{" "}
            <span className="bg-linear-to-r from-brand-600 to-purple-500 bg-clip-text text-transparent">effortlessly</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
            Boards, task assignment, and comments in one clean workspace. Everyone stays in sync, instantly.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={user ? "/dashboard" : "/signup"}>
              <Button className="px-6 py-3 text-base">
                {user ? "Go to dashboard" : "Start for free"} <ArrowRight size={18} />
              </Button>
            </Link>
            {!user && <Link to="/login"><Button variant="secondary" className="px-6 py-3 text-base">Log in</Button></Link>}
          </motion.div>
        </motion.div>
        <BoardPreview />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center">
          <motion.h2 variants={fadeUp} className="text-3xl font-extrabold tracking-tight sm:text-4xl">Everything your team needs</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mt-3 text-slate-600">Simple tools that stay out of your way.</motion.p>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i % 3}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Get started in 3 steps</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">{s.n}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl rounded-3xl bg-linear-to-br from-brand-600 to-slate-900 px-8 py-16 text-center text-white"
        >
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to organize your next project?</h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-100">Create your free account and invite your team in minutes.</p>
          <Link to={user ? "/dashboard" : "/signup"}>
            <Button variant="secondary" className="mt-8 px-6 py-3 text-base">
              {user ? "Go to dashboard" : "Get started free"} <ArrowRight size={18} />
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <Logo />
          <p className="text-sm text-slate-500">Built with the MERN stack · © {new Date().getFullYear()} TaskFlow</p>
        </div>
      </footer>
    </div>
  );
}