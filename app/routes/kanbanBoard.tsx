import React, { useState, useEffect } from 'react';
import { supabase } from "~/supabase";
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

type User = {
  uid: string;
  email: string;
  uname?: string;
};

const STATUS_MAP: Record<number, "To Do" | "In Progress" | "Done"> = {
  1: "To Do",
  2: "In Progress",
  3: "Done",
};

const KanbanBoard: React.FC<{ tasks?: Task[];proj: string; }> = ({ tasks = [], proj  }) => {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [users, setUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'title'>('due_date');

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

useEffect(() => {
const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("t_project_users")
    .select(`
      uid,
      t_users!inner(uname, image)
    `)
    .eq("proid", proj);

  if (error) {
    console.error("Failed to fetch users", error);
  } else {
    const flatUsers = data.map((entry) => ({
      uid: entry.uid,
      uname: entry.t_users.uname,
      // email: entry.auth_users.Email,
      image: entry.t_users.image || '',
    }));
    console.log("Fetched users:", flatUsers);
    setUsers(flatUsers);
  }
  
};


  if (proj) {
    fetchUsers();
  }
}, [proj]); // 👈 add proj as dependency
const assignUserToTask = async (taskId: number, userId: string) => {
  console.log("Assigning user:", userId, "to task:", taskId);

  // 1. Хэрэв байгаа эсэхийг шалгах
  const { data: existing, error: selectError } = await supabase
    .from("t_task_assigned")
    .select("taid")
    .eq("taskid", taskId)
    .eq("tauid", userId)
    .limit(1)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error("Error checking assignment:", selectError.message);
    return;
  }

  console.log("User already assigned to task:", existing);
  if (existing) {
    // existing нь { taid: number } гэж бодож байна
    const taid = existing.taid;
    const { error: delError } = await supabase
      .from("t_task_assigned")
      .delete()
      .eq("taid", taid);

    if (delError) {
      console.error("Error removing user from task:", delError.message);
    } else {
      alert("User removed from task successfully");
    }
    return;
  }

  // 2. Байхгүй бол шинээр нэмэх
  const { error: insertError } = await supabase
    .from("t_task_assigned")
    .insert([{ taskid: taskId, tauid: userId }]);

  if (insertError) {
    console.error("Error assigning user:", insertError.message);
  } else {
    alert("User added successfully");
  }
};



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

    setLocalTasks((prev) =>
      prev.map((task) =>
        task.tid === taskId
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

  const handleEdit = async (updatedTask: Task) => {
    setLocalTasks((prev) =>
      prev.map((task) => (task.tid === updatedTask.tid ? updatedTask : task))
    );

    const { error } = await supabase
      .from('t_tasks')
      .update({
        title: updatedTask.title,
        due_date: updatedTask.due_date,
        priority: updatedTask.priority,
        status: updatedTask.status,
      })
      .eq('tid', updatedTask.tid);

    if (error) {
      console.error('Supabase update error:', error.message);
    }
  };

  const handleDelete = async (tid: number) => {
    setLocalTasks((prev) => prev.filter((task) => task.tid !== tid));

    const { error } = await supabase
      .from('t_tasks')
      .delete()
      .eq('tid', tid);

    if (error) {
      console.error('Supabase delete error:', error.message);
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

        <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-100 min-h-screen">
          {Object.entries(STATUS_MAP).map(([statusId, title]) => (
            <Column
              key={statusId}
              id={
                statusId === "1"
                  ? "todo"
                  : statusId === "2"
                    ? "in-progress"
                    : "done"
              }
              title={title}
              tasks={sortTasks(localTasks.filter((t) => t.status === parseInt(statusId)))}
              onEdit={handleEdit}
              onDelete={handleDelete}
              users={users} 
              onAssign={assignUserToTask}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
