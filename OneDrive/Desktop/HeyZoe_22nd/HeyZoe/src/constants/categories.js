import {
  Home,
  DollarSign,
  Sunrise,
  Activity,
  Briefcase,
  GraduationCap,
  Users2,
  Building2,
  Plane,
  Sprout,
} from "lucide-react";

export const CATEGORY_COLORS = {
  finances: "#cfd3f0",
  spirituality: "#c7ddc5",
  health: "#f0c3ba",
  career: "#f2dd8f",
  education: "#f1d3ae",
  relationships: "#cbe6df",
  family: "#e6c7cc",
  business: "#dccdf2",
  travel: "#b9e2d9",
  "personal-growth": "#f4e2ad",
};

export const CATEGORIES = [
  { id: "finances", label: "Finances", icon: DollarSign },
  { id: "spirituality", label: "Spirituality", icon: Sunrise },
  { id: "health", label: "Health", icon: Activity },
  { id: "career", label: "Career", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "relationships", label: "Relationships", icon: Users2 },
  { id: "family", label: "Family", icon: Home },
  { id: "business", label: "Business", icon: Building2 },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "personal-growth", label: "Personal Growth", icon: Sprout },
];

export const catById = (id) => CATEGORIES.find((c) => c.id === id);
export const catColor = (id) => CATEGORY_COLORS[id];
