// KanbanBoard.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";
import { DndContext } from '@dnd-kit/core';
import Column from './column';

type Task = {
  tid: number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: number;
};

interface KanbanBoardProps {
  tasks?: Task[];
}

const STATUS_MAP: Record<number, "To Do" | "In Progress" | "Done"> = {
  1: "To Do",
  2: "In Progress",
  3: "Done",
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks = [] }) => {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'title'>('due_date'); // ✅ moved here

  useEffect(() => {
    console.log("Incoming tasks:", tasks);
    setLocalTasks(tasks);
  }, [tasks]);

  const getStatusFromId = (id: string): number => {
    switch (id) {
      case 'todo': return 1;
      case 'in-progress': return 2;
      case 'done': return 3;
      default: return 0;
    }
  };

  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'due_date') {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortBy === 'priority') {
        const priorityMap = { low: 3, medium: 2, high: 1 };
        return priorityMap[a.priority] - priorityMap[b.priority];
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || !active.id) return;

    const newStatus = getStatusFromId(over.id);
    const taskId = parseInt(active.id);

    console.log('Moved task:', active.id, 'to column:', over.id);

    setLocalTasks((prev) =>
      prev.map((task) =>
        task.tid.toString() === active.id
          ? { ...task, status: newStatus }
          : task
      )
    );

    const { error } = await supabase
      .from('t_tasks')
      .update({ status: newStatus })
      .eq('tid', taskId);

    if (error) {
      console.error('Supabase update error:', error.message);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border rounded px-2 py-1 bg-white text-black"
          >
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <Column id="todo" title="To Do" tasks={sortTasks(localTasks.filter((t) => t.status === 1))} />
          <Column id="in-progress" title="In Progress" tasks={sortTasks(localTasks.filter((t) => t.status === 2))} />
          <Column id="done" title="Done" tasks={sortTasks(localTasks.filter((t) => t.status === 3))} />
        </div>
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
