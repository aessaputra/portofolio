import type { InferModel } from "drizzle-orm";

import { articles } from "@/db/schema";

export type ArticleSourceRecord = InferModel<typeof articles>;

export type ArticleSource = {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ArticleSourceInput = {
  name: string;
  url: string;
  enabled?: boolean;
  displayOrder?: number;
};

export type Article = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  link: string;
  imageUrl: string | null;
  imageAlt: string | null;
  source: string;
};

export type FetchArticlesOptions = {
  limit?: number;
};

export type GetArticleSourcesOptions = {
  enabled?: boolean;
};
