import React, { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import Task from "./Task";
import { supabase } from "~/supabase";

type User = {
  uid: string;
  uname: string;
  image?: string | null;
};

type TaskType = {
  tid: number;
  title: string;
  description: string;
  due_date: string;
  priority: "high" | "medium" | "low";
  status: number;
};

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onEdit: (updatedTask: TaskType) => void;
  onDelete: (tid: number | string) => void;
  users: User[];
}

export default function Column({
  id,
  title,
  tasks,
  onEdit,
  onDelete,
  users,
}: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  // Даалгавар бүрийн хэрэглэгчдийг хадгалах объект
  const [assignedUsersMap, setAssignedUsersMap] = useState<Record<number, User[]>>({});

  // Даалгаврын хэрэглэгчдийг татаж авах
  useEffect(() => {
    async function fetchAssignedUsers() {
      if (!tasks.length) {
        setAssignedUsersMap({});
        return;
      }
      const taskIds = tasks.map((t) => t.tid);
      const { data, error } = await supabase
        .from("t_task_assigned")
        .select("taskid, t_users(uid, uname, image)")
        .in("taskid", taskIds);

      if (error) {
        console.error("Error to fetch assigned users:", error);
        setAssignedUsersMap({});
        return;
      }

      const map: Record<number, User[]> = {};
      data.forEach((row: any) => {
        if (!map[row.taskid]) map[row.taskid] = [];
        map[row.taskid].push(row.t_users);
      });

      setAssignedUsersMap(map);
    }

    fetchAssignedUsers();
  }, [tasks]);

  // Хэрэглэгч даалгаварт нэмэх/устгах функц
  const assignUserToTask = async (taskId: number, userId: string) => {
    // 1. Хэрэв байгаа эсэхийг шалгах
    const { data: existing, error: selectError } = await supabase
      .from("t_task_assigned")
      .select("taid")
      .eq("taskid", taskId)
      .eq("tauid", userId)
      .limit(1)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking assignment:", selectError.message);
      return;
    }

    if (existing) {
      // Байгаа бол устгах
      const { error: delError } = await supabase
        .from("t_task_assigned")
        .delete()
        .eq("taid", existing.taid);

      if (delError) {
        console.error("Error removing user from task:", delError.message);
        return;
      }

      // UI шинэчлэх: устгасан хэрэглэгчийг state-аас хасах
      setAssignedUsersMap((prev) => {
        const newMap = { ...prev };
        newMap[taskId] = newMap[taskId].filter((u) => u.uid !== userId);
        return newMap;
      });

      alert("User removed successfully.");
      return;
    }

    // Байхгүй бол шинээр нэмэх
    const { error: insertError } = await supabase
      .from("t_task_assigned")
      .insert([{ taskid: taskId, tauid: userId }]);

    if (insertError) {
      console.error("Error assigning user:", insertError.message);
      return;
    }

    // UI шинэчлэх: шинээр нэмсэн хэрэглэгчийг state-д нэмэх
    const newUser = users.find((u) => u.uid === userId);
    if (!newUser) {
      alert("User not found.");
      return;
    }

    setAssignedUsersMap((prev) => {
      const newMap = { ...prev };
      newMap[taskId] = newMap[taskId] ? [...newMap[taskId], newUser] : [newUser];
      return newMap;
    });

    alert("User assigned successfully.");
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[300px] p-4 rounded-lg transition-colors duration-200 shadow-md ${
        isOver ? "bg-green-100" : "bg-white"
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400">No tasks</p>
      ) : (
        tasks.map((task) => (
          <Task
            key={task.tid}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            users={users}
            onAssign={assignUserToTask}
            assignedUsers={assignedUsersMap[task.tid] || []}
          />
        ))
      )}
    </div>
  );
}
