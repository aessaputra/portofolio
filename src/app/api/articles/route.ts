import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { articles } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

// WordPress article interface
interface WordPressArticle {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
  };
}

// Processed article interface
interface ProcessedArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  link: string;
  imageUrl?: string;
  imageAlt?: string;
  source: string;
}

// Helper function to check if articles table exists and create it if it doesn't
async function ensureArticlesTableExists() {
  try {
    // Check if articles table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'articles'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log("Articles table does not exist, creating it...");
      
      // Create the articles table
      await db.execute(sql`
        CREATE TABLE "articles" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "url" text NOT NULL,
          "enabled" boolean DEFAULT true NOT NULL,
          "display_order" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      
      console.log("Articles table created successfully");
      
      // Insert default articles
      await db.insert(articles).values([
        {
          name: "WordPress Blog",
          url: "https://wordpress.org/news/wp-json/wp/v2/posts?per_page=5",
          enabled: true,
          displayOrder: 1,
        },
      ]);
      console.log("Default articles created successfully");
    }
  } catch (error) {
    console.error("Error ensuring articles table exists:", error);
    throw error;
  }
}

// GET handler to fetch articles from WordPress URLs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : 10;
    
    // Ensure articles table exists
    await ensureArticlesTableExists();
    
    // Get enabled article sources from database
    const articleSources = await db.query.articles.findMany({
      where: eq(articles.enabled, true),
      orderBy: [asc(articles.displayOrder)],
    });

    if (articleSources.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch articles from each source
    const allArticles: ProcessedArticle[] = [];
    
    for (const source of articleSources) {
      try {
        // Add _embed parameter to fetch featured media
        const embedUrl = source.url.includes('?')
          ? `${source.url}&_embed`
          : `${source.url}?_embed`;
          
        const response = await fetch(embedUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 3600 }, // Revalidate every hour
        });

        if (!response.ok) {
          console.error(`Failed to fetch articles from ${source.name}: ${response.statusText}`);
          continue;
        }

        const wordpressArticles: WordPressArticle[] = await response.json();
        
        // Process each article
        const processedArticles: ProcessedArticle[] = wordpressArticles.map(article => {
          // Extract image URL from featured media if available
          let imageUrl, imageAlt;
          if (article._embedded?.['wp:featuredmedia']?.[0]) {
            const featuredMedia = article._embedded['wp:featuredmedia'][0];
            imageUrl = featuredMedia.source_url;
            imageAlt = featuredMedia.alt_text || article.title.rendered;
          }

          // Clean up excerpt - remove HTML tags and limit length
          const excerpt = article.excerpt.rendered
            .replace(/<[^>]*>/g, '')
            .replace(/\[&hellip;\]/, '...')
            .trim();

          return {
            id: article.id,
            title: article.title.rendered,
            excerpt,
            content: article.content.rendered,
            date: article.date,
            link: article.link,
            imageUrl,
            imageAlt,
            source: source.name,
          };
        });

        allArticles.push(...processedArticles);
      } catch (error) {
        console.error(`Error fetching articles from ${source.name}:`, error);
        // Continue with other sources even if one fails
      }
    }

    // Sort all articles by date (newest first)
    allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply limit
    const limitedArticles = allArticles.slice(0, limit);

    return NextResponse.json(limitedArticles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}