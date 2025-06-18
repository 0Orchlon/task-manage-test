// KanbanBoard.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";
import { DndContext } from "@dnd-kit/core";
import Column from "./column";

type Task = {
  tid: number;
  title: string;
  due_date: string;
  priority: "high" | "medium" | "low";
  status: number;
};

interface KanbanBoardProps {
  tasks: Task[];
}

const getStatusFromId = (id: string): number => {
  switch (id) {
    case "todo":
      return 1;
    case "in-progress":
      return 2;
    case "done":
      return 3;
    default:
      return 1;
  }
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks }) => {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleEdit = (updatedTask: Task) => {
    setLocalTasks((prev) =>
      prev.map((t) => (t.tid === updatedTask.tid ? updatedTask : t))
    );
  };

  const handleDelete = async (tid: number | string) => {
    const taskId = typeof tid === "string" ? parseInt(tid) : tid;
    const { error } = await supabase.from("t_tasks").delete().eq("tid", taskId);
    if (error) {
      alert("Устгах үед алдаа гарлаа: " + error.message);
      return;
    }
    setLocalTasks((prev) => prev.filter((t) => t.tid !== taskId));
  };
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || !active.id) return;

    const newStatus = getStatusFromId(over.id);
    const taskId = parseInt(active.id);

    console.log("Moved task:", active.id, "to column:", over.id);

    setLocalTasks((prev) =>
      prev.map((task) =>
        task.tid.toString() === active.id
          ? { ...task, status: getStatusFromId(over.id) }
          : task
      )
    );

    const { error } = await supabase
      .from("t_tasks") // your table name
      .update({ status: newStatus }) // update status
      .eq("tid", taskId); // filter by ID

    if (error) {
      console.error("Supabase update error:", error.message);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-100 min-h-screen">
        <Column
          id="todo"
          title="To Do"
          tasks={localTasks.filter((t) => t.status === 1)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <Column
          id="in-progress"
          title="In Progress"
          tasks={localTasks.filter((t) => t.status === 2)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <Column
          id="done"
          title="Done"
          tasks={localTasks.filter((t) => t.status === 3)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
