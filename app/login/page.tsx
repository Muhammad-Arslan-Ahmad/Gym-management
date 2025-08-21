import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { verifyPassword, createSession, getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

async function loginAction(formData: FormData) {
  "use server"

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    redirect("/login?error=missing-fields")
  }

  try {
    const users = await sql`
      SELECT * FROM admin_users WHERE email = ${email}
    `

    if (users.length === 0) {
      redirect("/login?error=invalid-credentials")
    }

    const user = users[0] as any
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      redirect("/login?error=invalid-credentials")
    }

    await createSession(user.id)
    redirect("/dashboard")
  } catch (error) {
    console.error("Login error:", error)
    redirect("/login?error=server-error")
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  // Redirect if already logged in
  const session = await getSession()
  if (session) {
    redirect("/dashboard")
  }

  const error = searchParams.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">Gym Management</CardTitle>
          <CardDescription>Sign in to your admin account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error === "invalid-credentials" && "Invalid email or password"}
                {error === "missing-fields" && "Please fill in all fields"}
                {error === "server-error" && "Server error. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@gym.com" required className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Demo Credentials:</p>
            <p className="text-sm text-blue-700">Email: admin@gym.com</p>
            <p className="text-sm text-blue-700">Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
