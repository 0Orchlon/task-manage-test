import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import App from "~/App";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <>
      <h1>Hello World</h1>
      <button
        onClick={async () => {
          navigate("/login");
        }}
        className="px-4 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"

>
        login
      </button>
      <button
        onClick={async () => {
          navigate("/register");
        }}
        className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
      >
        register
      </button>
      <App />
      <Welcome />;
    </>
  );
}
