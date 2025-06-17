import { useEffect, useState } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import KanbanBoard from "./kanbanBoard";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Даалгаврын Удирдлага" },
    { name: "description", content: "Таны даалгавруудыг удирдах апп" },
  ];
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedProjId, setSelProject] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const navigate = useNavigate();

  const getTasks = async () => {
    if (selectedProjId) {
      const { data: tasksData, error: tasksError } = await supabase
        .from("t_tasks")
        .select("tid, title, status, due_date, priority")
        .eq("proid", selectedProjId);

      if (tasksError) {
        setError(`Даалгавруудыг татахад алдаа гарлаа: ${tasksError.message}`);
      } else {
        setTasks(tasksData);
      }
    } else {
      setTasks([]);
    }
  };

  // Load user and projects on first load
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);

      const { data: projectUser, error: projectUserError } = await supabase
        .from("t_project_users")
        .select("proid")
        .eq("uid", data.user.id);

      if (projectUserError) {
        setError(`Даалгаврыг харуулахад алдаа гарлаа: ${projectUserError.message}`);
        return;
      }

      const projectIds = projectUser.map((pu: any) => pu.proid);
      const { data: projectsData, error: projectsError } = await supabase
        .from("t_project")
        .select("proid, proname")
        .in("proid", projectIds);

      if (projectsError) {
        setError(`Төслийг татахад алдаа гарлаа: ${projectsError.message}`);
      } else {
        setProjects(projectsData || []);
        if (projectsData.length > 0) {
          setSelProject(projectsData[0].proid); // trigger task load
        }
      }
    };

    checkUser();
  }, [navigate]);

  // 🔁 Reload tasks when selected project changes
  useEffect(() => {
    getTasks();
  }, [selectedProjId]);

  const addNewProject = async () => {
    setError(null);

    if (!newProjectName.trim()) {
      setError("Төслийн нэрийг оруулна уу.");
      return;
    }

    try {
      const { data: insertedData, error: insertError } = await supabase
        .from("t_project")
        .insert([{ proname: newProjectName, proownuid: user.id }])
        .select();

      if (insertError) {
        setError(`Шинэ төсөл нэмэхэд алдаа гарлаа: ${insertError.message}`);
        return;
      }

      const newProject = insertedData[0];

      const { error: userLinkError } = await supabase
        .from("t_project_users")
        .insert([{
          proid: newProject.proid,
          uid: user.id,
          share_id: Math.floor(Math.random() * 1000000),
        }]);

      if (userLinkError) {
        setError(`Төсөлтэй хэрэглэгчийг холбоход алдаа гарлаа: ${userLinkError.message}`);
        return;
      }

      setProjects([...projects, newProject]);
      setNewProjectName("");
      setShowModal(false);
      setSelProject(newProject.proid);
    } catch (e) {
      setError(`Алдаа гарлаа: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  if (!user) {
    return <div>Ачааллаж байна...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        projects={projects}
        onNewProject={() => setShowModal(true)}
        onSelectProject={(projectId) => setSelProject(projectId)}
      />

      <div className="flex-1 flex flex-col">
        <Navbar user={user} />
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Тавтай морил, {user.user_metadata?.displayname || user.email}!
          </h2>
          {error && <p className="mb-4 text-red-500 text-center">{error}</p>}

          <h3 className="text-xl font-semibold mb-4 text-black">Таны даалгаврууд</h3>

          {/* ✅ Map s  tatus numbers to strings */}
          <KanbanBoard tasks={tasks} />

          {/* This shows the tasks as a list */}
{/* 
          <ul className="divide-y divide-gray-200 mt-6">
            {tasks.length === 0 && !error && (
              <li className="py-2 text-center text-gray-500">Даалгавар байхгүй</li>
            )}
            {tasks.map((task) => (
              <li key={task.tid} className="py-2">
                <span className="text-red-500">{task.title}</span> -{" "}
                <span className="text-gray-500">{task.due_date}</span> -{" "}
                <span
                  className={`capitalize ${
                    task.priority === "high"
                      ? "text-red-500"
                      : task.priority === "medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {task.priority}
                </span>
              </li>
            ))}
          </ul> */}
        </div>
      </div>

      {/* Modal for new project */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-black">Шинэ Төсөл Нэмэх</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full p-2 mb-4 border rounded text-black"
              placeholder="Төслийн нэрийг оруулна уу"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                Хаах
              </button>
              <button
                onClick={addNewProject}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Нэмэх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
