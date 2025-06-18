import { useEffect, useState } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import KanbanBoard from "./kanbanBoard";

interface Project {
  proid: number;
  proname: string;
}

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Даалгаврын Удирдлага" },
    { name: "description", content: "Таны даалгавруудыг удирдах апп" },
  ];
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedProjId, setSelProject] = useState<string>("");

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

  useEffect(() => {
    
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
      // const { data: projectUser, error: projectUserError } = await supabase
      //   .from("t_project_users")
      //   .select("proid")
      //   .eq("uid", data.user.id);

      const { data: tasksData, error: tasksError } = await supabase
        .from("t_tasks")
        .select("tid, title, due_date, priority, status")
        .eq("creatoruid", data.user.id);

      if (tasksError) {
        setError(`Даалгавруудыг татахад алдаа гарлаа: ${tasksError.message}`);
      } else {
        setTasks(tasksData || []);
      }
      
      const { data: projectUser, error: projectUserError } = await supabase
      .from("t_project_users")
      .select("proid")
      .eq("uid", data.user.id);
      
      if (projectUserError) {
        setError(`Даалгрыг харуулахад алдаа гарлаа: ${projectUserError.message}`);
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
      }
    };
     getTasks();

    checkUser();
  }, [navigate,selectedProjId]);
  
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
      
      if (!insertedData || insertedData.length === 0) {
        setError("Төсөл амжилттай нэмэгдсэн боловч өгөгдөл буцаагдсангүй.");
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

  const handleDeleteProject = async (proid: number) => {
    if (!window.confirm("Та энэ төслийг устгахдаа итгэлтэй байна уу?")) return;

    const { error: userError } = await supabase
      .from("t_project_users")
      .delete()
      .eq("proid", proid);

    if (userError) {
      setError("Төслийн хэрэглэгчдийг устгахад алдаа гарлаа: " + userError.message);
      return;
    }

    // 2. project delete
    const { error: projectError } = await supabase
      .from("t_project")
      .delete()
      .eq("proid", proid);

    if (projectError) {
      setError("Төслийг устгахад алдаа гарлаа: " + projectError.message);
      return;
    }

    // Localoos hasah
    setProjects((prev) => prev.filter((p) => p.proid !== proid));
    setTasks((prev) => prev.filter((t) => t.proid !== proid));
  };

  const handleProjectRename = (proid: number, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.proid === proid ? { ...p, proname: newName } : p))
    );
  };

  if (!user) {
    return <div>Ачааллаж байна...</div>;
  }
  console.log("Fetched tasks:", tasks);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar компонент ашиглах */}
      <Sidebar
        projects={projects || []}
        tasks={tasks}
        onSelectProject={(projectId) => setSelProject(projectId)}
        onNewProject={() => setShowModal(true)}
        onDeleteProject={handleDeleteProject}
        selectedProjectId={selectedProjectId}
// onSelectProject={(projectId) => setProjects(projectId)}
/>

      {/* Үндсэн агуулга */}
      <div className="flex-1 flex flex-col">
        {/* Navbar компонент ашиглах */}
        <Navbar user={user} />

        {/* Агуулга */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Тавтай морил, {user.user_metadata?.displayname || user.email}!
          </h2>
          {error && <p className="mb-4 text-red-500 text-center">{error}</p>}
          <h3 className="text-xl font-semibold mb-4 text-black">Таны даалгаврууд</h3>

          <KanbanBoard 
            tasks={tasks}
            />

        </div>
      </div>

      {/* Modal */}
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