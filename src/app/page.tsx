'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import { Leaf, Search, Calendar, Star, ArrowRight, Users, Shield, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900 dark:via-green-800 dark:to-green-700">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-800 dark:text-green-100">
            Ayur-Find
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="#features" className="text-green-700 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100">Features</Link>
            <Link href="#why-choose-us" className="text-green-700 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100">Why Choose Us</Link>
            <Link href="#get-started" className="text-green-700 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100">Get Started</Link>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  Features
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth' })}>
                  Why Choose Us
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })}>
                  Get Started
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            y: backgroundY
          }}
        />
        <div className="container mx-auto px-4 py-16 relative">
          <motion.header 
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-green-800 dark:text-green-100 mb-6">
              Discover Ayurveda with Ayur-Find
            </h1>
            <p className="text-xl md:text-2xl text-green-700 dark:text-green-200 max-w-3xl mx-auto">
              Your journey to holistic wellness begins here
            </p>
          </motion.header>

          <motion.div 
            className="flex flex-col items-center justify-center gap-8 mb-16"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Link href="/auth" passHref>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Start Your Wellness Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            id="features"
            className="grid md:grid-cols-3 gap-8 mb-16"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4, duration: 0.8, staggerChildren: 0.2 }}
          >
            {[
              { icon: Search, title: "Find Experts", description: "Discover Ayurvedic practitioners near you" },
              { icon: Calendar, title: "Easy Booking", description: "Schedule consultations with a few clicks" },
              { icon: Star, title: "Verified Reviews", description: "Read authentic patient experiences" }
            ].map((feature, index) => (
              <motion.div key={index} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">{feature.title}</h3>
                    <p className="text-green-700 dark:text-green-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            id="why-choose-us"
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h2 className="text-3xl font-semibold text-green-800 dark:text-green-100 mb-8">
              Why Choose Ayur-Find?
            </h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.8, duration: 0.8, staggerChildren: 0.2 }}
            >
              {[
                { icon: Users, title: "Expert Network", description: "Access qualified Ayurvedic doctors" },
                { icon: Leaf, title: "Holistic Healing", description: "Experience natural, whole-body treatments" },
                { icon: Shield, title: "Secure Platform", description: "Your health data is protected" }
              ].map((reason, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <reason.icon className="h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">{reason.title}</h3>
                  <p className="text-green-700 dark:text-green-300">{reason.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            id="get-started"
            className="text-center"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1, duration: 0.8 }}
          >
            <h2 className="text-3xl font-semibold text-green-800 dark:text-green-100 mb-4">
              Ready to Embrace Ayurveda?
            </h2>
            <p className="text-lg text-green-700 dark:text-green-200 mb-6 max-w-2xl mx-auto">
              Join Ayur-Find today and take the first step towards a balanced, healthier you.
            </p>
            <Link href="/auth" passHref>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <footer className="bg-green-800 dark:bg-green-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Ayur-Find</h3>
              <p className="text-green-200">Connecting you with Ayurvedic wellness</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-green-300">Features</Link></li>
                <li><Link href="#why-choose-us" className="hover:text-green-300">Why Choose Us</Link></li>
                <li><Link href="#get-started" className="hover:text-green-300">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <p className="text-green-200">Email: info@ayur-find.com</p>
              <p className="text-green-200">Phone: +91 8565214563</p>
            </div>
          </div>
          <div className="mt-8 text-center text-green-200">
            <p>&copy; 2024 Ayur-Find. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}