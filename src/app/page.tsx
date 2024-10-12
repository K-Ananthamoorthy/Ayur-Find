"use client"

import { useState, useEffect, SetStateAction } from 'react'
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
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: number; name: string; specialization: string; location: string; rating: number; } | null>(null)
  const [doctors, setDoctors] = useState<{ id: number; name: string; specialization: string; location: string; rating: number; }[]>([])
  const [favorites, setFavorites] = useState<{ id: number; name: string; specialization: string; location: string; rating: number; }[]>([])
  const [appointments, setAppointments] = useState<{ id: number; doctorName: string; date: FormDataEntryValue | null; time: FormDataEntryValue | null; patientName: FormDataEntryValue | null; email: FormDataEntryValue | null; phone: FormDataEntryValue | null; reason: FormDataEntryValue | null }[]>([])
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: '',
    phone: ''
  })
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const storedDoctors = localStorage.getItem('doctors')
    const storedFavorites = localStorage.getItem('favorites')
    const storedAppointments = localStorage.getItem('appointments')
    const storedUserProfile = localStorage.getItem('userProfile')

    if (storedDoctors) setDoctors(JSON.parse(storedDoctors))
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites))
    if (storedAppointments) setAppointments(JSON.parse(storedAppointments))
    if (storedUserProfile) setUserProfile(JSON.parse(storedUserProfile))
    if (!storedDoctors) {
      const initialDoctors = [
      { id: 1, name: "Dr. Ayush Sharma", specialization: "Panchakarma", location: "Udupi Taluk", rating: 4.8 },
      { id: 2, name: "Dr. Deepa Nair", specialization: "Nadi Pariksha", location: "Kundapura", rating: 4.5 },
      { id: 3, name: "Dr. Rajesh Kumar", specialization: "Ayurvedic Massage", location: "Karkala", rating: 4.7 },
      { id: 4, name: "Dr. Sneha Rao", specialization: "Herbal Medicine", location: "Hebri", rating: 4.6 },
      { id: 5, name: "Dr. Anand Joshi", specialization: "Panchakarma", location: "Udupi Taluk", rating: 4.9 },
      { id: 6, name: "Dr. Priya Menon", specialization: "Nadi Pariksha", location: "Kundapura", rating: 4.3 },
      { id: 7, name: "Dr. Ravi Iyer", specialization: "Ayurvedic Massage", location: "Karkala", rating: 4.4 },
      { id: 8, name: "Dr. Shreya Singh", specialization: "Herbal Medicine", location: "Hebri", rating: 4.7 },
      { id: 9, name: "Dr. Ayush Sharma", specialization: "Panchakarma", location: "Udupi Taluk", rating: 4.8 },
      { id: 10, name: "Dr. Deepa Nair", specialization: "Nadi Pariksha", location: "Kundapura", rating: 4.5 },
      { id: 11, name: "Dr. Rajesh Kumar", specialization: "Ayurvedic Massage", location: "Karkala", rating: 4.7 },
      { id: 12, name: "Dr. Sneha Rao", specialization: "Herbal Medicine", location: "Hebri", rating: 4.6 },
      { id: 13, name: "Dr. Anand Joshi", specialization: "Panchakarma", location: "Udupi Taluk", rating: 4.9 },
      { id: 14, name: "Dr. Priya Menon", specialization: "Nadi Pariksha", location: "Kundapura", rating: 4.3 },
      { id: 15, name: "Dr. Ravi Iyer", specialization: "Ayurvedic Massage", location: "Karkala", rating: 4.4 },
      { id: 16, name: "Dr. Shreya Singh", specialization: "Herbal Medicine", location: "Hebri", rating: 4.7 },
      ]
      setDoctors(initialDoctors)
      localStorage.setItem('doctors', JSON.stringify(initialDoctors))
    }

    // Apply the theme
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    if (theme) {
      root.classList.add(theme)
    }
  }, [theme])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('favorites', JSON.stringify(favorites))
      localStorage.setItem('appointments', JSON.stringify(appointments))
      localStorage.setItem('userProfile', JSON.stringify(userProfile))
    }
  }, [favorites, appointments, userProfile, mounted])

  const popularLocations = ['Udupi Taluk', 'Kundapura', 'Karkala', 'Hebri']
  const popularSpecializations = ['Panchakarma', 'Nadi Pariksha', 'Ayurvedic Massage', 'Herbal Medicine']

  if (!mounted) {
    return null
  }

  const toggleFavorite = (doctor: { id: any; name?: string; specialization?: string; location?: string; rating?: number } | null) => {
    if (!doctor) return;
    setFavorites(prevFavorites => 
      prevFavorites.some(fav => fav.id === doctor.id)
        ? prevFavorites.filter(fav => fav.id !== doctor.id)
        : [...prevFavorites, { id: doctor.id, name: doctor.name!, specialization: doctor.specialization!, location: doctor.location!, rating: doctor.rating! }]
    )
  }

  const addAppointment = (appointment: { id: number; doctorName: any; date: FormDataEntryValue | null; time: FormDataEntryValue | null; patientName: FormDataEntryValue | null; email: FormDataEntryValue | null; phone: FormDataEntryValue | null; reason: FormDataEntryValue | null }) => {
    setAppointments(prevAppointments => [...prevAppointments, appointment])
  }

  const updateUserProfile = (newProfile: SetStateAction<{ fullName: string; email: string; phone: string }>) => {
    setUserProfile(newProfile)
  }

  const renderHomePage = () => (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Input
          type="text"
          placeholder="Search by doctor name, location, or specialization"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:flex-grow"
          aria-label="Search for Ayurvedic doctors"
        />
        <Button onClick={() => setCurrentPage('doctorListing')} className="w-full sm:w-auto">
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
          <Card key={doctor.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{doctor.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(doctor)
                  }}
                >
                  <Star className={`h-5 w-5 ${favorites.some(fav => fav.id === doctor.id) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                </Button>
              </CardTitle>
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
              <Button className="w-full mt-4" onClick={() => {
                setSelectedDoctor(doctor)
                setCurrentPage('doctorProfile')
              }}>
                View Profile
              </Button>
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
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{selectedDoctor?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(selectedDoctor)}
                >
                  {selectedDoctor && (
                    <Star className={`h-5 w-5 ${favorites.some(fav => fav.id === selectedDoctor.id) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                  )}
                </Button>
              </CardTitle>
              {selectedDoctor && <CardDescription>{selectedDoctor.specialization}</CardDescription>}
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
        <div className="lg:w-1/3 space-y-6">
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
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const appointment = {
              id: Date.now(),
              doctorName: selectedDoctor?.name || '',
              date: formData.get('date'),
              time: formData.get('time'),
              patientName: formData.get('name'),
              email: formData.get('email'),
              phone: formData.get('phone'),
              reason: formData.get('reason')
            }
            addAppointment(appointment)
            setCurrentPage('userProfile')
          }}>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Select name="time" required>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select a time  slot" />
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
              <Input id="name" name="name" placeholder="Enter your full name" required defaultValue={userProfile.fullName} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Enter your email" required defaultValue={userProfile.email} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="Enter your phone number" required defaultValue={userProfile.phone} />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea id="reason" name="reason" placeholder="Briefly describe your reason for the appointment" required />
            </div>
            <Button type="submit" className="w-full">Confirm Booking</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  const renderUserProfile = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold">User Profile</h2>
      <Tabs defaultValue="personal-info" className="w-full">
        <TabsList className="flex flex-wrap w-full">
          <TabsTrigger value="personal-info">user info</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="favorite-doctors">Favorite Doctors</TabsTrigger>
        </TabsList>
        <TabsContent value="personal-info">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const newProfile = {
                  fullName: formData.get('fullName') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string
                }
                updateUserProfile(newProfile)
              }}>
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" name="fullName" defaultValue={userProfile.fullName} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={userProfile.email} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={userProfile.phone} />
                </div>
                <Button type="submit">Update Profile</Button>
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
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <CardTitle>{appointment.doctorName}</CardTitle>
                      <CardDescription>{String(appointment.date)}, {String(appointment.time)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">Reason: {String(appointment.reason)}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline">Reschedule</Button>
                        <Button variant="destructive" onClick={() => setAppointments(appointments.filter(a => a.id !== appointment.id))}>
                          Cancel
                        </Button>
                      </div>
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
                {favorites.map((doctor) => (
                  <Card key={doctor.id}>
                    <CardHeader>
                      <CardTitle>{doctor.name}</CardTitle>
                      <CardDescription>{doctor.specialization}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
    <div className="container mx-auto px-4 sm:px-6 py-8 transition-colors duration-200 min-h-screen bg-background text-foreground">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold cursor-pointer text-primary" onClick={() => setCurrentPage('home')}>Ayurvedic Doctor Locator</h1>
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