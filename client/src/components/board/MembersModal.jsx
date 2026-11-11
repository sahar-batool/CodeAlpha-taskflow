import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../lib/api";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { initials } from "../../lib/utils";

export default function MembersModal({ open, onClose, project, isOwner, onProjectChange, onMemberRemoved }) {
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email");
    setAdding(true);
    try {
      const res = await api.post(`/projects/${project._id}/members`, { email });
      onProjectChange(res.data.project);
      setEmail("");
      toast.success("Member added");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (member) => {
    if (!window.confirm(`Remove ${member.user.name} from this project?`)) return;
    try {
      await api.delete(`/projects/${project._id}/members/${member.user._id}`);
      onProjectChange({ ...project, members: project.members.filter((m) => m.user._id !== member.user._id) });
      onMemberRemoved();
      toast.success("Member removed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Project members">
      <ul className="space-y-2">
        {project.members.map((m) => (
          <li key={m.user._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {initials(m.user.name)}
              </span>
              <div>
                <p className="text-sm font-semibold">{m.user.name}</p>
                <p className="text-xs text-slate-500">{m.user.email}</p>
              </div>
            </div>
            {m.role === "owner" ? (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">Owner</span>
            ) : (
              isOwner && (
                <button onClick={() => handleRemove(m)} aria-label={`Remove ${m.user.name}`} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <X size={16} />
                </button>
              )
            )}
          </li>
        ))}
      </ul>

      {isOwner ? (
        <form onSubmit={handleAdd} className="mt-5 space-y-3 border-t border-slate-100 pt-5">
          <Input label="Invite by email" type="email" placeholder="teammate@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" loading={adding} className="w-full">Add member</Button>
          <p className="text-xs text-slate-500">The person must already have a TaskFlow account.</p>
        </form>
      ) : (
        <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">Only the project owner can add or remove members.</p>
      )}
    </Modal>
  );
}