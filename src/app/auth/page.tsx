'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { toast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, LogIn } from 'lucide-react'
import { FirebaseError } from 'firebase/app'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState('')
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [authError, setAuthError] = useState<string | null>(null)
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

  const validateForm = (mode: 'login' | 'signup') => {
    const errors: { [key: string]: string } = {}
    if (!email) errors.email = 'Email is required'
    if (!password) errors.password = 'Password is required'
    if (mode === 'signup') {
      if (!fullName) errors.fullName = 'Full name is required'
      if (password.length < 8) errors.password = 'Password must be at least 8 characters long'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

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
    setIsLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      const userProfileDoc = await getDoc(doc(db, 'userProfiles', user.uid));
  
      if (!userProfileDoc.exists()) {
        await setDoc(doc(db, 'userProfiles', user.uid), {
          fullName: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          favoriteDoctors: [],
        });
      }
  
      toast({
        title: "Logged in",
        description: "You have been logged in successfully with Google.",
      });
      router.push('/main');
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user') {
          setAuthError("Google sign-in was canceled. Please try again.");
        } else {
          setAuthError(`An error occurred during Google sign-in: ${error.message}`);
        }
      } else {
        setAuthError("An unexpected error occurred during Google sign-in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const checkPasswordStrength = (password: string) => {
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})")
    
    if (strongRegex.test(password)) {
      setPasswordStrength('strong')
    } else if (mediumRegex.test(password)) {
      setPasswordStrength('medium')
    } else {
      setPasswordStrength('weak')
    }
  }

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome to Ayur-Find</CardTitle>
          <CardDescription>Login or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={(e) => handleAuth(e, 'login')}>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                  {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
                </div>
                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
              <div className="mt-4">
                <Button variant="link" onClick={handleForgotPassword} disabled={isLoading}>
                  Forgot password?
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={(e) => handleAuth(e, 'signup')}>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                  />
                  {formErrors.fullName && <p className="text-sm text-red-500">{formErrors.fullName}</p>}
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                  {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => {
                      setPassword(e.target.value)
                      checkPasswordStrength(e.target.value)
                    }} 
                    required 
                  />
                  {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
                  {passwordStrength && (
                    <div className={`text-sm ${
                      passwordStrength === 'strong' ? 'text-green-500' : 
                      passwordStrength === 'medium' ? 'text-yellow-500' : 
                      'text-red-500'
                    }`}>
                      Password strength: {passwordStrength}
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-6">
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
            <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignIn} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}