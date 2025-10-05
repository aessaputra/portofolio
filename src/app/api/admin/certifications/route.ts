import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { certifications } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

/**
 * Certification Management API
 *
 * This API provides endpoints for managing professional certifications in the portfolio.
 * It supports CRUD operations (Create, Read, Update, Delete) for certifications.
 *
 * Features:
 * - Automatic table creation if it doesn't exist
 * - Image storage and management using Cloudflare R2
 * - Comprehensive validation and error handling
 * - Support for featured certifications
 * - Tag-based categorization
 * - Expiry date tracking
 *
 * Authentication: Admin access required
 *
 * @module CertificationAPI
 */

// Helper function to check if certifications table exists and create it if it doesn't
async function ensureCertificationsTableExists() {
  try {
    // Check if certifications table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'certifications'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log("Certifications table does not exist, creating it...");
      
      // Create the certifications table
      await db.execute(sql`
        CREATE TABLE certifications (
          id serial PRIMARY KEY NOT NULL,
          title text NOT NULL,
          issuer text NOT NULL,
          issue_date text NOT NULL,
          expiry_date text,
          credential_id text,
          credential_url text NOT NULL,
          image_url text NOT NULL,
          image_alt text NOT NULL,
          description text,
          tags jsonb DEFAULT '[]' NOT NULL,
          featured boolean DEFAULT false NOT NULL,
          display_order integer DEFAULT 0 NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        );
      `);
      
      console.log("Certifications table created successfully");
    }
  } catch (error) {
    console.error("Error ensuring certifications table exists:", error);
    throw error;
  }
}

/**
 * GET /api/admin/certifications
 *
 * Retrieves all certifications from the database, ordered by display order.
 *
 * @returns {Promise<NextResponse>} JSON response containing an array of certification objects
 * @throws {NextResponse} 401 if authentication fails
 * @throws {NextResponse} 500 if database query fails
 */
