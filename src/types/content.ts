export type ContentStatus = "draft" | "published" | "archived";

export type EventPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  introText: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  status?: ContentStatus;
};

export type LeadPayload = {
  name?: string;
  phone: string;
  eventDate?: string;
  guestCount?: number;
  hallSlug?: string;
  message?: string;
  source?: string;
  trap?: string;
};
