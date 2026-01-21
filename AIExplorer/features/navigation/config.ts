export type NavIconKey =
  | "dashboard"
  | "gallery"
  | "submit"
  | "my-use-cases"
  | "metrics"
  | "champion";

export type NavItemConfig = {
  id: string;
  label: string;
  path: string;
  icon: NavIconKey;
};

export const NAV_ITEMS: NavItemConfig[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { id: "gallery", label: "AI Gallery", path: "/gallery", icon: "gallery" },
  {
    id: "submit-use-case",
    label: "Submit a Use Case",
    path: "/submit-use-case",
    icon: "submit",
  },
  {
    id: "my-use-cases",
    label: "My Use Cases",
    path: "/my-use-cases",
    icon: "my-use-cases",
  },
  {
    id: "metric-reporting",
    label: "Report Metrics",
    path: "/metric-reporting",
    icon: "metrics",
  },
  {
    id: "champion",
    label: "Champion Use Cases",
    path: "/champion",
    icon: "champion",
  },
];
