import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY" && session) {
      // Auth state already recovered, you can show the form
      console.log("Password recovery session restored.");
    }
  });

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!data.session) {
        setError("Session not found. Please use the reset link from your email.");
      }
    };
    checkSession();
    return () => {
    listener.subscription.unsubscribe();
  };
  }, []);

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/profile"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Set New Password
        </h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            Update Password
          </button>
        </form>
        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}
