import React, { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RxDragHandleDots2 } from "react-icons/rx";
import { supabase } from "~/supabase";

interface Task {
  tid: number;
  title: string;
  due_date: string;
  priority: "high" | "medium" | "low";
  status: number;
}

interface TaskProps {
  task: Task;
  onEdit: (updatedTask: Task) => void;
  onDelete: (tid: number | string) => void;
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

export default function Task({ task, onEdit, onDelete }: TaskProps) {
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
    try {
      const updatedTask = {
        tid: task.tid,
        title: editForm.title,
        due_date: editForm.due_date,
        priority: editForm.priority,
        status: task.status, // Preserve status
      };

      const { error } = await supabase
        .from("t_tasks")
        .update(updatedTask)
        .eq("tid", task.tid);

      if (error) {
        alert("Update error: " + error.message);
        return;
      }

      onEdit(updatedTask);
      setIsEditing(false);
      alert("Амжилттай шинэчлэгдлээ!");
    } catch (error) {
      alert("Unexpected error");
    }
  };

  return (
    <div
      style={style}
      className="relative bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center text-gray-500 text-sm mb-1">
        <span>ID: {task.tid}</span>
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
              if (confirm("Та энэ даалгаврыг устгах уу?")) {
                onDelete(task.tid);
              }
            }}
            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
          >
            🗑️ Delete
          </button>
        </div>
      )}

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

      <div className="font-semibold text-gray-800 text-md mb-1">
        {task.title}
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
    </div>
  );
}