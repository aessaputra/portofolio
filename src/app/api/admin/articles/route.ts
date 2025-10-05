import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { articles } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Default articles values
const DEFAULT_ARTICLES = [
  {
    name: "WordPress Blog",
    url: "https://wordpress.org/news/wp-json/wp/v2/posts?per_page=5",
    enabled: true,
    displayOrder: 1,
  },
];

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
      await db.insert(articles).values(DEFAULT_ARTICLES);
      console.log("Default articles created successfully");
    }
  } catch (error) {
    console.error("Error ensuring articles table exists:", error);
    throw error;
  }
}

// GET handler to fetch articles
export async function GET() {
  try {
    await requireAdmin();
    
    // Ensure articles table exists
    await ensureArticlesTableExists();
    
    let articlesList = await db.query.articles.findMany({
      orderBy: [asc(articles.displayOrder)],
    });

    return NextResponse.json(articlesList);
  } catch (error) {
    console.error("Error fetching articles:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST handler to create a new article
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    // Ensure articles table exists
    await ensureArticlesTableExists();
    
    const body = await request.json();
    const { name, url, enabled, displayOrder } = body;

    // Validate required fields
    if (!name || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new article
    const [newArticle] = await db.insert(articles).values({
      name,
      url,
      enabled: enabled ?? true,
      displayOrder: displayOrder ?? 0,
    }).returning();

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}

// PUT handler to update articles
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    // Ensure articles table exists
    await ensureArticlesTableExists();
    
    const body = await request.json();
    const { id, name, url, enabled, displayOrder } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Missing article ID" },
        { status: 400 }
      );
    }

    // Check if article exists
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.id, id),
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Update article
    const [updatedArticle] = await db
      .update(articles)
      .set({
        name: name ?? existingArticle.name,
        url: url ?? existingArticle.url,
        enabled: enabled ?? existingArticle.enabled,
        displayOrder: displayOrder ?? existingArticle.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id))
      .returning();
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error("Error updating article:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE handler to delete an article
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    
    // Ensure articles table exists
    await ensureArticlesTableExists();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing article ID" },
        { status: 400 }
      );
    }

    // Check if article exists
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.id, parseInt(id)),
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Delete article
    await db.delete(articles).where(eq(articles.id, parseInt(id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}