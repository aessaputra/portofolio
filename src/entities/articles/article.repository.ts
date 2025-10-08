import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { articles } from "@/db/schema";

import type {
  Article,
  ArticleSource,
  ArticleSourceInput,
  ArticleSourceRecord,
  FetchArticlesOptions,
  GetArticleSourcesOptions,
} from "./article.types";

const DEFAULT_SOURCE: ArticleSourceInput = {
  name: "WordPress Blog",
  url: "https://wordpress.org/news/wp-json/wp/v2/posts?per_page=5",
  enabled: true,
  displayOrder: 1,
};

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function mapSource(record: ArticleSourceRecord): ArticleSource {
  return {
    id: record.id,
    name: record.name,
    url: record.url,
    enabled: record.enabled,
    displayOrder: record.displayOrder,
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
  };
}

async function ensureArticleSource(): Promise<void> {
  const existing = await db.query.articles.findMany({ limit: 1 });
  if (existing.length === 0) {
    await db.insert(articles).values(DEFAULT_SOURCE);
  }
}

export async function getArticleSources(options: GetArticleSourcesOptions = {}): Promise<ArticleSource[]> {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.warn("[ArticlesRepository] DATABASE_URL not available, returning default source");
      return [mapSource({
        id: 0,
        name: DEFAULT_SOURCE.name,
        url: DEFAULT_SOURCE.url,
        enabled: DEFAULT_SOURCE.enabled,
        displayOrder: DEFAULT_SOURCE.displayOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      })];
    }

    await ensureArticleSource();
    const records = await db
      .select()
      .from(articles)
      .where(options.enabled === undefined ? undefined : eq(articles.enabled, options.enabled))
      .orderBy(asc(articles.displayOrder), asc(articles.createdAt));
    return records.map(mapSource);
  } catch (error) {
    console.error("[ArticlesRepository] Failed to fetch article sources", error);
    
    // During build time, if database is not available, return default source
    if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED'))) {
      console.warn("[ArticlesRepository] Database connection failed during build, using default source");
      return [mapSource({
        id: 0,
        name: DEFAULT_SOURCE.name,
        url: DEFAULT_SOURCE.url,
        enabled: DEFAULT_SOURCE.enabled,
        displayOrder: DEFAULT_SOURCE.displayOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      })];
    }
    
    return [];
  }
}

export async function createArticleSource(input: ArticleSourceInput): Promise<ArticleSource> {
  const [record] = await db
    .insert(articles)
    .values({
      name: input.name,
      url: input.url,
      enabled: input.enabled ?? true,
      displayOrder: input.displayOrder ?? 0,
    })
    .returning();

  return mapSource(record);
}

export async function updateArticleSource(id: number, input: ArticleSourceInput): Promise<ArticleSource | null> {
  const [record] = await db
    .update(articles)
    .set({
      name: input.name,
      url: input.url,
      enabled: input.enabled ?? true,
      displayOrder: input.displayOrder ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id))
    .returning();

  return record ? mapSource(record) : null;
}

export async function deleteArticleSource(id: number): Promise<boolean> {
  const result = await db.delete(articles).where(eq(articles.id, id));
  return (result.rowCount ?? 0) > 0;
}

async function fetchWordPressArticles(source: ArticleSource, limit?: number): Promise<Article[]> {
  const embedUrl = source.url.includes("?") ? `${source.url}&_embed` : `${source.url}?_embed`;

  const response = await fetch(embedUrl, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    console.error(`[Articles] Failed to fetch from ${source.name}: ${response.statusText}`);
    return [];
  }

  const data = (await response.json()) as any[];

  return data.slice(0, limit ?? data.length).map((item) => {
    const featured = item._embedded?.["wp:featuredmedia"]?.[0];
    const imageUrl = featured?.source_url ?? null;
    const imageAlt = featured?.alt_text ?? null;

    const excerpt = (item.excerpt?.rendered ?? "")
      .replace(/<[^>]*>/g, "")
      .replace(/\[&hellip;\]/, "...")
      .trim();

    return {
      id: Number(item.id),
      title: item.title?.rendered ?? "Untitled",
      excerpt,
      content: item.content?.rendered ?? "",
      date: item.date ?? new Date().toISOString(),
      link: item.link ?? "",
      imageUrl,
      imageAlt,
      source: source.name,
    } satisfies Article;
  });
}

export async function fetchArticles(options: FetchArticlesOptions = {}): Promise<Article[]> {
  const sources = await getArticleSources({ enabled: true });
  if (sources.length === 0) return [];

  const promises = sources.map((source) => fetchWordPressArticles(source, options.limit));
  const results = await Promise.all(promises);
  const articlesList = results.flat();

  return articlesList
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, options.limit ?? articlesList.length);
}
