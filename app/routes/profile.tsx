import { useEffect, useState } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";

export default function Poo() {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<
    { proid: number; proname: string }[]
  >([]);
  const navigate = useNavigate();
useEffect(() => {
  const getUserData = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error("Error getting user:", authError?.message);
      setEmail(null);
      setUsername(null);
      setImageUrl(null);
      navigate("/");
      return;
    }

    setEmail(authData.user.email ?? null);
    setUserId(authData.user.id);

    const { data: profileData, error: profileError } = await supabase
      .from("t_users")
      .select("uname, image")
      .eq("uid", authData.user.id)
      .single();

    if (profileError) {
      console.error("Error getting profile data:", profileError.message);
      setUsername(null);
      setImageUrl(null);
      return;
    }

    setUsername(profileData.uname);
    setImageUrl(profileData.image);
  };

  getUserData();
}, [navigate]);
  useEffect(() => {
    const getUserData = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error("Error getting user:", authError?.message);
        return;
      }

      const uid = authData.user.id;
      setEmail(authData.user.email ?? null);
      setUserId(uid);

      const { data: profileData, error: profileError } = await supabase
        .from("t_users")
        .select("uname, image")
        .eq("uid", uid)
        .single();

      if (!profileError && profileData) {
        setUsername(profileData.uname);
        setImageUrl(profileData.image);
      }

      // Fetch projects: owned or shared
      const { data: ownedProjects, error: ownErr } = await supabase
        .from("t_project")
        .select("proid, proname")
        .eq("proownuid", uid);

      const { data: sharedProjectsData, error: sharedErr } = await supabase
        .from("t_project_users")
        .select("proid")
        .eq("uid", uid);

      const sharedProIds =
        sharedProjectsData?.map((entry) => entry.proid) ?? [];

      let sharedProjects: { proid: number; proname: string }[] = [];
      if (sharedProIds.length > 0) {
        const { data: spData, error: spErr } = await supabase
          .from("t_project")
          .select("proid, proname")
          .in("proid", sharedProIds);
        if (!spErr && spData) {
          sharedProjects = spData;
        }
      }

      const allProjects = [...(ownedProjects ?? []), ...sharedProjects];

      // Remove duplicates by proid
      const uniqueProjects = Array.from(
        new Map(allProjects.map((proj) => [proj.proid, proj])).values()
      );

      setProjects(uniqueProjects);
    };

    getUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Your Profile</h2>
          <button
            onClick={async () => {
              navigate("/poo");
            }}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
          >
            Edit profile
          </button>
          <button
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error("Logout failed:", error.message);
              } else {
                navigate("/login");
              }
            }}
            className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
          >
            Log out
          </button>
        </div>

        {email ? (
          <>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border"
              />
            ) : (
              <p className="text-center text-gray-500 mb-4">No profile image</p>
            )}

            {username && (
              <p className="text-center text-lg font-semibold mb-4 text-black">
                Hello, <span className="text-blue-600">{username}</span>
              </p>
            )}
            {/* 👇 Project list section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2 text-black">
                Your Projects
              </h3>
              {projects.length === 0 ? (
                <p className="text-gray-500">No projects found.</p>
              ) : (
                <ul className="space-y-2">
                  {projects.map((proj) => (
                    <li
                      key={proj.proid}
                      onClick={() => navigate(`/project/${proj.proid}`)}
                      className="cursor-pointer text-blue-700 hover:underline"
                    >
                      🔹 {proj.proname}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <p className="text-red-600">Not logged in</p>
        )}
      </div>
    </div>
  );
}
