import { supabase } from "~/supabase";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const navigate = useNavigate();
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
    };
    getUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Ehnii useg avah
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 1);
  };

  const displayName = username || user?.email || "User";

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-black">Даалгаврын Удирдлага</h1>

      <div className="flex items-center space-x-4">
        <button
        onClick={()=>navigate("/profile")}
        >
          
        {imageUrl ? (
          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            <img
              src={imageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full mx-auto mb-4 object-cover border mt-4"
            />
          </div>
        ) : (
          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            <>
            {getInitials(displayName)}
            </>
          </div>
        )}

        {/* hereglegch name */}
        <span className="text-gray-700 font-medium">{username}</span>
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
        >
          Гарах
        </button>
      </div>
    </nav>
  );
}
