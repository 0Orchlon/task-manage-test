//home.tsx
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
    { title: "Task Management" },
    { name: "description", content: "An app to manage your tasks" },
  ];
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const navigate = useNavigate();

  const getTasks = async () => {
    if (selectedProjectId) {
      const { data: tasksData, error: tasksError } = await supabase
        .from("t_tasks")
        .select("tid, title, description, status, due_date, priority")
        .eq("proid", selectedProjectId);
        
      if (tasksError) {
        setError(`Error to fetch tasks: ${tasksError.message}`);
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

      const { data: projectUser, error: projectUserError } = await supabase
        .from("t_project_users")
        .select("proid")
        .eq("uid", data.user.id);

      if (projectUserError) {
        setError(`Error to fetch project users: ${projectUserError.message}`);
        return;
      }

      const projectIds = projectUser.map((pu: any) => pu.proid);
      const { data: projectsData, error: projectsError } = await supabase
        .from("t_project")
        .select("proid, proname")
        .in("proid", projectIds);

      if (projectsError) {
        setError(`Error to fetch projects: ${projectsError.message}`);
      } else {
        setProjects(projectsData || []);
        if (projectsData && projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].proid);
        }
      }
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    getTasks();
  }, [selectedProjectId]);

  const addNewProject = async () => {
    setError(null);

    if (!newProjectName.trim()) {
      setError("enter a project name");
      return;
    }

    try {
      const { data: insertedData, error: insertError } = await supabase
        .from("t_project")
        .insert([{ proname: newProjectName, proownuid: user.id }])
        .select();

      if (insertError) {
        setError(`Error to add new project: ${insertError.message}`);
        return;
      }

      if (!insertedData || insertedData.length === 0) {
        setError("Project added successfully but no data returned.");
        return;
      }

      const newProject = insertedData[0];

      const { error: userLinkError } = await supabase
        .from("t_project_users")
        .insert([{ proid: newProject.proid, uid: user.id, share_id: Math.floor(Math.random() * 1000000) }]);

      if (userLinkError) {
        setError(`Error to link user to project: ${userLinkError.message}`);
        return;
      }

      setProjects([...projects, newProject]);
      setNewProjectName("");
      setShowModal(false);
      setSelectedProjectId(newProject.proid);
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleDeleteProject = async (proid: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    const { error: userError } = await supabase
      .from("t_project_users")
      .delete()
      .eq("proid", proid);

    if (userError) {
      setError("Error to delete project users: " + userError.message);
      return;
    }

    const { error: projectError } = await supabase
      .from("t_project")
      .delete()
      .eq("proid", proid);

    if (projectError) {
      setError("Error to delete project: " + projectError.message);
      return;
    }

    setProjects((prev) => prev.filter((p) => p.proid !== proid));
    setTasks((prev) => prev.filter((t) => t.proid !== proid));
    if (selectedProjectId === proid) {
      setSelectedProjectId(null);
    }
  };

  const handleProjectRename = (proid: number, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.proid === proid ? { ...p, proname: newName } : p))
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }
const selectedProject = projects.find(p => p.proid === selectedProjectId);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        projects={projects || []}
        tasks={tasks}
        onSelectProject={(projectId) => setSelectedProjectId(projectId)}
        onNewProject={() => setShowModal(true)}
        onDeleteProject={handleDeleteProject}
      />

      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar user={user} />

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 overflow-auto">
            {selectedProject?.proname ?? "Project"}!
          </h2>
          {error && <p className="mb-4 text-red-500 text-center">{error}</p>}
          <h3 className="text-xl font-semibold mb-4 text-black">Your Tasks</h3>

          {!selectedProjectId ? (
            <p className="text-center text-gray-500">Please select a project...</p>
          ) : (
            <KanbanBoard tasks={tasks} proj={selectedProjectId} onTaskUpdate={getTasks} />
          )}

        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-black">Add New Project</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full p-2 mb-4 border rounded text-black"
              placeholder="Enter project name"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                Close
              </button>
              <button
                onClick={addNewProject}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
