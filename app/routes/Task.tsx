import React, { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RxDragHandleDots2 } from "react-icons/rx";

interface Task {
  tid: number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: number;
}

interface User {
  uid: string;
  uname: string;
  image?: string | null;
}

interface TaskProps {
  task: Task;
  users: User[];           // All project users
  assignedUsers: User[];   // Assigned users for this task
  onEdit: (updatedTask: Task) => void;
  onDelete: (tid: number | string) => void;
  onAssign: (taskId: number, userId: string) => void;
}

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-400";
    case "low":
      return "bg-green-400";
    default:
      return "bg-gray-400";
  }
};

export default function Task({
  task,
  users,
  assignedUsers,
  onEdit,
  onDelete,
  onAssign,
}: TaskProps) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Task>(task);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.tid.toString(),
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdown &&
        !(event.target as HTMLElement).closest(".dropdown-menu")
      ) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdown]);

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Your update logic here (unchanged)
  };

  return (
    <div
      style={style}
      className="relative bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow text-black"
    >
      {/* Dropdown and draggable handlers */}
      {/* ... */}
      {/* Task details */}
      <div className="font-semibold text-gray-800 text-md mb-1">
        {task.title}
      </div>
      <div className="text-sm text-gray-600">
        📝 Description: {task.description || "no description"}
      </div>
      <div className="text-sm text-gray-600">📅 Due: {task.due_date}</div>
      <div className="text-sm text-gray-600 mt-1">
        ⚡ Priority:{" "}
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-white text-xs ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
      </div>

      {/* Assigned Users Avatars */}
      <div className="flex space-x-2 mt-3">
        {assignedUsers.map((user) => (
          <img
            key={user.uid}
            src={user.image || "/default-avatar.png"}
            alt={user.uname}
            title={user.uname}
            className="w-7 h-7 rounded-full object-cover border border-gray-300"
          />
        ))}
      </div>

      {/* Assign Member Dropdown */}
      <div className="mt-3">
        <select
          onChange={(e) => {
            if (e.target.value) {
              onAssign(task.tid, e.target.value);
              e.target.value = "";
            }
          }}
          className="w-full text-sm px-2 py-1 border rounded text-black bg-white"
        >
          <option value="">+ Assign member</option>
          {users.map((u) => (
            <option key={u.uid} value={u.uid}>
              {u.uname}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