export async function GET() {
  try {
    await requireAdmin();
    
    // Ensure certifications table exists
    await ensureCertificationsTableExists();
    
    let certificationsList = await db.query.certifications.findMany({
      orderBy: [asc(certifications.displayOrder)],
    });

    return NextResponse.json(certificationsList);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch certifications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/certifications
 *
 * Creates a new certification in the database.
 *
 * @param {NextRequest} request - The HTTP request containing certification data
 * @param {Object} request.body - The request body
 * @param {string} request.body.title - The title of the certification
 * @param {string} request.body.issuer - The issuer of the certification
 * @param {string} request.body.issueDate - The issue date of the certification
 * @param {string} [request.body.expiryDate] - The expiry date of the certification (optional)
 * @param {string} [request.body.credentialId] - The credential ID of the certification (optional)
 * @param {string} request.body.credentialUrl - The URL to verify the certification
 * @param {string} request.body.imageUrl - The URL of the certification image
 * @param {string} request.body.imageAlt - The alt text for the certification image
 * @param {string} [request.body.description] - The description of the certification (optional)
 * @param {string[]} [request.body.tags] - The tags associated with the certification (optional)
 * @param {boolean} [request.body.featured] - Whether the certification is featured (optional)
 * @param {number} [request.body.displayOrder] - The display order of the certification (optional)
 *
 * @returns {Promise<NextResponse>} JSON response containing the created certification object
 * @throws {NextResponse} 400 if required fields are missing or validation fails
 * @throws {NextResponse} 401 if authentication fails
 * @throws {NextResponse} 500 if database operation fails
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    // Ensure certifications table exists
    await ensureCertificationsTableExists();
    
    const body = await request.json();
    const { 
      title, 
      issuer, 
      issueDate, 
      expiryDate, 
      credentialId, 
      credentialUrl, 
      imageUrl, 
      imageAlt, 
      description, 
      tags, 
      featured, 
      displayOrder 
    } = body;

    // Validate required fields
    if (!title || !issuer || !issueDate || !credentialUrl || !imageUrl || !imageAlt) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            title: !title ? "Title is required" : null,
            issuer: !issuer ? "Issuer is required" : null,
            issueDate: !issueDate ? "Issue date is required" : null,
            credentialUrl: !credentialUrl ? "Credential URL is required" : null,
            imageUrl: !imageUrl ? "Image URL is required" : null,
            imageAlt: !imageAlt ? "Image alt text is required" : null,
          }
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(credentialUrl);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid credential URL format",
          details: "Please provide a valid URL for the credential"
        },
        { status: 400 }
      );
    }

    // Validate image URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid image URL format",
          details: "Please provide a valid URL for the image"
        },
        { status: 400 }
      );
    }

    // Validate issue date format (basic check)
    if (issueDate && isNaN(Date.parse(issueDate))) {
      return NextResponse.json(
        {
          error: "Invalid issue date format",
          details: "Please provide a valid date for the issue date"
        },
        { status: 400 }
      );
    }

    // Validate expiry date format if provided
    if (expiryDate && isNaN(Date.parse(expiryDate))) {
      return NextResponse.json(
        {
          error: "Invalid expiry date format",
          details: "Please provide a valid date for the expiry date or leave it empty"
        },
        { status: 400 }
      );
    }

    // Create new certification
    const [newCertification] = await db.insert(certifications).values({
      title,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      imageUrl,
      imageAlt,
      description,
      tags: tags || [],
      featured: featured || false,
      displayOrder: displayOrder || 0,
    }).returning();

    return NextResponse.json(newCertification, { status: 201 });
  } catch (error) {
    console.error("Error creating certification:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create certification" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/certifications
 *
 * Updates an existing certification in the database.
 *
 * @param {NextRequest} request - The HTTP request containing certification data
 * @param {Object} request.body - The request body
 * @param {number} request.body.id - The ID of the certification to update
 * @param {string} [request.body.title] - The title of the certification (optional)
 * @param {string} [request.body.issuer] - The issuer of the certification (optional)
 * @param {string} [request.body.issueDate] - The issue date of the certification (optional)
 * @param {string} [request.body.expiryDate] - The expiry date of the certification (optional)
 * @param {string} [request.body.credentialId] - The credential ID of the certification (optional)
 * @param {string} [request.body.credentialUrl] - The URL to verify the certification (optional)
 * @param {string} [request.body.imageUrl] - The URL of the certification image (optional)
 * @param {string} [request.body.imageAlt] - The alt text for the certification image (optional)
 * @param {string} [request.body.description] - The description of the certification (optional)
 * @param {string[]} [request.body.tags] - The tags associated with the certification (optional)
 * @param {boolean} [request.body.featured] - Whether the certification is featured (optional)
 * @param {number} [request.body.displayOrder] - The display order of the certification (optional)
 *
 * @returns {Promise<NextResponse>} JSON response containing the updated certification object
 * @throws {NextResponse} 400 if required fields are missing or validation fails
 * @throws {NextResponse} 401 if authentication fails
 * @throws {NextResponse} 404 if certification is not found
 * @throws {NextResponse} 500 if database operation fails
 */
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    // Ensure certifications table exists
    await ensureCertificationsTableExists();
    
    const body = await request.json();
    const { 
      id, 
      title, 
      issuer, 
      issueDate, 
      expiryDate, 
      credentialId, 
      credentialUrl, 
      imageUrl, 
      imageAlt, 
      description, 
      tags, 
      featured, 
      displayOrder 
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Missing certification ID" },
        { status: 400 }
      );
    }

    // Validate ID is a number
    if (isNaN(parseInt(id.toString()))) {
      return NextResponse.json(
        {
          error: "Invalid certification ID",
          details: "Certification ID must be a valid number"
        },
        { status: 400 }
      );
    }

    // Check if certification exists
    const existingCertification = await db.query.certifications.findFirst({
      where: eq(certifications.id, parseInt(id.toString())),
    });

    if (!existingCertification) {
      return NextResponse.json(
        {
          error: "Certification not found",
          details: `No certification found with ID ${id}`
        },
        { status: 404 }
      );
    }

    // Validate URL format if provided
    if (credentialUrl) {
      try {
        new URL(credentialUrl);
      } catch {
        return NextResponse.json(
          {
            error: "Invalid credential URL format",
            details: "Please provide a valid URL for the credential"
          },
          { status: 400 }
        );
      }
    }

    // Validate image URL format if provided
    if (imageUrl) {
      try {
        new URL(imageUrl);
      } catch {
        return NextResponse.json(
          {
            error: "Invalid image URL format",
            details: "Please provide a valid URL for the image"
          },
          { status: 400 }
        );
      }
    }

    // Validate issue date format if provided
    if (issueDate && isNaN(Date.parse(issueDate))) {
      return NextResponse.json(
        {
          error: "Invalid issue date format",
          details: "Please provide a valid date for the issue date"
        },
        { status: 400 }
      );
    }

    // Validate expiry date format if provided
    if (expiryDate && isNaN(Date.parse(expiryDate))) {
      return NextResponse.json(
        {
          error: "Invalid expiry date format",
          details: "Please provide a valid date for the expiry date or leave it empty"
        },
        { status: 400 }
      );
    }

    // Update certification
    const [updatedCertification] = await db
      .update(certifications)
      .set({
        title: title ?? existingCertification.title,
        issuer: issuer ?? existingCertification.issuer,
        issueDate: issueDate ?? existingCertification.issueDate,
        expiryDate: expiryDate ?? existingCertification.expiryDate,
        credentialId: credentialId ?? existingCertification.credentialId,
        credentialUrl: credentialUrl ?? existingCertification.credentialUrl,
        imageUrl: imageUrl ?? existingCertification.imageUrl,
        imageAlt: imageAlt ?? existingCertification.imageAlt,
        description: description ?? existingCertification.description,
        tags: tags ?? existingCertification.tags,
        featured: featured ?? existingCertification.featured,
        displayOrder: displayOrder ?? existingCertification.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(certifications.id, id))
      .returning();
    
    return NextResponse.json(updatedCertification);
  } catch (error) {
    console.error("Error updating certification:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update certification" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/certifications
 *
 * Deletes a certification from the database and its associated image from Cloudflare R2.
 *
 * @param {NextRequest} request - The HTTP request
 * @param {URLSearchParams} request.url.searchParams - The URL search parameters
 * @param {string} request.url.searchParams.id - The ID of the certification to delete
 *
 * @returns {Promise<NextResponse>} JSON response indicating success
 * @throws {NextResponse} 400 if certification ID is missing or invalid
 * @throws {NextResponse} 401 if authentication fails
 * @throws {NextResponse} 404 if certification is not found
 * @throws {NextResponse} 500 if database operation fails
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    
    // Ensure certifications table exists
    await ensureCertificationsTableExists();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing certification ID" },
        { status: 400 }
      );
    }

    // Validate ID is a number
    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: "Invalid certification ID",
          details: "Certification ID must be a valid number"
        },
        { status: 400 }
      );
    }

    // Check if certification exists
    const existingCertification = await db.query.certifications.findFirst({
      where: eq(certifications.id, parseInt(id)),
    });

    if (!existingCertification) {
      return NextResponse.json(
        {
          error: "Certification not found",
          details: `No certification found with ID ${id}`
        },
        { status: 404 }
      );
    }

    // Get certification details to delete the associated image
    const certificationToDelete = await db.query.certifications.findFirst({
      where: eq(certifications.id, parseInt(id)),
    });
    
    // Delete certification
    await db.delete(certifications).where(eq(certifications.id, parseInt(id)));
    
    // Delete the associated image from R2 if it exists
    if (certificationToDelete?.imageUrl) {
      try {
        const { extractObjectKeyFromUrl, deleteImageFromR2, objectExistsInR2 } = await import("@/lib/r2");
        const objectKey = extractObjectKeyFromUrl(certificationToDelete.imageUrl);
        
        if (objectKey && objectKey.startsWith('certification-')) {
          // Check if the object exists before attempting to delete it
          const exists = await objectExistsInR2(objectKey);
          if (exists) {
            await deleteImageFromR2(objectKey);
            console.log(`Deleted certification image: ${objectKey}`);
          } else {
            console.log(`Certification image not found in R2: ${objectKey}`);
          }
        }
      } catch (imageError) {
        console.error("Error deleting certification image from R2:", imageError);
        // We don't fail the deletion if the image deletion fails
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting certification:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete certification" },
      { status: 500 }
    );
  }
}