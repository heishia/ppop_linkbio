export interface Profile {
  username: string;
  bio: string;
  avatarUrl: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  variant: "primary" | "secondary" | "tertiary";
}

export interface Chip {
  id: string;
  label: string;
}

