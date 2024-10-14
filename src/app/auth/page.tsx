'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { toast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, LogIn, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { FirebaseError } from 'firebase/app'
import { motion, AnimatePresence } from 'framer-motion'

const BackgroundAnimation = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900"
      animate={{
        background: [
          "linear-gradient(to bottom right, #e0f2f1, #e1f5fe)",
          "linear-gradient(to bottom right, #e8f5e9, #e3f2fd)",
          "linear-gradient(to bottom right, #f1f8e9, #e8eaf6)",
          "linear-gradient(to bottom right, #e0f2f1, #e1f5fe)",
        ],
      }}
      transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
    />
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white dark:bg-gray-800 opacity-20"
        style={{
          width: Math.random() * 100 + 50,
          height: Math.random() * 100 + 50,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, Math.random() * 100 - 50, 0],
          y: [0, Math.random() * 100 - 50, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    ))}
  </div>
)

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState('')
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/main')
      } else {
        setIsAuthenticating(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const validateForm = useCallback((mode: 'login' | 'signup') => {
    const errors: { [key: string]: string } = {}
    if (!email) errors.email = 'Email is required'
    if (!password) errors.password = 'Password is required'
    if (mode === 'signup') {
      if (!fullName) errors.fullName = 'Full name is required'
      if (password.length < 8) errors.password = 'Password must be at least 8 characters long'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [email, password, fullName])

  const handleAuth = async (e: React.FormEvent, mode: 'login' | 'signup') => {
    e.preventDefault()
    if (!validateForm(mode)) return
    setIsLoading(true)
    setAuthError(null)

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, 'userProfiles', userCredential.user.uid), {
          fullName,
          email,
          phone: '',
          favoriteDoctors: []
        })
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        toast({
          title: "Logged in",
          description: "You have been logged in successfully.",
        })
      }
      router.push('/main')
    } catch (error) {
      console.error("Authentication error:", error)
      setAuthError("An error occurred during authentication. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userProfileDoc = await getDoc(doc(db, 'userProfiles', user.uid))

      if (!userProfileDoc.exists()) {
        await setDoc(doc(db, 'userProfiles', user.uid), {
          fullName: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          favoriteDoctors: [],
        })
      }

      toast({
        title: "Logged in",
        description: "You have been logged in successfully with Google.",
      })
      router.push('/main')
    } catch (error) {
      console.error("Google sign-in error:", error)
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user') {
          setAuthError("Google sign-in was canceled. Please try again.")
        } else {
          setAuthError(`An error occurred during Google sign-in: ${error.message}`)
        }
      } else {
        setAuthError("An unexpected error occurred during Google sign-in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setFormErrors({ ...formErrors, email: 'Please enter your email address' })
      return
    }
    setIsLoading(true)
    setAuthError(null)
    try {
      await sendPasswordResetEmail(auth, email)
      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions to reset your password.",
      })
    } catch (error) {
      console.error("Password reset error:", error)
      setAuthError("An error occurred while sending the password reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const checkPasswordStrength = useCallback((password: string) => {
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})")
    
    if (strongRegex.test(password)) {
      setPasswordStrength('strong')
    } else if (mediumRegex.test(password)) {
      setPasswordStrength('medium')
    } else {
      setPasswordStrength('weak')
    }
  }, [])

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full overflow-hidden">
      <BackgroundAnimation />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 py-8 sm:px-0"
      >
        <Card className="w-full shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome to Ayur-Find</CardTitle>
            <CardDescription className="text-center">Login or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email"
                        className="pl-8"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                    {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-8 pr-10"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="mr-2 h-4 w-4" />
                      </motion.div>
                    ) : null}
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <Button variant="link" onClick={handleForgotPassword} disabled={isLoading}>
                    Forgot password?
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={(e) => handleAuth(e, 'signup')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="fullName" 
                        type="text" 
                        placeholder="Enter your full name"
                        className="pl-8"
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        required 
                      />
                    </div>
                    {formErrors.fullName && <p className="text-sm text-destructive">{formErrors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                
                        type="email" 
                        placeholder="Enter your email"
                        className="pl-8"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                    {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-8 pr-10"
                        value={password} 
                        onChange={(e) => {
                          setPassword(e.target.value)
                          checkPasswordStrength(e.target.value)
                        }} 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
                    {passwordStrength && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-sm ${
                          passwordStrength === 'strong' ? 'text-green-500' : 
                          passwordStrength === 'medium' ? 'text-yellow-500' : 
                          'text-red-500'
                        }`}
                      >
                        Password strength: {passwordStrength}
                      </motion.div>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="mr-2 h-4 w-4" />
                      </motion.div>
                    ) : null}
                    {isLoading ? 'Signing up...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="mr-2 h-4 w-4" />
                  </motion.div>
                ) : <LogIn className="mr-2 h-4 w-4" />}
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}