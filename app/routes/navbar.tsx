import { supabase } from "~/supabase";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SearchOutlined } from "@ant-design/icons";

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        event.target &&
        !(event.target as Element).closest(".navbar-dropdown")
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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
    <nav className="bg-white shadow-md p-4 flex justify-between items-center relative">
      <h1 className="text-xl font-bold text-black">Даалгаврын Удирдлага</h1>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center space-x-2 bg-gray-200 rounded-full px-2 py-1 focus:outline-none"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-white"
            />
          ) : (
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {getInitials(displayName)}
            </div>
          )}
          <span className="text-gray-700 text-lg">
            {dropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-10">
            <button
              onClick={() => {
                setDropdownOpen(false);
                navigate("/profile");
              }}
              className="block w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100"
            >
              Профайл
            </button>
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
            >
              Гарах
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
