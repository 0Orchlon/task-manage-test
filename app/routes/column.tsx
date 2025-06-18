import React from "react";
import { useDroppable } from "@dnd-kit/core";
import Task from "./Task";

type TaskType = {
  tid: number;
  title: string;
  due_date: string;
  priority: "high" | "medium" | "low";
  status: number;
};

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onEdit: (updatedTask: TaskType) => void;
  onDelete: (tid: number | string) => void;
}

export default function Column({
  id,
  title,
  tasks,
  onEdit,
  onDelete,
}: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[300px] p-4 rounded-lg transition-colors duration-200 shadow-md ${
        isOver ? "bg-green-100" : "bg-white"
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400">No tasks here.</p>
      ) : (
        tasks.map((task) => (
          <Task
            key={task.tid}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}