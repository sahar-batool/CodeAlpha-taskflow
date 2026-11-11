import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";

export default function Column({ column, tasks, isOwner, onAddTask, onDelete, onOpenTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column._id });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    setTitle("");
    await onAddTask(column._id, value);
  };

  return (
    <div className="flex max-h-full w-72 shrink-0 flex-col rounded-2xl bg-slate-100 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700">
          {column.title} <span className="ml-1 text-xs font-medium text-slate-400">{tasks.length}</span>
        </h3>
        {isOwner && (
          <button onClick={() => onDelete(column)} aria-label={`Delete ${column.title}`} className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div ref={setNodeRef} className={`min-h-10 flex-1 space-y-2.5 overflow-y-auto rounded-xl p-0.5 transition-colors ${isOver ? "bg-brand-50" : ""}`}>
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>
      </div>

      {adding ? (
        <form onSubmit={submit} className="mt-3">
          <input
            autoFocus
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
            onBlur={() => !title.trim() && setAdding(false)}
            placeholder="Task title, then Enter"
            className="w-full rounded-xl border border-brand-500 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-3 flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-800">
          <Plus size={16} /> Add task
        </button>
      )}
    </div>
  );
}