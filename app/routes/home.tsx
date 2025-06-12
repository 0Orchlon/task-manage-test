import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import App from "~/App";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <>
  
        <h1>Hello World</h1>
  <App />
  <Welcome />;
  
  </>
}
