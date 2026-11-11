import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import { initials, priorityStyles, formatDate } from "../../lib/utils";

export function TaskCardView({ task, dragging = false }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md ${dragging ? "rotate-2 shadow-xl" : ""}`}>
      <p className="text-sm font-medium text-slate-800">{task.title}</p>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar size={12} /> {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.assignee && (
          <span title={task.assignee.name} className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
            {initials(task.assignee.name)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TaskCard({ task, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`touch-none ${isDragging ? "opacity-40" : ""}`}
      onClick={() => onOpen?.(task)}
      {...attributes}
      {...listeners}
    >
      <TaskCardView task={task} />
    </div>
  );
}