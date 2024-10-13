'use client'

import { useState, useEffect } from 'react'
import { motion, useViewportScroll, useTransform, useSpring } from 'framer-motion'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Leaf, Search, Calendar, Star, ArrowRight, Users, Shield } from 'lucide-react'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useViewportScroll()
  const yRange = useSpring(useTransform(scrollYProgress, [0, 1], [0, 100]), { stiffness: 100, damping: 20 })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900 dark:via-green-800 dark:to-green-700 overflow-hidden">
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0) 70%)",
          transform: yRange.get() ? `translate3d(0, ${yRange.get()}px, 0)` : 'none'
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
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-green-800 dark:text-green-100 mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          >
            Discover Ayurveda with Ayur-Find
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-green-700 dark:text-green-200 max-w-3xl mx-auto"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          >
            Your journey to holistic wellness begins here
          </motion.p>
        </motion.header>

        <motion.div 
          className="flex flex-col items-center justify-center gap-8 mb-16"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <motion.div 
            className="w-64 h-64 rounded-full bg-gradient-to-r from-green-300 to-green-500 dark:from-green-600 dark:to-green-400"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 360],
              borderRadius: ["50%", "40%", "50%"]
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          />
          <Link href="/auth" passHref>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              Start Your Wellness Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>

        <motion.div 
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
            <motion.div 
              key={index}
              className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <feature.icon className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">{feature.title}</h3>
              <p className="text-green-700 dark:text-green-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <reason.icon className="h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">{reason.title}</h3>
                <p className="text-green-700 dark:text-green-300">{reason.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div 
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
    </div>
  )
}