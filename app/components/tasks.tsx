import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import { supabase } from "~/supabase";

interface Task {
  tid: number;
  title: string;
  proid: number;
  description?: string;
  due_date?: string;
  status?: number;
  priority?: string;
  created_at?: string;
}

interface TasksProps {
  proid: number;
  onTaskClick?: (taskId: number) => void;
  tasks: Task[];
}

function useTasksByProject(proid: number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const { data, error } = await supabase
        .from("t_tasks")
        .select("*")
        .eq("proid", proid);
      if (!error && data) setTasks(data);
      setLoading(false);
    }
    if (proid) fetchTasks();
  }, [proid]);

  return { tasks, loading };
}

export default function Tasks({
  proid,
  onTaskClick,
  tasks: allTasks,
}: TasksProps) {
  const navigate = useNavigate();
  const { tasks, loading } = useTasksByProject(proid);

  if (loading) return <div>Ачааллаж байна...</div>;

  return (
    <div className="flex flex-col auto-cols-auto">
      {tasks.length === 0 ? (
        <div className="text-gray-400 text-sm">Task байхгүй</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {tasks.length === 0 && (
            <li className="py-2 text-center text-gray-500">
              Даалгавар байхгүй
            </li>
          )}
          {tasks.map((task) => (
            <li
              key={task.tid}
              className=" flex flex-row py-1 px-1.5 rounded-xl hover:bg-gray-500 "
            >
              <MenuUnfoldOutlined />
              <span className="px-15">{task.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
