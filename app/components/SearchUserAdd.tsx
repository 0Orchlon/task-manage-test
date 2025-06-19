import { useState, useEffect } from "react";
import { supabase } from "~/supabase";

interface User {
  uid: string;
  uname: string;
  image?: string | null;
}

interface Props {
  proid: number;
  onUserAdded?: (user: User) => void;
}

export default function SearchUserAdd({ proid, onUserAdded }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (search.trim() === "") {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("t_users")
          .select("uid, uname, image")
          .ilike("uname", `%${search}%`);

        if (error) throw error;
        setResults(data ?? []);
      } catch (err: any) {
        setError("error to fetch users: " + err.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const addUserToProject = async (uid: string) => {
    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from("t_project_users")
        .select("uid")
        .eq("proid", proid)
        .eq("uid", uid);

      if (checkError) throw checkError;

      if (existingUsers.length > 0) {
        alert("User is already added!");
        return;
      }

      const { error } = await supabase
        .from("t_project_users")
        .insert({ proid, uid });

      if (error) throw error;

      const { data: user } = await supabase
        .from("t_users")
        .select("uid, uname, image")
        .eq("uid", uid)
        .single();

      if (user) {
        onUserAdded(user);
      }

      alert("User added successfully");
      setSearch("");
      setResults([]);
    } catch (err: any) {
      alert(`Error to add user: ${err.message}`);
    }
  };

  return (
    <div className="bg-gray-100 p-2 rounded mt-4 text-black">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by username..."
        className="w-full p-2 rounded border"
      />
      {loading && <p className="text-sm text-gray-500 mt-1">Loading...</p>}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      <ul className="mt-2 space-y-1 max-h-80 overflow-y-auto">
        {results.map((user) => (
          <li
            key={user.uid}
            className="flex items-center justify-between p-1 bg-white rounded hover:bg-gray-200 cursor-pointer"
            onClick={() => addUserToProject(user.uid)}
          >
            <div className="flex items-center gap-2">
              {user.image && (
                <img
                  src={user.image}
                  alt={user.uname}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span>{user.uname}</span>
            </div>
            <button className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}