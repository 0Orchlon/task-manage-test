import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/register", "routes/register.tsx"),
  route("/poo", "routes/poo.tsx"),
  route("/tasks/new", "components/tasks/new.tsx"), // <-- Add this line
  route("/.well-known/*", "routes/well-known.tsx"),
] satisfies RouteConfig;