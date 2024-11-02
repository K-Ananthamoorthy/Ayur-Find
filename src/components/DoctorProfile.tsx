import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, MapPin, Star, Clock, Phone, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import MapComponent from '@/components/MapComponent'
import { Doctor } from '@/types'

interface DoctorProfileProps {
  doctor: Doctor
  setCurrentPage: (page: string) => void
}

export default function DoctorProfile({ doctor, setCurrentPage }: DoctorProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <Button variant="ghost" onClick={() => setCurrentPage('doctorListing')}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Listings
      </Button>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{doctor.name}</CardTitle>
              <CardDescription>{doctor.specialization}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{doctor.location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span>{doctor.rating} (50 reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{doctor.experience} + years of experience</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Availability</h3>
                  {Object.entries(doctor.availability).map(([day, { isAvailable, times }]) => (
                    <div key={day} className="flex justify-between">
                      <span>{day}</span>
                      <span>{isAvailable ? times : 'Not available'}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{doctor.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>About {doctor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{doctor.about}</p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Education</h3>
                <p>{doctor.education}</p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.tags.map(tag => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {doctor.services.map(service => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Book an Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setCurrentPage('appointmentBooking')}>Book Now</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0" style={{ height: '200px' }}>
              <MapComponent 
                center={[doctor.lat, doctor.lng]} 
                zoom={14} 
                markers={[doctor]} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}