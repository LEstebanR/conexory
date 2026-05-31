import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Por favor ingresa un email válido" },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    // Database integration placeholder — configure DATABASE_URL to persist
    if (process.env.DATABASE_URL) {
      try {
        const { neon } = await import("@neondatabase/serverless")
        const sql = neon(process.env.DATABASE_URL)
        await sql`
          CREATE TABLE IF NOT EXISTS waitlist (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `
        await sql`
          INSERT INTO waitlist (email, name)
          VALUES (${cleanEmail}, ${name ?? null})
          ON CONFLICT (email) DO NOTHING
        `
      } catch (dbError) {
        console.error("DB error:", dbError)
      }
    } else {
      // Development fallback — just log
      console.log(`[waitlist] New signup: ${cleanEmail} (${name ?? "anon"})`)
    }

    return NextResponse.json({
      success: true,
      message: "¡Listo! Te avisaremos cuando lancemos.",
    })
  } catch {
    return NextResponse.json(
      { error: "Algo salió mal. Intenta de nuevo." },
      { status: 500 }
    )
  }
}
