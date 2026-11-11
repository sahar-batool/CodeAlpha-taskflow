import { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { initials } from "../../lib/utils";
import { socket } from "../../lib/socket";

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

const toForm = (task) => ({
  title: task.title,
  description: task.description || "",
  priority: task.priority,
  dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
  assignee: task.assignee?._id || "",
});

function TaskDetails({ task, project, isOwner, onUpdated, onDeleted }) {
  const { user } = useAuth();
  const [form, setForm] = useState(() => toForm(task));
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(task));
  const canDelete = isOwner || task.createdBy === user.id;

  useEffect(() => {
    let active = true;
    api
      .get(`/tasks/${task._id}/comments`)
      .then((res) => active && setComments(res.data.comments))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => active && setLoadingComments(false));
    return () => {
      active = false;
    };
  }, [task._id]);

    useEffect(() => {
    const onNew = ({ taskId, comment }) => {
      if (taskId !== task._id) return;
      setComments((prev) => (prev.some((c) => c._id === comment._id) ? prev : [...prev, comment]));
    };
    const onDel = ({ taskId, id }) => {
      if (taskId === task._id) setComments((prev) => prev.filter((c) => c._id !== id));
    };
    socket.on("comment:created", onNew);
    socket.on("comment:deleted", onDel);
    return () => {
      socket.off("comment:created", onNew);
      socket.off("comment:deleted", onDel);
    };
  }, [task._id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const res = await api.patch(`/tasks/${task._id}`, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null,
        assignee: form.assignee || null,
      });
      onUpdated(res.data.task);
      toast.success("Task updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this task and its comments? This cannot be undone.")) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onDeleted(task);
      toast.success("Task deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/tasks/${task._id}/comments`, { text });
      setComments((prev) => [...prev, res.data.comment]);
      setText("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const removeComment = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4">
        <input aria-label="Task title" value={form.title} maxLength={120} onChange={set("title")}
          className="w-full rounded-xl border border-transparent px-2 py-1.5 text-xl font-bold hover:border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span>
          <textarea rows={4} maxLength={2000} value={form.description} onChange={set("description")}
            placeholder="Add more details..." className={field} />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Assignee</span>
            <select value={form.assignee} onChange={set("assignee")} className={field}>
              <option value="">Unassigned</option>
              {project.members.map((m) => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Priority</span>
            <select value={form.priority} onChange={set("priority")} className={field}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Due date</span>
            <input type="date" value={form.dueDate} onChange={set("dueDate")} className={field} />
          </label>
        </div>

        <div className="flex items-center justify-between">
          {canDelete ? (
            <Button type="button" variant="ghost" onClick={remove} className="text-red-600 hover:bg-red-50">
              <Trash2 size={16} /> Delete
            </Button>
          ) : <span />}
          <Button type="submit" loading={saving} disabled={!dirty}>Save changes</Button>
        </div>
      </form>

      <section className="border-t border-slate-100 pt-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>

        <div className="mt-4 space-y-4">
          {loadingComments && <div className="flex justify-center text-brand-600"><Spinner /></div>}
          {!loadingComments && comments.length === 0 && (
            <p className="text-sm text-slate-400">No comments yet. Start the conversation.</p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {initials(c.author.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{c.author.name}</span>
                  <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                  {(isOwner || c.author._id === user.id) && (
                    <button onClick={() => removeComment(c._id)} aria-label="Delete comment"
                      className="ml-auto rounded p-1 text-slate-300 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-700">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendComment} className="mt-5 flex gap-2">
          <input value={text} maxLength={1000} onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..." className={field} />
          <Button type="submit" loading={sending} aria-label="Send comment"><Send size={16} /></Button>
        </form>
      </section>
    </div>
  );
}

export default function TaskModal({ task, ...props }) {
  return (
    <Modal open={!!task} onClose={props.onClose} title="Task details" wide>
      {task && <TaskDetails key={task._id} task={task} {...props} />}
    </Modal>
  );
}