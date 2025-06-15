interface Task {
  id: string;
  title: string;
  status: number; // status is numeric
}

interface KanbanBoardProps {
  tasksData: Task[];
}

export default function KanbanBoard({ tasksData }: KanbanBoardProps) {
  const STATUS_MAP: Record<number, "To Do" | "In Progress" | "Done"> = {
    0: "To Do",
    1: "In Progress",
    2: "Done",
  };

  const readableTasks = tasksData.map((task) => ({
    ...task,
    status: STATUS_MAP[task.status] || "To Do",
  }));

  const groupedTasks = {
    "To Do": readableTasks.filter((task) => task.status === "To Do"),
    "In Progress": readableTasks.filter((task) => task.status === "In Progress"),
    "Done": readableTasks.filter((task) => task.status === "Done"),
  };

  return (
    <div className="flex gap-4 p-4 overflow-auto bg-gray-100 min-h-screen">
      {Object.entries(groupedTasks).map(([columnName, tasks]) => (
        <div key={columnName} className="w-80 flex-shrink-0">
          <h2
            className={`text-lg font-bold mb-4 px-4 py-2 rounded-t-md ${
              columnName === "To Do"
                ? "bg-gray-200"
                : columnName === "In Progress"
                ? "bg-blue-200"
                : "bg-green-200"
            }`}
          >
            {columnName}
          </h2>
          <div className="bg-white rounded-b-md shadow-md p-2 space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm"
              >
                <span className="text-red-800">{task.title}</span>
              </div>
            ))}
            <button className="w-full text-blue-500 hover:underline text-sm mt-2">
              + Add task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
