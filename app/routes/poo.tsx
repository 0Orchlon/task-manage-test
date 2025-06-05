// poo.tsx
import { useEffect, useState } from 'react';
import { supabase } from '~/supabase';
import { useNavigate } from 'react-router-dom';

export default function Poo() {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the current user
    const getUserEmail = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user:", error.message);
        setEmail(null);
        return;
      }
      setEmail(data.user?.email ?? null);
    };

    getUserEmail();
  }, []);

  return (
    <div>
      <h2>Welcome</h2>
      {email ? (
        <p>You are logged in as <strong>{email}</strong></p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
