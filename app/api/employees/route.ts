import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db-server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    let queryText = `
      SELECT * FROM employees 
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 0

    if (status) {
      paramCount++
      queryText += ` AND status = $${paramCount}`
      params.push(status)
    } else {
      paramCount++
      queryText += ` AND status = $${paramCount}`
      params.push("active")
    }

    if (search) {
      paramCount++
      queryText += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR position ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    queryText += ` ORDER BY name ASC`

    const result = await query(queryText, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()

    const { name, email, phone, position, salary, hire_date, status } = body

    if (!name || !email || !position || !hire_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await query(
      `
      INSERT INTO employees (name, email, phone, position, salary, hire_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [name, email, phone || null, position, salary || null, hire_date, status || "active"],
    )

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("Error creating employee:", error)
    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
