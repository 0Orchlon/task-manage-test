import { useState, useRef, useEffect } from "react";
import Tasks from "../components/tasks";
import { useNavigate } from "react-router";
import { DeleteOutlined, EditOutlined, MoreOutlined, UserAddOutlined } from "@ant-design/icons";
import { supabase } from "~/supabase";
import SearchUserAdd from "../components/SearchUserAdd";
import Reminder from "~/components/remindercomp";

interface Project {
  proid: number;
  proname: string;
}

interface Task {
  tid: number;
  title: string;
  proid: number;
}

interface User {
  uid: string;
  uname: string;
  image?: string | null;
}

interface SidebarProps {
  projects?: Project[];
  tasks?: Task[];
  onSelectProject: (proid: number) => void;
  onNewProject: () => void;
  onDeleteProject: (proid: number) => void;
  onTaskClick?: (taskId: number) => void;
  onProjectRename?: (proid: number, newName: string) => void;
  setSelectedProjectId: (id: number) => void;
  selectedProjectId: number | null;

}

export default function Sidebar({
  projects = [],
  tasks = [],
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onTaskClick,
  onProjectRename,
}: SidebarProps) {
  const [openProject, setOpenProject] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [contextMenu, setContextMenu] = useState<{ proid: number; x: number; y: number } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [addPeopleDialog, setAddPeopleDialog] = useState<{ proid: number; x: number; y: number } | null>(null);
  const [projectUsers, setProjectUsers] = useState<{ [key: number]: User[] }>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
if (Array.isArray(projects)) {
    setLocalProjects(projects);
  }
}, [projects]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (editingId !== null || addPeopleDialog !== null) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setEditingId(null);
        setAddPeopleDialog(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingId, addPeopleDialog]);

  // Fetch users for the selected project
  useEffect(() => {
    const fetchProjectUsers = async () => {
      if (openProject !== null) {
        const { data, error } = await supabase
          .from("t_project_users")
          .select("uid")
          .eq("proid", openProject);
        if (error) {
          console.error("Хэрэглэгчдийг нэмэхэд алдаа гарлаа:", error.message);
          return;
        }
        const userIds = data.map((item) => item.uid);
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from("t_users")
            .select("uid, uname, image")  
            .in("uid", userIds);
          if (usersError) {
            console.error("Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа:", usersError.message);
            return;
          }
          setProjectUsers((prev) => ({ ...prev, [openProject]: users || [] }));
        } else {
          setProjectUsers((prev) => ({ ...prev, [openProject]: [] }));
        }
      }
    };
    fetchProjectUsers();
  }, [openProject]);

  const handleEdit = (project: Project) => {
    setEditingId(project.proid);
    setEditValue(project.proname);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleEditSave = async (proid: number, newName: string) => {
    if (!newName.trim()) return;
    const { error } = await supabase
      .from("t_project")
      .update({ proname: newName })
      .eq("proid", proid);
    if (error) {
      console.error("Проектыг шинэчлэхэд алдаа гарлаа:", error.message);
      alert(`Проектын нэрийг шинэчлэхэд алдаа гарлаа: ${error.message}`);
      return;
    }
    onProjectRename?.(proid, newName);
    setEditingId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, proid: number) => {
    if (e.key === "Enter") {
      handleEditSave(proid, editValue);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleDeleteClick = (proid: number) => {
    setDeletingId(proid);
  };

  const confirmDelete = async (proid: number) => {
    try {
      const { error: tasksError } = await supabase
        .from("t_tasks")
        .delete()
        .eq("proid", proid);
      if (tasksError) throw new Error(`Даалгавруудыг устгахад алдаа гарлаа: ${tasksError.message}`);
      const { error: projectError } = await supabase
        .from("t_project")
        .delete()
        .eq("proid", proid);
      if (projectError) throw new Error(`Проектыг устгахад алдаа гарлаа: ${projectError.message}`);
      onDeleteProject(proid);
      setDeletingId(null);
    } catch (error: any) {
      console.error("Проектыг устгахад алдаа гарлаа:", error.message);
      alert(`Проектыг устгахад алдаа гарлаа: ${error.message}`);
    }
  };

  const handleRemoveUser = async (proid: number, uid: string) => {
    try {
      const { error } = await supabase
        .from("t_project_users")
        .delete()
        .eq("proid", proid)
        .eq("uid", uid);
      if (error) throw new Error(`Хэрэглэгчийг устгахад алдаа гарлаа: ${error.message}`);
      setProjectUsers((prev) => ({
        ...prev,
        [proid]: prev[proid]?.filter((user) => user.uid !== uid) || [],
      }));
    } catch (error: any) {
      console.error("Хэрэглэгчийг устгахад алдаа гарлаа:", error.message);
      alert(`Хэрэглэгчийг устгахад алдаа гарлаа: ${error.message}`);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, proid: number) => {
    event.preventDefault();
    setContextMenu({ proid, x: event.pageX, y: event.pageY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleAddPeople = (proid: number, x: number, y: number) => {
    setContextMenu(null);
    setAddPeopleDialog({ proid, x, y });
  };

  const handleCloseAddPeopleDialog = () => {
    setAddPeopleDialog(null);
  };

  return (
    <aside ref={sidebarRef} className="w-64 bg-gray-800 text-white p-4 flex flex-col relative">
      <h2 className="text-lg font-semibold mb-4">МЭДЭЭЛЭЛ</h2>
<Reminder 
/>

      <h2 className="text-lg font-semibold mt-6 mb-4">Projects</h2>
      <ul className="space-y-2">
        {localProjects.length === 0 && <li className="text-gray-400">Projects байхгүй</li>}
        {localProjects.map((project) => (
          <li key={project.proid} onContextMenu={(e) => handleContextMenu(e, project.proid)}>
            <div className="flex items-center justify-between">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => {
                  setOpenProject(openProject === project.proid ? null : project.proid);
                  onSelectProject(project.proid);
                }}
              >
                <span className="mr-2">{openProject === project.proid ? "📂" : "📁"}</span>
                {editingId === project.proid ? (
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, project.proid)}
                    className="text-white bg-gray-700 px-1 rounded w-32"
                    autoFocus
                  />
                ) : (
                  <span>{project.proname}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => navigate(`/tasks/new?proid=${project.proid}`)}
                >
                  +
                </button>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700"
                  onClick={(e) => handleContextMenu(e, project.proid)}
                >
                  <MoreOutlined />
                </button>
              </div>
            </div>
            {openProject === project.proid && (
              <div className="ml-6 mt-2">
                {/* <Tasks
                  tasks={tasks.filter((task) => task.proid === project.proid)}
                  proid={project.proid}
                  onTaskClick={onTaskClick}
                /> */}
                <h4 className="text-sm font-medium mt-2">Багийн гишүүд:</h4>
                <ul className="mt-1 space-y-1">
                  {projectUsers[project.proid]?.length > 0 ? (
                    projectUsers[project.proid].map((user) => (
                      <li key={user.uid} className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          {user.image && (
                            <img
                              src={user.image}
                              alt={user.uname}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span>{user.uname}</span>
                        </div>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={() => handleRemoveUser(project.proid, user.uid)}
                        >
                          <DeleteOutlined />
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">Гишүүд алга</li>
                  )}
                </ul>
              </div>
            )}
            {deletingId === project.proid && (
              <div className="ml-6 mt-2 p-2 bg-gray-700 rounded">
                <p>"{project.proname}"-г устгах уу?</p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    onClick={() => confirmDelete(project.proid)}
                  >
                    Баталгаажуулах
                  </button>
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700"
                    onClick={() => setDeletingId(null)}
                  >
                    Цуцлах
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        <li className="text-blue-400 cursor-pointer" onClick={onNewProject}>
          + ШИНЭ ПРОЖЕКТ
        </li>
      </ul>

      {contextMenu && (
        <div
          className="absolute bg-white text-black shadow-lg rounded p-2 z-10"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={handleCloseContextMenu}
        >
          <ul className="min-w-[150px]">
            <li
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleEdit(localProjects.find((p) => p.proid === contextMenu.proid)!)}
            >
              <EditOutlined className="mr-2" /> Rename
            </li>
            <li
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleAddPeople(contextMenu.proid, contextMenu.x, contextMenu.y)}
            >
              <UserAddOutlined className="mr-2 text-blue-600" /> Хүн нэмэх
            </li>
            <li
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleDeleteClick(contextMenu.proid)}
            >
              <DeleteOutlined className="mr-2 text-red-600" /> Delete
            </li>
            <li className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Цуцлах</li>
          </ul>
        </div>
      )}

      {addPeopleDialog && (
        <div
          className="absolute bg-white text-black shadow-lg rounded p-4 z-10"
          style={{ top: addPeopleDialog.y, left: addPeopleDialog.x, width: '300px', maxHeight: '400px' }}
        >
          <h3 className="text-lg font-semibold mb-2">Хүн нэмэх</h3>
          <SearchUserAdd
            proid={addPeopleDialog.proid}
            onUserAdded={handleCloseAddPeopleDialog}
          />
          <div className="mt-2 flex justify-between">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
              onClick={() => alert("Тусламж хэсэгт холбоо барина уу!")}
            >
              Тусламж
            </button>
            <button
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700"
              onClick={handleCloseAddPeopleDialog}
            >
              Хаах
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}