
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }
    
    return NextResponse.json({ valid: true, user: session.user })
  } catch (error) {
    return NextResponse.json({ error: "Session validation failed" }, { status: 401 })
  }
}
