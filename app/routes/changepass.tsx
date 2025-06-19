import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
export default function ChangePassword() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user?.email) {
        setEmail(authData.user.email);
      } else {
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Reauthenticate the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setError("Current password is incorrect.");
      return;
    }

    // Change password
    if (newPassword == newPassword2) {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setTimeout(() => navigate("/profile"), 2000);
      }
    } else {
      alert("both verify and new password must match");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <FaArrowLeft
          className="text-gray-600 cursor-pointer mb-[-25px]"
          onClick={() => navigate("/profile")}
        />
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Change Password
        </h2>
        <p>{email}</p>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* <input
            type="email"
            placeholder="Your Email Here"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
          /> */}
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input
            type="password"
            placeholder="Verify password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            Change Password
          </button>
        </form>
        {message && (
          <p className="mt-4 text-green-600 text-center">{message}</p>
        )}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}
