'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Lottie from '@/components/ui/lottie'
import { useUserStore } from '@/lib/stores/user-store'
import { toast } from 'sonner'
import { signInWithEmail } from '@/lib/supabase/auth'

const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      let index = 0
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 50)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [text, delay])

  return <span>{displayedText}</span>
}

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useUserStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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


  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      {/* Left Column - Hero Section + Lottie Animation (Desktop) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="top-10 hidden lg:flex flex-1 lg:w-1/2 items-center justify-center p-8 relative"
      >
        {/* Hero Text - Positioned above animation */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-6  lg:left- text-center z-10 w-full px-4 max-w lg:w-[1000px]"
        >
          <div className="text-3xl lg:text-5xl font-bold mb-0 tracking-tight leading-tight">
            <div className="text-center">Collaborate with
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-primary ml-2"
              >
                <TypingText text="Purpose" delay={600} />
              </motion.span>
            </div>
            <div className="text-sm lg:text-lg text-muted-foreground mt-3 lg:mt-2 text-center">
              <TypingText text="Real-time collaboration & task management" delay={1500} />
            </div>
          </div>
        </motion.div>

        {/* Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Lottie />
        </motion.div>

        {/* Glowing separator line */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] blur-sm"></div>
      </motion.div>

      {/* Mobile Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="flex lg:hidden w-full flex-col items-center justify-center p-4 py-8"
      >
        <div className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight text-center">
          Collaborate with
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-primary block sm:inline ml-0 sm:ml-2 mt-2 sm:mt-0"
          >
            <TypingText text="Purpose" delay={400} />
          </motion.span>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm text-muted-foreground text-center max-w-xs"
        >
          <TypingText text="Real-time collaboration & team coordination" delay={1200} />
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-4 w-40 h-40"
        >
          <Lottie />
        </motion.div>
      </motion.div>

      {/* Right Column - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex w-full lg:w-1/2 items-center justify-center p-2 sm:p-6"
      >
      <Card className="w-full max-w-md shadow-2xl border border-border/50 bg-card/98 backdrop-blur-md rounded-2xl">
        <CardHeader className="space-y-4 text-center pb-6 border-b border-border/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center pb-2"
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/30 shadow-lg shadow-primary/10">
              <Image src="/penrose_image.png" alt="Froncort Logo" width={40} height={40} className="rounded-lg" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Welcome to Froncort<span className="text-primary"> Forge</span></CardTitle>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <CardDescription className="text-sm text-muted-foreground/90 font-medium">Manage, collaborate, execute - all in one place</CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div className="space-y-3">
              <label htmlFor="email" className="text-sm font-semibold text-foreground block">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-background/50 border-border/60"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="text-sm font-semibold text-foreground block">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10 bg-background/50 border-border/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-md p-1 hover:bg-muted/40"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading} size="lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </motion.form>

          <div className="pt-2">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  )
}
