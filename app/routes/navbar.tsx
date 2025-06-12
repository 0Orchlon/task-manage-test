import { supabase } from "~/supabase";
import { useNavigate } from "react-router";

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Ehnii useg avah
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.user_metadata?.displayname || user?.email || 'User';

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Даалгаврын Удирдлага</h1>

      <div className="flex items-center space-x-4">
        {/* Placeholder zurgnii ornd heregleh*/}
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          {getInitials(displayName)}
        </div>
        
        {/* hereglegch name */}
        <span className="text-gray-700 font-medium">{displayName}</span>
        
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