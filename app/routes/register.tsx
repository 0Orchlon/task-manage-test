import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";

export default function Register() {
  const [displayname, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>(""); 
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Supabase auth hereglegch burtgh
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          displayname,
          phone, 
        },
      },
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    // t_users herglegch medeelel hadglh
    if (user) {
      const {data: existingUser} = await supabase
        .from("t_users")
        .select("uid")
        .eq("uid", user.id)
        .single();
        
        if (existingUser) {
        setError("Энэ хэрэглэгчийн нэр аль хэдийн бүртгэгдсэн байна.");
        navigate("/login");
        return;
      }
      // t_users husnegted hadgalah
      const { error: insertError } = await supabase
        .from("t_users")
        .insert([
          {
            uid: user.id,
            uname: displayname, 
          },
        ]);

      if (insertError) {
        setError(`Хэрэглэгчийн мэдээллийг хадгалахад алдаа гарлаа: ${insertError.message}`);
        return;
      }

      alert("Амжилттай бүртгэгдлээ. Имэйлээ шалгаж, бүртгэлээ баталгаажуулна уу.");
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Бүртгүүлэх</h2>
        <form onSubmit={handleRegister} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700">Хэрэглэгчийн нэр</label>
            <input
              type="text"
              placeholder="Нэрээ оруулна уу"
              value={displayname}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Утасны дугаар</label>
            <input
              type="tel"
              placeholder="Утасны дугаараа оруулна уу"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            Бүртгүүлэх
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        <p className="mt-4 text-center text-gray-600">
          Бүртгэлтэй юу?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Эндээс нэвтэрнэ үү
          </a>
        </p>
      </div>
    </div>
  );
}