interface Project {
  proid: string;
  proname: string;
}

interface SidebarProps {
  projects: Project[];
  onNewProject: () => void;
  onSelectProject: (projectId: string) => void; // <-- Fix type
}



export default function Sidebar({ projects, onNewProject, onSelectProject }: SidebarProps) {
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
          <li className="text-g ray-400">Project байхгүй</li>
        )}
        {projects.map((project) => (
          <li
            key={project.proid}
            className="cursor-pointer hover:text-blue-300"
            onClick={() => onSelectProject(project.proid)}
          >
            {project.proname} <span className="text-gray-400">➜</span>
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
