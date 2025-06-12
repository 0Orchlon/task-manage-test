// KanbanBoard.tsx
import React from "react";

const columns = {
  "To Do": [
    { title: "Finalize campaign brief" },
    { title: "Audience & market research" },
    { title: "Confirm budgets" },
  ],
  "In Progress": [
    { title: "Draft campaign messaging & copy" },
    { title: "Define channel strategy" },
  ],
  "Done": [
    { title: "Customer Beta interviews" },
    { title: "User Research" },
  ],
};

const KanbanBoard = () => {
  return (
    <div className="flex gap-4 p-4 overflow-auto bg-gray-100 min-h-screen">
      {Object.entries(columns).map(([columnName, tasks]) => (
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
            {tasks.map((task, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm"
              >
                {task.title}
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
};

export default KanbanBoard;