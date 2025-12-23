import { Profile, Chip, Link } from "@/types/profile";

export const mockProfile: Profile = {
  username: "Aurelia Starseeker",
  bio: "Discover my projects and connect with me.",
  avatarUrl: "/avatar-placeholder.jpg",
};

export const mockChips: Chip[] = [
  { id: "1", label: "Chip" },
  { id: "2", label: "YouTube" },
  { id: "3", label: "Mail" },
];

export const mockLinks: Link[] = [
  { id: "1", title: "Visit My Blog", url: "#", variant: "primary" },
  { id: "2", title: "Check My Portfolio", url: "#", variant: "secondary" },
  {
    id: "3",
    title: "Follow on Instagram",
    url: "#",
    variant: "tertiary",
  },
  { id: "4", title: "GitHub", url: "#", variant: "primary" },
  { id: "5", title: "LinkedIn", url: "#", variant: "secondary" },
  { id: "6", title: "Twitter", url: "#", variant: "tertiary" },
];

