import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session?.user) {
        navigate("/"); // Redirect to index page
      }
    };
    checkSession();
  }, [navigate]);


  const handleLogin = async (e: FormEvent) => {
    
    e.preventDefault();
    setError(null);

    //email burtgl shalgh
    const {data:userData, error: userError} = await supabase
      .from("auth.users")
      .select("email")
      .eq("email", email)
      .single();
      if (userError && userError.code === 'PGRST116') { //pgrst116 email bhku
        setError("No email found");
        return;
      }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if(error.message === "Invalid login credentials") {
        setError("Invalid email or password");
      }else{
      setError(error.message);
      }
      return;
    }

    if (data.user) {
      navigate("/"); //  Redirect to index page
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Нэвтрэх
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        <p className="mt-4 text-center text-gray-600">
          No account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Click here to register
          </a>
        </p>
        <p className="mt-4 text-center text-gray-600">
          Forgot your password?{" "}
          <a href="/forgotpass" className="text-blue-600 hover:underline">
            Click here to reset it
          </a>
        </p>
      </div>
    </div>
  );
}