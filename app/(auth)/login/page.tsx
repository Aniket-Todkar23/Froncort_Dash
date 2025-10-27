'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/lib/stores/user-store'
import { toast } from 'sonner'
import { Briefcase } from 'lucide-react'
import { signInWithEmail } from '@/lib/supabase/auth'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useUserStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const { session, user } = await signInWithEmail(email, password)
      
      if (user) {
        setUser(
          {
            id: user.id,
            email: user.email || email,
            name: user.user_metadata?.name || email.split('@')[0],
            createdAt: new Date(user.created_at),
          },
          'editor'
        )
        toast.success('Logged in successfully!')
        router.push('/')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoMode = async () => {
    try {
      setLoading(true)
      // Sign in with demo credentials
      const { user } = await signInWithEmail('demo@froncort.com', 'demo1234')
      
      if (user) {
        setUser(
          {
            id: user.id,
            email: user.email || 'demo@froncort.com',
            name: 'Demo User',
            createdAt: new Date(user.created_at),
          },
          'editor'
        )
        toast.success('Demo mode activated!')
        router.push('/')
      }
    } catch (err) {
      // Fallback to mock if demo account doesn't exist
      setUser(
        {
          id: 'demo-user',
          email: 'demo@froncort.com',
          name: 'Demo User',
          createdAt: new Date(),
        },
        'editor'
      )
      toast.success('Demo mode activated!')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center pb-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
              <Briefcase size={24} />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Froncort</CardTitle>
          <CardDescription>Collaborative project management simplified</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoMode}
            disabled={loading}
          >
            Enter Demo Mode
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
