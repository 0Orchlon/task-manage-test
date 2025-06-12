// routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";
// add more routes if needed
export default [index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
// this poo is a test profile page
    route("poo", "routes/poo.tsx"),
    route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;