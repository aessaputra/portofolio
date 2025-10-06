import { auth } from "@/features/auth/server/nextAuth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  return NextResponse.json(session)
}