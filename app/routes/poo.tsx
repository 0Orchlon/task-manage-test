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

  useEffect(() => {
    const getUserData = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        navigate("/")
        console.error("Error getting user:", authError?.message);
        setEmail(null);
        setUsername(null);
        setImageUrl(null);
        return;
      }
      setEmail(authData.user.email ?? null);
      setUserId(authData.user.id);

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

    const { data } = supabase.storage.from("profilepic").getPublicUrl(filePath);
    setImageUrl(data.publicUrl);
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Your Profile</h2>
                    <button
            onClick={async () => {
              navigate("/profile");
            }}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
          >
            Back to profile
          </button>
          <button
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error("Logout failed:", error.message);
              } else {
                navigate("/login");
              }
            }}
            className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
          >
            Log out
          </button>
        </div>

        {email ? (
          <>
            <p className="text-gray-700 mb-4">
              Logged in as <strong>{email}</strong>
            </p>

            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border"
              />
            ) : (
              <p className="text-center text-gray-500 mb-4">No profile image</p>
            )}

            {username && (
              <p className="text-center text-lg font-semibold mb-4 text-black">
                Hello, <span className="text-blue-600">{username}</span>
              </p>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="New username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={uploading}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-black text-black"
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                placeholder="Select a new profile image"
                className="w-full text-black"
              />

              <button
                onClick={handleUpdateProfile}
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                {uploading ? "Uploading..." : "Update Profile"}
              </button>
            </div>
          </>
        ) : (
          <p className="text-red-600">Not logged in</p>
        )}
      </div>
    </div>
  );
}
