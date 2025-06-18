import { useEffect, useState } from "react";
import { supabase } from "~/supabase";

type ReminderTask = {
  tid: number;
  title: string;
  due_date: string;
  proname: string;
  status: number;
  proid: number;
};

// interface ReminderProps {
//   projects: Project[];
//   selectedProjectId: number | null;
//   setSelectedProjectId: (id: number) => void;
// }

export default function Reminder() {
  const [tasks, setTasks] = useState<ReminderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [overduePage, setOverduePage] = useState(0);
  const [upcomingPage, setUpcomingPage] = useState(0);
  const maxPerPage = 3;

  useEffect(() => {
    const loadReminders = async () => {
      setLoading(true);

      const { data: userResult } = await supabase.auth.getUser();
      const uid = userResult?.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: owned, error: ownedError } = await supabase
        .from("t_project")
        .select("proid, proname")
        .eq("proownuid", uid);

      const { data: shared, error: sharedError } = await supabase
        .from("t_project_users")
        .select("proid")
        .eq("uid", uid);

      if (ownedError || sharedError) {
        console.error("Error fetching projects");
        setLoading(false);
        return;
      }

      const allProjectIds = [
        ...(owned || []).map((p) => p.proid),
        ...(shared || []).map((p) => p.proid),
      ];

      if (allProjectIds.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from("t_tasks")
        .select("tid, title, due_date, status, proid, t_project(proid, proname)")
        .in("proid", allProjectIds)
        .order("due_date", { ascending: true });

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError.message);
        setLoading(false);
        return;
      }

      const result: ReminderTask[] = (tasksData || [])
        .filter((t: any) => t.status !== 3)
        .map((t: any) => ({
          tid: t.tid,
          title: t.title,
          due_date: t.due_date,
          proname: t.t_project?.proname || "Unknown",
          status: t.status,
          proid: t.proid,
        }));

      setTasks(result);
      setLoading(false);
    };

    loadReminders();
  }, []);

  const formatDate = (str: string) => {
    const date = new Date(str);
    return new Intl.DateTimeFormat("en-US").format(date);
  };

  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);

  const overdue = tasks.filter((t) => {
    const due = new Date(t.due_date);
    return due < today && due >= threeDaysAgo;
  });

  const upcoming = tasks.filter((t) => new Date(t.due_date) >= today);

  const paginatedOverdue = overdue.slice(overduePage * maxPerPage, (overduePage + 1) * maxPerPage);
  const paginatedUpcoming = upcoming.slice(upcomingPage * maxPerPage, (upcomingPage + 1) * maxPerPage);

  return (
    <div className="text-white text-sm">
      {loading ? (
        <p className="text-gray-400">Loading reminders...</p>
      ) : (
        <>
          {overdue.length > 0 && (
            <div className="mb-6">
              <p className="text-red-400 font-semibold mb-2">Overdue</p>
              <ul className="space-y-2">
                {paginatedOverdue.map((t) => (
                  <li
                    key={t.tid}
                    // onClick={() => setSelectedProjectId(project.proid)}
                    className="bg-red-700 p-2 rounded-md cursor-pointer hover:bg-red-600 transition"
                  >
                    <strong>{t.title}</strong>
                    <div className="text-xs text-gray-300">
                      Project: <strong className="text-l" >{t.proname}</strong><br />
                      Due: {formatDate(t.due_date)}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <button
                  onClick={() => setOverduePage((p) => Math.max(0, p - 1))}
                  disabled={overduePage === 0}
                  className="hover:text-white disabled:opacity-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={() =>
                    setOverduePage((p) => (p + 1) * maxPerPage < overdue.length ? p + 1 : p)
                  }
                  disabled={(overduePage + 1) * maxPerPage >= overdue.length}
                  className="hover:text-white disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="">
              <p className="text-blue-400 font-semibold mb-2">Upcoming</p>
              <ul className="space-y-2">
                {paginatedUpcoming.map((t) => (
                  <li
                    key={t.tid}
                    // onClick={() => setSelectedProjectId(projects.proid)}
                    className="bg-blue-700 p-2 rounded-md cursor-pointer hover:bg-blue-600 transition"
                  >
                    <strong>{t.title}</strong>
                    <div className="text-xs text-gray-300">
                      Project: <strong className="text-l">{t.proname}</strong><br />
                      Due: {formatDate(t.due_date)}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <button
                  onClick={() => setUpcomingPage((p) => Math.max(0, p - 1))}
                  disabled={upcomingPage === 0}
                  className="hover:text-white disabled:opacity-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={() =>
                    setUpcomingPage((p) => (p + 1) * maxPerPage < upcoming.length ? p + 1 : p)
                  }
                  disabled={(upcomingPage + 1) * maxPerPage >= upcoming.length}
                  className="hover:text-white disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {upcoming.length === 0 && overdue.length === 0 && (
            <p className="text-gray-400">No upcoming tasks.</p>
          )}
        </>
      )}
    </div>
  );
}
