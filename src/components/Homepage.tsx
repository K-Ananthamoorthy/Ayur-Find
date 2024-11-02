'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import MapComponent from '@/components/MapComponent'
import { Doctor } from '@/types'

interface HomePageProps {
  setCurrentPage: (page: string) => void
  doctors: Doctor[]
  setSearchQuery: (query: string) => void
}

export default function HomePage({ setCurrentPage, doctors, setSearchQuery }: HomePageProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localSearchQuery)
    setCurrentPage('doctorListing')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search doctors, locations, or specializations"
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="w-full"
          aria-label="Search for Ayurvedic doctors"
        />
        <Button type="submit" className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden">
        <MapComponent 
          center={[13.3409, 74.7421]}
          zoom={10}
          markers={doctors}
        />
      </div>

      <Button onClick={() => setCurrentPage('doctorListing')} className="w-full">
        View All Doctors
      </Button>
    </motion.div>
  )
}