import { useEffect, useState } from 'react';
import { supabase } from '~/supabase';
import { useNavigate } from 'react-router';

export default function Poo() {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user:", error.message);
        setEmail(null);
        return;
      }
      console.log(data)
      setEmail(data.user?.email ?? null);
      setUsername(data.user?.user_metadata?.displayname ?? null); // ← ✅ ADD THIS
    };

    getUserEmail();
  }, []);

  return (
    <div>
      <h2>Welcome</h2>
      {email ? (
        <>
          <p>You are logged in as <strong>{email}</strong></p>
          {username && <p>Welcome <strong>{username}</strong></p>}
        </>
      ) : (
        <p>Not logged in</p>
      )}

      <button
        onClick={async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Logout failed:", error.message);
          } else {
            navigate("/login"); // ✅ or window.location.href = "/login";
          }
        }}
      >
        Log out
      </button>
    </div>
  );
}
