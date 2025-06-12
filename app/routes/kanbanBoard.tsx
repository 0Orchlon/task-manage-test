// KanbanBoard.tsx
import * as DndKitCore from "@dnd-kit/core";
const {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} = DndKitCore;
type DragEndEvent = DndKitCore.DragEndEvent;

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState } from "react";

type Task = {
  tid: number;
  title: string;
  due_date: string;
  priority: string;
  status: number;
};

interface KanbanBoardProps {
  tasks: Task[];
}
const columnsMap = {
    1: "To Do",
    2: "In Progress",
    3: "Done",
} as const;

type Status = keyof typeof columnsMap; // 1 | 2 | 3
type ColumnName = typeof columnsMap[Status]; // "To Do" | "In Progress" | "Done"

const statusToColumn = (status: Status): ColumnName => columnsMap[status];
const columnToStatus = (column: string): Status | undefined => {
  const entry = Object.entries(columnsMap).find(([_, name]) => name === column);
  return entry ? (Number(entry[0]) as Status) : undefined;
};
const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks }) => {
    const [tasksByStatus, setTasksByStatus] = useState<Record<ColumnName, Task[]>>({
        "To Do": tasks.filter((task) => task.status == 2),
        "In Progress": tasks.filter((task) => task.status == 1),
        "Done": tasks.filter((task) => task.status == 3),
    });
    console.log(tasksByStatus)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    console.log("ID: ", active.id, "OVER: ", over)

    const [fromColumn, fromId] = active.id.toString().split("-");
    const [toColumn, toId] = over.id.toString().split("-");
    const taskToMove = tasksByStatus[fromColumn as ColumnName].find(
      (t) => t.tid.toString() === fromId
    );
    if (!taskToMove) return;

    setTasksByStatus((prev) => {
      const fromTasks = [...prev[fromColumn as ColumnName]];
      const toTasks = [...prev[toColumn as ColumnName]];

      // Remove from source
      const removedIndex = fromTasks.findIndex((t) => t.tid.toString() === fromId);
      fromTasks.splice(removedIndex, 1);

      // Determine insert index in destination
      const insertIndex = toId
        ? toTasks.findIndex((t) => t.tid.toString() === toId)
        : toTasks.length;

      const newTask = { ...taskToMove, status: columnToStatus(toColumn)! };
      toTasks.splice(insertIndex, 0, newTask);

      return {
        ...prev,
        [fromColumn as ColumnName]: fromTasks,
        [toColumn as ColumnName]: toTasks,
      };
    });
  };

    console.log("Rendered tasksByStatus:", tasksByStatus);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(tasksByStatus).map(([columnName, columnTasks]) => (
          <div key={columnName} className="w-80 bg-white rounded shadow p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{columnName}</h2>
            <SortableContext
              items={columnTasks.map((task) => `${columnName}-${task.tid}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {columnTasks.length === 0 && (
                  <div className="text-gray-400 text-sm">Даалгавар алга</div>
                )}
                {columnTasks.map((task) => (
                  <SortableTask key={task.tid} task={task} column={columnName as ColumnName} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
};

const SortableTask = ({ task, column }: { task: Task; column: ColumnName }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `${column}-${task.tid}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="p-3 border rounded bg-gray-50 hover:bg-gray-100 transition cursor-move"
    >
      <div className="font-semibold text-gray-700">{task.title}</div>
      <div className="text-sm text-gray-500">{task.due_date}</div>
      <div
        className={`text-xs font-medium mt-1 ${
          task.priority === "high"
            ? "text-red-500"
            : task.priority === "medium"
            ? "text-yellow-500"
            : "text-green-500"
        }`}
      >
        {task.priority}
      </div>
    </div>
  );
};

export default KanbanBoard;