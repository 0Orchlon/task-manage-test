import { useState, useRef, useEffect } from "react";
import Tasks from "../components/tasks";
import { useNavigate } from "react-router";
import { DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined, MoreOutlined } from "@ant-design/icons";
import { supabase } from "~/supabase";

interface Project {
  proid: number;
  proname: string;
}

interface Task {
  tid: number;
  title: string;
  proid: number;
}

interface SidebarProps {
  projects?: Project[];
  tasks?: Task[];
  onNewProject: () => void;
  onDeleteProject: (proid: number) => void;
  onTaskClick?: (taskId: number) => void;
  onProjectRename?: (proid: number, newName: string) => void;
}

export default function Sidebar({
  projects = [],
  tasks = [],
  onNewProject,
  onDeleteProject,
  onTaskClick,
  onProjectRename,
}: SidebarProps) {
  const [openProject, setOpenProject] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [localProjects, setLocalProjects] = useState<Project[]>(projects); // uurchlult shuud haruulah
  const [contextMenu, setContextMenu] = useState<{ proid: number; x: number; y: number } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null); // ustgah zuvshuuruh
  const [confirmingEdit, setConfirmingEdit] = useState<{ proid: number; newName: string } | null>(null); // edit batalgaajuulah
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null); // gadna darah ued songoson component haah

  // local deerh uurchlult haruulah
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  // gadna darh ued haah function
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingId !== null && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        cancelEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingId]);

  const handleEdit = (project: Project) => {
    setEditingId(project.proid);
    setEditValue(project.proname);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleEditSave = () => {
    if (editingId !== null && editValue.trim()) {
      setConfirmingEdit({ proid: editingId, newName: editValue });
    }
  };

  const confirmEdit = async (proid: number, newName: string) => {
    const { error } = await supabase
      .from("t_project")
      .update({ proname: newName })
      .eq("proid", proid);

    if (error) {
      console.error("Failed to update project:", error);
      alert("Failed to update project name. Please try again.");
      return;
    }

    if (onProjectRename) {
      onProjectRename(proid, newName);
    }
    setConfirmingEdit(null);
    setEditingId(null);
  };

  const cancelEdit = () => {
    const project = localProjects.find(p => p.proid === editingId);
    if (project) {
      setEditValue(project.proname); // neriig dahin uurchluh
    }
    setEditingId(null);
    setConfirmingEdit(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, proid: number) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const handleDeleteClick = (proid: number) => {
    setDeletingId(proid); // delete confirmation haruulah
  };

  const confirmDelete = async (proid: number) => {
    try {
      const { error: tasksError } = await supabase
        .from("t_tasks")
        .delete()
        .eq("proid", proid);

      if (tasksError) {
        throw new Error("Failed to delete associated tasks");
      }

      onDeleteProject(proid);
      setDeletingId(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const handleContextMenu = (event: React.MouseEvent, proid: number) => {
    event.preventDefault();
    setContextMenu({ proid, x: event.pageX, y: event.pageY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // editelj baih ued haruulah
  useEffect(() => {
    if (editingId !== null) {
      setLocalProjects(prevProjects =>
        prevProjects.map(project =>
          project.proid === editingId ? { ...project, proname: editValue } : project
        )
      );
    }
  }, [editValue, editingId]);

  return (
    <aside ref={sidebarRef} className="w-64 bg-gray-800 text-white p-4 flex flex-col relative">
      <h2 className="text-lg font-semibold mb-4">NOTIFICATION</h2>
      <ul className="space-y-2">
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-4">PROJECTS</h2>
      <ul className="space-y-2">
        {localProjects.length === 0 && (
          <li className="text-gray-400">Project байхгүй</li>
        )}
        {localProjects.map((project) => (
          <li key={project.proid} onContextMenu={(e) => handleContextMenu(e, project.proid)}>
            <div className="flex items-center justify-between cursor-pointer">
              <div
                className="flex items-center cursor-pointer"
                onClick={() =>
                  setOpenProject(openProject === project.proid ? null : project.proid)
                }
              >
                <span className="mr-2">
                  {openProject === project.proid ? "📂" : "📁"}
                </span>
                {editingId === project.proid ? (
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)} // shuud ner uurchlult haruulah
                    onKeyDown={(e) => handleKeyPress(e, project.proid)}
                    className="text-white px-1 rounded w-32"
                    autoFocus
                  />
                ) : (
                  <span>{project.proname}</span>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => navigate(`/tasks/new?proid=${project.proid}`)}
                  title="Add Task"
                >
                  +
                </button>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700"
                  onClick={(e) => handleContextMenu(e, project.proid)}
                  title="More Options"
                >
                  <MoreOutlined />
                </button>
              </div>
            </div>
            {openProject === project.proid && (
              <div className="ml-6 mt-2">
                <Tasks
                  tasks={tasks.filter((task) => task.proid === project.proid)}
                  proid={project.proid}
                  onTaskClick={onTaskClick}
                />
              </div>
            )}
            {deletingId === project.proid && (
              <div className="ml-6 mt-2 p-2 bg-gray-700 rounded">
                <p>Are you sure you want to delete "{project.proname}"?</p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    onClick={() => confirmDelete(project.proid)}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {confirmingEdit?.proid === project.proid && (
              <div className="ml-6 mt-2 p-2 bg-gray-700 rounded">
                <p>Confirm change to "{confirmingEdit.newName}"?</p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    onClick={() => confirmEdit(confirmingEdit.proid, confirmingEdit.newName)}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        <li className="text-blue-400 cursor-pointer" onClick={onNewProject}>
          + NEW PROJECT
        </li>
      </ul>

      {contextMenu && (
        <div
          className="absolute bg-white text-black shadow-lg rounded p-2 z-10"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={handleCloseContextMenu}
          onContextMenu={(e) => e.stopPropagation()}
        >
          <ul className="min-w-[150px]">
            <li
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleEdit(localProjects.find(p => p.proid === contextMenu.proid)!);
                handleCloseContextMenu();
              }}
            >
              <EditOutlined className="mr-2" /> Rename
            </li>
            <li
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleDeleteClick(contextMenu.proid);
                handleCloseContextMenu();
              }}
            >
              <DeleteOutlined className="mr-2 text-red-600" /> Delete
            </li>
            <li
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleCloseContextMenu();
              }}
            >
              Cancel
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
}