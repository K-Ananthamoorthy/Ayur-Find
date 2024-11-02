'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChevronLeft, MapPin, Star, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Doctor } from '@/types'

interface DoctorListingProps {
  doctors: Doctor[]
  setSelectedDoctor: (doctor: Doctor) => void
  setCurrentPage: (page: string) => void
  initialSearchQuery: string
}

export default function DoctorListing({ doctors, setSelectedDoctor, setCurrentPage, initialSearchQuery }: DoctorListingProps) {
  const [sortOption, setSortOption] = useState('rating')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)

  useEffect(() => {
    setSearchQuery(initialSearchQuery)
  }, [initialSearchQuery])

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = searchQuery === '' ||
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => doctor.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    }).sort((a, b) => {
      switch (sortOption) {
        case 'rating':
          return b.rating - a.rating
        case 'experience':
          return b.experience - a.experience
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [doctors, searchQuery, selectedTags, sortOption])

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => setCurrentPage('home')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Map
        </Button>
        <h2 className="text-xl font-bold">Ayurvedic Doctors</h2>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input 
          type="text" 
          placeholder="Search doctors, specializations, or locations" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="w-full sm:w-auto"
        />
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from(new Set(doctors.flatMap(d => d.tags))).map(tag => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "secondary"}
            onClick={() => handleTagToggle(tag)}
            className="cursor-pointer"
          >
            {tag}
            {selectedTags.includes(tag) && (
              <span className="ml-1 text-sm text-red-500">×</span>
            )}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setSelectedDoctor(doctor)
                setCurrentPage('doctorProfile')
              }}>
                <CardHeader>
                  <CardTitle>{doctor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{doctor.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm">{doctor.rating}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    <span className="text-sm">{doctor.experience} years experience</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doctor.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}