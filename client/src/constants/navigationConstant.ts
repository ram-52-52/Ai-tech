export const PUBLIC_ROUTES = [
  "/login",
];

export const USER_ROUTES = [
  "/",
  "/blogs",
  "/blogs/:id",
  "/blogs/:id/view",
  "/generate",
  "/trends",
  "/settings",
];

export const SUPERADMIN_ROUTES = [
  "/superadmin",
  "/superadmin/dashboard",
  "/superadmin/users",
  "/superadmin/billing",
  "/superadmin/logs",
  "/superadmin/plan",
  "/superadmin/blogs",
];

export const NAVIGATION_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["user"] },
  { label: "All Blogs", href: "/blogs", icon: "FileText", roles: ["user"] },
  { label: "Generate New", href: "/generate", icon: "Sparkles", roles: ["user"] },
  { label: "Trends", href: "/trends", icon: "TrendingUp", roles: ["user"] },
  { label: "Settings", href: "/settings", icon: "Settings", roles: ["user"] },
];

export const SUPERADMIN_NAVIGATION_ITEMS = [
  { label: "Dashboard", href: "/superadmin/dashboard", icon: "LayoutDashboard", roles: ["superadmin"] },
  { label: "Platform Blogs", href: "/superadmin/blogs", icon: "FileText", roles: ["superadmin"] },
  { label: "User Management", href: "/superadmin/users", icon: "Users", roles: ["superadmin"] },
  { label: "Billing & Subscriptions", href: "/superadmin/billing", icon: "CreditCard", roles: ["superadmin"] },
  { label: "Platform Logs", href: "/superadmin/logs", icon: "Activity", roles: ["superadmin"] },
  { label: "AI Quota & Plan", href: "/superadmin/plan", icon: "PieChart", roles: ["superadmin"] },
];
