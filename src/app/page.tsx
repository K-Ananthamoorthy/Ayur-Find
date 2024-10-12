"use client"

import { useState, useEffect } from 'react'
import { Search, MapPin, Moon, Sun, Star, Calendar, User, ChevronLeft, Phone, Mail, Clock } from 'lucide-react'
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AyurvedicDoctorLocator() {
  const [currentPage, setCurrentPage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: number; name: string; specialization: string; location: string; rating: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const popularLocations = ['Udupi Taluk', 'Kundapura', 'Karkala', 'Hebri']
  const popularSpecializations = ['Panchakarma', 'Nadi Pariksha', 'Ayurvedic Massage', 'Herbal Medicine']

  const doctors = [
    { id: 1, name: "Dr. Ayush Sharma", specialization: "Panchakarma", location: "Udupi Taluk", rating: 4.8 },
    { id: 2, name: "Dr. Deepa Nair", specialization: "Nadi Pariksha", location: "Kundapura", rating: 4.5 },
    { id: 3, name: "Dr. Rajesh Kumar", specialization: "Ayurvedic Massage", location: "Karkala", rating: 4.7 },
  ]

  if (!mounted) {
    return null
  }

  const renderHomePage = () => (
    <div className="space-y-8">
      <div className="flex items-center mb-6">
        <Input
          type="text"
          placeholder="Search by doctor name, location, or specialization"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow mr-2"
          aria-label="Search for Ayurvedic doctors"
        />
        <Button onClick={() => setCurrentPage('doctorListing')}>
          <Search className="mr-2" />
          Search
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Popular Locations</h3>
            <div className="flex flex-wrap gap-2">
              {popularLocations.map((location) => (
                <Button key={location} variant="outline" size="sm" onClick={() => setCurrentPage('doctorListing')}>
                  <MapPin className="mr-2 h-4 w-4" />
                  {location}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Popular Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {popularSpecializations.map((specialization) => (
                <Button key={specialization} variant="outline" size="sm" onClick={() => setCurrentPage('doctorListing')}>
                  {specialization}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card className="w-full aspect-video">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-lg font-medium">Interactive Map</p>
            <p className="text-sm text-muted-foreground">
              (Map integration would be implemented here)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDoctorListing = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ayurvedic Doctors</h2>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="distance">Nearest</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
            setSelectedDoctor(doctor)
            setCurrentPage('doctorProfile')
          }}>
            <CardHeader>
              <CardTitle>{doctor.name}</CardTitle>
              <CardDescription>{doctor.specialization}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{doctor.location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{doctor.rating}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderDoctorProfile = () => (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => setCurrentPage('doctorListing')}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Listings
      </Button>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedDoctor?.name}</CardTitle>
              <CardDescription>{selectedDoctor?.specialization}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{selectedDoctor?.location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span>{selectedDoctor?.rating} (50 reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Mon-Fri: 9AM-5PM, Sat: 9AM-1PM</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>+91 1234567890</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{selectedDoctor?.name.toLowerCase().replace(' ', '.')}@example.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {selectedDoctor && (
            <Card>
              <CardHeader>
                <CardTitle>About {selectedDoctor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Dr. {selectedDoctor.name.split(' ')[1]} is a highly experienced Ayurvedic practitioner specializing in {selectedDoctor.specialization}. With over 15 years of experience, they have helped numerous patients achieve holistic wellness through traditional Ayurvedic treatments and modern techniques.</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>Ayurvedic Consultation</li>
                {selectedDoctor && <li>{selectedDoctor.specialization}</li>}
                <li>Herbal Medicine</li>
                <li>Dietary Counseling</li>
                <li>Yoga and Meditation Guidance</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="md:w-1/3 space-y-6">
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
            <CardContent>
              <div className="aspect-video bg-muted flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground" />
                <span className="sr-only">Map showing doctor's location</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderAppointmentBooking = () => (
    <div className="max-w-md mx-auto space-y-8">
      <Button variant="ghost" onClick={() => setCurrentPage('doctorProfile')}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Doctor Profile
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Book an Appointment with {selectedDoctor?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Select>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">09:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="Enter your phone number" />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea id="reason" placeholder="Briefly describe your reason for the appointment" />
            </div>
            <Button className="w-full">Confirm Booking</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  const renderUserProfile = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold">User Profile</h2>
      <Tabs defaultValue="personal-info">
        <TabsList>
          <TabsTrigger value="personal-info">Personal Information</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="favorite-doctors">Favorite Doctors</TabsTrigger>
        </TabsList>
        <TabsContent value="personal-info">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" defaultValue="John Doe" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+91 9876543210" />
                </div>
                <Button>Update Profile</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>Appointment with Dr. Ayush Sharma</CardTitle>
                      <CardDescription>15th August 2023, 10:00 AM</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Reason: General Consultation</p>
                      <Button variant="outline" className="mt-2">Reschedule</Button>
                      <Button variant="destructive" className="mt-2 ml-2">Cancel</Button>
                    </CardContent>
                  
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="favorite-doctors">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <Card key={doctor.id}>
                    <CardHeader>
                      <CardTitle>{doctor.name}</CardTitle>
                      <CardDescription>{doctor.specialization}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{doctor.location}</span>
                        </div>
                        <Button variant="outline" onClick={() => {
                          setSelectedDoctor(doctor)
                          setCurrentPage('doctorProfile')
                        }}>View Profile</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 transition-colors duration-200 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold cursor-pointer" onClick={() => setCurrentPage('home')}>Ayurvedic Doctor Locator</h1>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setCurrentPage('userProfile')}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <main>
        {currentPage === 'home' && renderHomePage()}
        {currentPage === 'doctorListing' && renderDoctorListing()}
        {currentPage === 'doctorProfile' && renderDoctorProfile()}
        {currentPage === 'appointmentBooking' && renderAppointmentBooking()}
        {currentPage === 'userProfile' && renderUserProfile()}
      </main>
    </div>
  )
}