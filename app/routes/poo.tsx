import { useEffect, useState } from "react";
import { supabase } from "~/supabase";
import { useNavigate } from "react-router";

function randomPrefix(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default function Poo() {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user from auth, then get username/profilepic from 'profiles' table
  useEffect(() => {
    const getUserData = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error("Error getting user:", authError?.message);
        setEmail(null);
        setUsername(null);
        setImageUrl(null);
        return;
      }
      setEmail(authData.user.email ?? null);
      setUserId(authData.user.id);

      // Query your own table (profiles) to get uname, profilepic
      const { data: profileData, error: profileError } = await supabase
        .from("t_users")
        .select("uname, image")
        .eq("uid", authData.user.id)
        .single();

      if (profileError) {
        console.error("Error getting profile data:", profileError.message);
        setUsername(null);
        setImageUrl(null);
        return;
      }

      setUsername(profileData.uname);
      setImageUrl(profileData.image);
    };

    getUserData();
  }, []);

  // Update username and profilepic in 'profiles' table
  const handleUpdateProfile = async () => {
    const updatedName = newUsername.trim() || username;
    if (!updatedName && !imageUrl) {
      alert("Please set a username or upload an image.");
      return;
    }

    if (!userId) {
      alert("User not loaded");
      return;
    }

    const { error } = await supabase.from("t_users").upsert({
      uid: userId,
      uname: updatedName,
      image: imageUrl,
    });

    if (error) {
      console.error("Failed to update profile:", error.message);
      alert("Failed to update profile");
      return;
    }

    alert("Profile updated!");
    setUsername(updatedName);
    setNewUsername("");
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const prefix = randomPrefix(8);
    const fileExt = file.name.split(".").pop();
    const fileName = `${prefix}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

const { data: uploadData, error: uploadError } = await supabase.storage
  .from("profilepic")
  .upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      alert("Upload failed");
      setUploading(false);
      return;
    }
    console.log("Upload succeeded:", uploadData); // <--- log this

const { data } = supabase.storage.from("profilepic").getPublicUrl(filePath);
console.log("Public URL:", data.publicUrl); // <--- log this
setImageUrl(data.publicUrl);
    setUploading(false);
  };

  return (
    <div>
      <h2>Welcome</h2>
      {email ? (
        <>
          <p>
            You are logged in as <strong>{email}</strong>
          </p>

          {username && (
            <p>
              Welcome <strong>{username}</strong>
            </p>
          )}

          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              width={100}
              height={100}
              style={{ borderRadius: "50%" }}
            />
          ) : (
            <p>No profile image</p>
          )}

          <div style={{ marginTop: "1rem" }}>
            <input
              type="text"
              placeholder="New username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              disabled={uploading}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <button onClick={handleUpdateProfile} disabled={uploading}>
              {uploading ? "Uploading..." : "Update Profile"}
            </button>
          </div>
        </>
      ) : (
        <p>Not logged in</p>
      )}

      <button
        style={{ marginTop: "1rem" }}
        onClick={async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Logout failed:", error.message);
          } else {
            navigate("/login");
          }
        }}
      >
        Log out
      </button>
    </div>
  );
}
