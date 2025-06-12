import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";

export default function Register() {
  const [displayname, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pass2, setPassword2] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (pass2 == password ) {
      const { error } = await supabase.auth.signUp({
      email,
        password,
      options: {
        data: {
          displayname,
        },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      alert("Check your email to confirm registration.");
      navigate("/login");
    }
  } else {
    alert("both password needs to be same")
  }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="User Name"
          value={displayname}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password Again"
          value={pass2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
