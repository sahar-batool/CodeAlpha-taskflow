import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users, FolderKanban } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { socket } from "../lib/socket";

function ProjectSkeleton() {
  return <div className="h-36 animate-pulse rounded-2xl bg-slate-200/70" />;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get("/projects")
      .then((res) => setProjects(res.data.projects))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    const reload = () =>
      api
        .get("/projects")
        .then((res) => setProjects(res.data.projects))
        .catch(() => {});

    socket.on("projects:changed", reload);
    socket.on("connect", reload);
    return () => {
      socket.off("projects:changed", reload);
      socket.off("connect", reload);
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("Project name needs at least 2 characters");
    setCreating(true);
    try {
      const res = await api.post("/projects", form);
      const { data } = await api.get("/projects");
      setProjects(data.projects);
      setOpen(false);
      setForm({ name: "", description: "" });
      toast.success(`"${res.data.project.name}" created`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Hi, {user.name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-slate-500">Here are your projects.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={18} /> New project</Button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && [1, 2, 3].map((n) => <ProjectSkeleton key={n} />)}

        {!loading && projects.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <Link to={`/projects/${p._id}`} className="block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">{p.description || "No description"}</p>
              <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Users size={14} /> {p.members.length} member{p.members.length !== 1 && "s"}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {!loading && projects.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-3xl border-2 border-dashed border-slate-200 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <FolderKanban size={28} />
          </span>
          <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
          <p className="mt-1 text-sm text-slate-500">Create your first project to start collaborating.</p>
          <Button className="mt-5" onClick={() => setOpen(true)}><Plus size={18} /> Create project</Button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Project name" placeholder="Website redesign" value={form.name} maxLength={80} autoFocus
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Description (optional)</span>
            <textarea rows={3} maxLength={500} placeholder="What is this project about?" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </label>
          <Button type="submit" loading={creating} className="w-full">Create project</Button>
        </form>
      </Modal>
    </div>
  );
}