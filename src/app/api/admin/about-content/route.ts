import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { aboutContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Default about content values
const DEFAULT_ABOUT_CONTENT = {
  headline: "Lorem Ipsum Dolor Sit Amet!",
  aboutMeText1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  aboutMeText2: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  aboutMeText3: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  profileImagePath: "/images/profile/developer-pic-2.jpg",
  satisfiedClients: "8",
  projectsCompleted: "10",
  yearsOfExperience: "4",
  skills: [
    { name: "HTML", x: "-21vw", y: "2vw" },
    { name: "CSS", x: "-6vw", y: "-9vw" },
    { name: "JavaScript", x: "19vw", y: "6vw" },
    { name: "React", x: "0vw", y: "10vw" },
    { name: "D3.js", x: "-21vw", y: "-15vw" },
    { name: "THREEJS", x: "19vw", y: "-12vw" },
    { name: "NextJS", x: "31vw", y: "-5vw" },
    { name: "Python", x: "19vw", y: "-20vw" },
    { name: "Tailwind CSS", x: "0vw", y: "-20vw" },
    { name: "Figma", x: "-24vw", y: "18vw" },
    { name: "Blender", x: "17vw", y: "17vw" },
  ],
  experiences: [
    {
      position: "Lorem Ipsum",
      company: "Lorem Ipsum",
      companyLink: "/",
      time: "2022-Present",
      address: "Lorem, Ipsum",
      work: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      ]
    },
    {
      position: "Lorem Ipsum",
      company: "Lorem Ipsum",
      companyLink: "/",
      time: "2022-Present",
      address: "Lorem, Ipsum",
      work: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      ]
    },
    {
      position: "Lorem Ipsum",
      company: "Lorem Ipsum",
      companyLink: "/",
      time: "2022-Present",
      address: "Lorem, Ipsum",
      work: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      ]
    }
  ],
  education: [
    {
      type: "Lorem Ipsum",
      time: "2022-2026",
      place: "Lorem Ipsum Dolor Sit Amet",
      info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      type: "Lorem Ipsum",
      time: "2022-2026",
      place: "Lorem Ipsum Dolor Sit Amet",
      info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      type: "Lorem Ipsum",
      time: "2022-2026",
      place: "Lorem Ipsum Dolor Sit Amet",
      info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
  ],
};

// GET handler to fetch about content
export async function GET() {
  try {
    await requireAdmin();
    
    let content = await db.query.aboutContent.findFirst({
      where: eq(aboutContent.id, 1),
    });

    // If no content exists, create default content
    if (!content) {
      try {
        const [newContent] = await db.insert(aboutContent).values(DEFAULT_ABOUT_CONTENT).returning();
        content = newContent;
      } catch (insertError) {
        console.error("Error creating default about content:", insertError);
        return NextResponse.json(
          { error: "Failed to create default about content" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching about content:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch about content" },
      { status: 500 }
    );
  }
}

// PUT handler to update about content
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const {
      headline,
      aboutMeText1,
      aboutMeText2,
      aboutMeText3,
      profileImagePath,
      satisfiedClients,
      projectsCompleted,
      yearsOfExperience,
      skills,
      experiences,
      education,
    } = body;

    // Validate required fields
    if (!headline || !aboutMeText1 || !aboutMeText2 || !aboutMeText3 || !profileImagePath) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if content exists
    const existingContent = await db.query.aboutContent.findFirst({
      where: eq(aboutContent.id, 1),
    });

    let updatedContent;
    
    if (existingContent) {
      // Update existing content
      const result = await db
        .update(aboutContent)
        .set({
          headline,
          aboutMeText1,
          aboutMeText2,
          aboutMeText3,
          profileImagePath,
          satisfiedClients,
          projectsCompleted,
          yearsOfExperience,
          skills,
          experiences,
          education,
          updatedAt: new Date(),
        })
        .where(eq(aboutContent.id, 1))
        .returning();
      
      updatedContent = result[0];
    } else {
      // Create new content if it doesn't exist
      const [newContent] = await db.insert(aboutContent).values({
        id: 1,
        headline,
        aboutMeText1,
        aboutMeText2,
        aboutMeText3,
        profileImagePath,
        satisfiedClients,
        projectsCompleted,
        yearsOfExperience,
        skills,
        experiences,
        education,
        updatedAt: new Date(),
      }).returning();
      
      updatedContent = newContent;
    }

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Error updating about content:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update about content" },
      { status: 500 }
    );
  }
}