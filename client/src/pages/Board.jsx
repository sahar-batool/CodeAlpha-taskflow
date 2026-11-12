import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import Column from "../components/board/Column";
import { TaskCardView } from "../components/board/TaskCard";
import MembersModal from "../components/board/MembersModal";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import TaskModal from "../components/board/TaskModal";
import { socket } from "../lib/socket";

const groupTasks = (columns, tasks) => {
  const map = {};
  columns.forEach((c) => (map[c._id] = []));
  tasks.forEach((t) => map[t.column]?.push(t));
  return map;
};

export default function Board() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [role, setRole] = useState(null);
  const [columns, setColumns] = useState([]);
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newColumn, setNewColumn] = useState(null);
  const startRef = useRef(null);

  const isOwner = role === "owner";

  const loadBoard = useCallback(async () => {
    try {
      const [p, b] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/board`),
      ]);
      setProject(p.data.project);
      setRole(p.data.role);
      setColumns(b.data.columns);
      setItems(groupTasks(b.data.columns, b.data.tasks));
    } catch (err) {
      toast.error(getErrorMessage(err));
      navigate("/dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

    const refreshBoard = useCallback(async () => {
    if (startRef.current) return setTimeout(() => refreshBoard(), 800);
    try {
      const [p, b] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/board`),
      ]);
      setProject(p.data.project);
      setRole(p.data.role);
      setColumns(b.data.columns);
      setItems(groupTasks(b.data.columns, b.data.tasks));
    } catch {
      
    }
  }, [projectId]);

    
  useEffect(() => {
    const join = () => socket.emit("project:join", projectId);
    const onReconnect = () => {
      join();
      refreshBoard();
    };
    if (socket.connected) join();
    socket.on("connect", onReconnect);
    return () => {
      socket.off("connect", onReconnect);
      socket.emit("project:leave", projectId);
    };
  }, [projectId, refreshBoard]);


  useEffect(() => {
    const onCreated = (task) =>
      setItems((prev) =>
        !prev[task.column] || prev[task.column].some((t) => t._id === task._id)
          ? prev
          : { ...prev, [task.column]: [...prev[task.column], task] }
      );

    const onUpdated = (task) =>
      setItems((prev) =>
        !prev[task.column]
          ? prev
          : { ...prev, [task.column]: prev[task.column].map((t) => (t._id === task._id ? task : t)) }
      );

    const onDeleted = ({ id, column }) =>
      setItems((prev) =>
        !prev[column] ? prev : { ...prev, [column]: prev[column].filter((t) => t._id !== id) }
      );

    const onProjectDeleted = () => {
      toast("This project was deleted by its owner");
      navigate("/dashboard", { replace: true });
    };

    const onRemoved = ({ projectId: id }) => {
      if (id !== projectId) return;
      toast("You were removed from this project");
      navigate("/dashboard", { replace: true });
    };

    socket.on("task:created", onCreated);
    socket.on("task:updated", onUpdated);
    socket.on("task:deleted", onDeleted);
    socket.on("board:refresh", refreshBoard);
    socket.on("project:deleted", onProjectDeleted);
    socket.on("member:removed", onRemoved);
    return () => {
      socket.off("task:created", onCreated);
      socket.off("task:updated", onUpdated);
      socket.off("task:deleted", onDeleted);
      socket.off("board:refresh", refreshBoard);
      socket.off("project:deleted", onProjectDeleted);
      socket.off("member:removed", onRemoved);
    };
  }, [projectId, navigate, refreshBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const findColumn = (id) => {
    if (id in items) return id;
    return Object.keys(items).find((colId) => items[colId].some((t) => t._id === id));
  };

  const handleDragStart = ({ active }) => {
    const col = findColumn(active.id);
    const index = items[col].findIndex((t) => t._id === active.id);
    startRef.current = { column: col, index };
    setActiveTask(items[col][index]);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const fromCol = findColumn(active.id);
    const toCol = findColumn(over.id);
    if (!fromCol || !toCol || fromCol === toCol) return;

    setItems((prev) => {
      const fromItems = prev[fromCol];
      const toItems = prev[toCol];
      const task = fromItems.find((t) => t._id === active.id);
      const overIndex = toItems.findIndex((t) => t._id === over.id);
      const insertAt = overIndex >= 0 ? overIndex : toItems.length;
      return {
        ...prev,
        [fromCol]: fromItems.filter((t) => t._id !== active.id),
        [toCol]: [...toItems.slice(0, insertAt), { ...task, column: toCol }, ...toItems.slice(insertAt)],
      };
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    const start = startRef.current;
    startRef.current = null;
    setActiveTask(null);
    if (!over || !start) return;

    const col = findColumn(active.id);
    if (!col) return;

    let list = items[col];
    const from = list.findIndex((t) => t._id === active.id);
    const to = list.findIndex((t) => t._id === over.id);
    if (to >= 0 && from !== to) {
      list = arrayMove(list, from, to);
      setItems((prev) => ({ ...prev, [col]: list }));
    }

    const position = list.findIndex((t) => t._id === active.id);
    if (col === start.column && position === start.index) return;

    try {
      await api.patch(`/tasks/${active.id}/move`, { column: col, position });
    } catch (err) {
      toast.error(getErrorMessage(err));
      loadBoard();
    }
  };

  const handleAddTask = async (columnId, title) => {
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, { column: columnId, title });
      setItems((prev) => ({ ...prev, [columnId]: [...prev[columnId], res.data.task] }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    const title = newColumn.trim();
    if (!title) return setNewColumn(null);
    try {
      const res = await api.post(`/projects/${projectId}/columns`, { title });
      setColumns((prev) => [...prev, res.data.column]);
      setItems((prev) => ({ ...prev, [res.data.column._id]: [] }));
      setNewColumn(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteColumn = async (column) => {
    const count = items[column._id]?.length || 0;
    const msg = count
      ? `Delete "${column.title}" and its ${count} task(s)? This cannot be undone.`
      : `Delete "${column.title}"?`;
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/columns/${column._id}`);
      setColumns((prev) => prev.filter((c) => c._id !== column._id));
      setItems((prev) => {
        const next = { ...prev };
        delete next[column._id];
        return next;
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete "${project.name}" and everything in it? This cannot be undone.`)) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success("Project deleted");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  const selectedTask = selectedId
  ? Object.values(items).flat().find((t) => t._id === selectedId) || null
  : null;

const handleTaskUpdated = (task) => {
  setItems((prev) => ({
    ...prev,
    [task.column]: prev[task.column].map((t) => (t._id === task._id ? task : t)),
  }));
};

const handleTaskDeleted = (task) => {
  setItems((prev) => ({
    ...prev,
    [task.column]: prev[task.column].filter((t) => t._id !== task._id),
  }));
  setSelectedId(null);
};
  if (loading || !project) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-brand-600">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" aria-label="Back to dashboard" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold leading-tight">{project.name}</h1>
            {project.description && <p className="line-clamp-1 text-sm text-slate-500">{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setMembersOpen(true)}>
            <Users size={16} /> {project.members.length}
          </Button>
          {isOwner && (
            <Button variant="ghost" onClick={handleDeleteProject} aria-label="Delete project" className="text-red-600 hover:bg-red-50">
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => { setActiveTask(null); loadBoard(); }}
        >
          <div className="flex h-full items-start gap-4">
            {columns.map((col) => (
              <Column
                key={col._id}
                column={col}
                tasks={items[col._id] || []}
                isOwner={isOwner}
                onAddTask={handleAddTask}
                onDelete={handleDeleteColumn}
                onOpenTask={(task) => setSelectedId(task._id)}
              />
            ))}

            <div className="w-72 shrink-0">
              {newColumn === null ? (
                <button onClick={() => setNewColumn("")} className="flex w-full items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-500 hover:border-brand-500 hover:text-brand-600">
                  <Plus size={16} /> Add column
                </button>
              ) : (
                <form onSubmit={handleAddColumn} className="rounded-2xl bg-slate-100 p-3">
                  <input
                    autoFocus
                    value={newColumn}
                    maxLength={50}
                    onChange={(e) => setNewColumn(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && setNewColumn(null)}
                    onBlur={() => !newColumn.trim() && setNewColumn(null)}
                    placeholder="Column title, then Enter"
                    className="w-full rounded-xl border border-brand-500 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </form>
              )}
            </div>
          </div>

          <DragOverlay>{activeTask && <TaskCardView task={activeTask} dragging />}</DragOverlay>
        </DndContext>
      </div>

      <MembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        project={project}
        isOwner={isOwner}
        onProjectChange={setProject}
        onMemberRemoved={loadBoard}
      />

      <TaskModal
  task={selectedTask}
  project={project}
  isOwner={isOwner}
  onClose={() => setSelectedId(null)}
  onUpdated={handleTaskUpdated}
  onDeleted={handleTaskDeleted}
/>
    </div>
  );
}