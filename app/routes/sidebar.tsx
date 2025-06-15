import { useState } from "react";
import Tasks from "../components/tasks";
import { useNavigate } from "react-router";

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
  onTaskClick?: (taskId: number) => void;
}

export default function Sidebar({
  projects = [],
  tasks = [],
  onNewProject,
  onTaskClick,
}: SidebarProps) {
  const [openProject, setOpenProject] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">NOTIFICATION</h2>
      <ul className="space-y-2">
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-4">PROJECTS</h2>
      <ul className="space-y-2">
        {projects.length === 0 && (
          <li className="text-gray-400">Project байхгүй</li>
        )}
        {projects.map((project) => (
          <li key={project.proid}>
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
                <span>{project.proname}</span>
              </div>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded mb-2 hover:bg-blue-700"
                onClick={() => navigate(`/tasks/new?proid=${project.proid}`)}
              >
                +
              </button>
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
          </li>
        ))}
        <li
          className="text-blue-400 cursor-pointer"
          onClick={onNewProject}
        >
          + NEW PROJECT
        </li>
      </ul>
    </aside>
  );
}
