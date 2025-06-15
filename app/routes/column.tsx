import React from "react";
import { useDroppable } from "@dnd-kit/core";
import Task from "./Task";

type TaskType = {
  tid: number;
  title: string;
  due_date: string;
  priority: string;
  status: number;
};

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onAddTask: (status: number) => void; // <-- add this
}

export default function Column({ id, title, tasks, onAddTask }: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const statusMap: Record<string, number> = {
    todo: 1,
    "in-progress": 2,
    done: 3,
  };

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
        tasks.map((task) => <Task key={task.tid} task={task} />)
      )}

      <button
        onClick={() => onAddTask(statusMap[id])}
        className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        + Add Task
      </button>
    </div>
  );
}
