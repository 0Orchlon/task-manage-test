import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";

export default function Register() {
  const [displayname, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [phone, setPhone] = useState<string>(""); 
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


  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== password2){
      setError("Did not match password");
      return}

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
        setError("This username is already taken.");
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
        setError(`Error to save user data: ${insertError.message}`);
        return;
      }

      alert("Registration successful. Please check your email to confirm your registration.");
      navigate("/login");
    }
  } ;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={displayname}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number (optional)</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              placeholder="Enter your password again"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Register
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Click here to log in
          </a>
        </p>
      </div>
    </div>
  );
}