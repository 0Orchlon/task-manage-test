import { useEffect, useState } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";
export default function Poo() {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<
    { proid: number; proname: string }[]
  >([]);
  const onSelectProject = (proid: number) => {
    console.log("Selected project ID:", proid);
    navigate("/");
    // Additional logic for selecting a project can go here
  };
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
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
          <FaArrowLeft
            className="text-gray-600 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        <h2 className="text-xl font-bold text-black mb-4">Your Profile</h2>

        {email ? (
          <>
            <div className="flex items-center space-x-4 mb-6">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                  No image
                </div>
              )}
              <div>
                {username && (
                  <div className="flex items-center mt-[-20px]">
                    <p className="text-lg font-semibold text-black">
                      Hello, <span className="text-blue-600">{username}</span>
                    </p>
                    <CiEdit
                      className="ml-2 text-gray-500 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate("/poo")}
                    />
                  </div>
                )}
                {email && <p className="text-gray-700 text-xs">{email}</p>}
              </div>
              <IoIosLogOut
                className="text-gray-500 cursor-pointer hover:text-red-600 text-2xl ml-auto mt-[-20px]"
                onClick={async () => {
                  const { error } = await supabase.auth.signOut();
                  if (!error) navigate("/login");
                  else console.error("Logout failed:", error.message);
                }}
              />
            </div>

            {/* Project list section */}
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
                      onClick={() => onSelectProject(proj.proid)}
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
