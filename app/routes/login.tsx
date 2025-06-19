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
        setError("Бүртгэлгүй байна");
        return;
      }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if(error.message === "Invalid login credentials") {
        setError("Имэйл эсвэл нууц үг буруу байна");
      }else{
      setError(error.message);
      }
      return;
    }

    if (data.user) {
      navigate("/"); // Гэрийн хуудас руу шилжих
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Нэвтрэх</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Имэйл</label>
            <input
              type="email"
              placeholder="Имэйлээ оруулна уу"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Нууц үг</label>
            <input
              type="password"
              placeholder="Нууц үгээ оруулна уу"
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
          Бүртгэлгүй юу?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Энд дарж бүртгүүлнэ үү
          </a>
        </p>
                <p className="mt-4 text-center text-gray-600">
          Нууц үгээ мартсан уу?{" "}
          <a href="/forgotpass" className="text-blue-600 hover:underline">
            Энд дарж Нууц үгээ сэргээн үү
          </a>
        </p>
      </div>
    </div>
  );
}