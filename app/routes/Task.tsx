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

    const updatedTask = {
      ...editForm,
      status: task.status, // keep status unchanged here
    };

    // Your update logic here: for example, call your API or supabase to update task
    // Then call onEdit with updated task

    onEdit(updatedTask);
    setIsEditing(false);
    alert("Task updated successfully");
  };
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 1);
  };

  
  return (
    <div
      style={style}
      className="relative bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow text-black"
    >
      {/* Header: Dropdown + Drag Handle */}
      <div className="flex justify-between items-center text-gray-500 text-sm mb-1">
        <span></span>
        <div className="flex items-center space-x-1">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => setOpenDropdown(!openDropdown)}
          >
            <BsThreeDotsVertical size={18} />
          </button>
          <span
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="cursor-grab p-1 text-gray-400 hover:text-gray-600"
            title="Drag"
          >
            <RxDragHandleDots2 />
          </span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {openDropdown && (
        <div className="dropdown-menu absolute right-2 top-10 w-40 bg-white border rounded-md shadow-md z-10">
          <button
            onClick={() => {
              setOpenDropdown(false);
              setIsEditing(true);
            }}
            className="block w-full px-4 py-2 text-left text-green-600 hover:bg-gray-100"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              setOpenDropdown(false);
              if (confirm("Are you sure you want to delete this task?")) {
                onDelete(task.tid);
              }
            }}
            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Modal Edit Form */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
            <form onSubmit={handleEditSave}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Due Date</label>
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, due_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      priority: e.target.value as "high" | "medium" | "low",
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Info */}
      <div className="font-semibold text-gray-800 text-md mb-1">{task.title}</div>
      <div className="text-sm text-gray-600">📝 Description: {task.description || "no description"}</div>
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
          user.image ? (
            <img
              key={user.uid}
              src={user.image}
              alt={user.uname}
              title={user.uname}
              className="w-7 h-7 rounded-full object-cover border border-gray-300"
            />

          ): (
            <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {getInitials(user.uname)}
            </div>
          )
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
