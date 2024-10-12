"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
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
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
})

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  lat: number;
  lng: number;
}

interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  patientName: string;
  email: string;
  phone: string;
  reason: string;
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export default function AyurvedicDoctorLocator() {
  const [currentPage, setCurrentPage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [favorites, setFavorites] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    fullName: '',
    email: '',
    phone: ''
  })
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    const doctorsSnapshot = await getDocs(collection(db, 'doctors'))
    const doctorsData = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor))
    setDoctors(doctorsData)

    const favoritesSnapshot = await getDocs(collection(db, 'favorites'))
    const favoritesData = favoritesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor))
    setFavorites(favoritesData)

    const appointmentsSnapshot = await getDocs(collection(db, 'appointments'))
    const appointmentsData = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
    setAppointments(appointmentsData)

    const userProfileSnapshot = await getDocs(collection(db, 'userProfiles'))
    if (!userProfileSnapshot.empty) {
      const userProfileData = userProfileSnapshot.docs[0].data() as UserProfile
      setUserProfile({ ...userProfileData, id: userProfileSnapshot.docs[0].id })
    }
  }

  const toggleFavorite = async (doctor: Doctor) => {
    const isFavorite = favorites.some(fav => fav.id === doctor.id)
    if (isFavorite) {
      await deleteDoc(doc(db, 'favorites', doctor.id))
      setFavorites(favorites.filter(fav => fav.id !== doctor.id))
    } else {
      const docRef = await addDoc(collection(db, 'favorites'), doctor)
      setFavorites([...favorites, { ...doctor, id: docRef.id }])
    }
  }

  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    const docRef = await addDoc(collection(db, 'appointments'), appointment)
    setAppointments([...appointments, { id: docRef.id, ...appointment }])
  }

  const updateUserProfile = async (newProfile: Omit<UserProfile, 'id'>) => {
    if (userProfile.id) {
      await updateDoc(doc(db, 'userProfiles', userProfile.id), newProfile)
      setUserProfile({ ...newProfile, id: userProfile.id })
    } else {
      const docRef = await addDoc(collection(db, 'userProfiles'), newProfile)
      setUserProfile({ id: docRef.id, ...newProfile })
    }
  }

  const popularLocations = ['Udupi Taluk', 'Kundapura', 'Karkala', 'Hebri']
  const popularSpecializations = ['Panchakarma', 'Nadi Pariksha', 'Ayurvedic Massage', 'Herbal Medicine']

  if (!mounted) {
    return null
  }

  const renderHomePage = () => (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Input
          type="text"
          placeholder="Search doctors, locations, or specializations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
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

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Ayurvedic Doctors Near You</CardTitle>
        </CardHeader>
        <CardContent className="p-0" style={{ height: '400px' }}>
          <MapComponent center={[13.3409, 74.7421]} zoom={10} markers={doctors} />
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="w-full lg:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{selectedDoctor?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectedDoctor && toggleFavorite(selectedDoctor)}
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
          <Card>
            <CardHeader>
              <CardTitle>About {selectedDoctor?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Dr. {selectedDoctor?.name.split(' ')[1]} is a highly experienced Ayurvedic practitioner specializing in {selectedDoctor?.specialization}. With over 15 years of experience, they have helped numerous patients achieve holistic wellness through traditional Ayurvedic treatments and modern techniques.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>Ayurvedic Consultation</li>
                <li>{selectedDoctor?.specialization}</li>
                <li>Herbal Medicine</li>
                <li>Dietary Counseling</li>
                <li>Yoga and Meditation Guidance</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3  space-y-6">
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
              {selectedDoctor && (
                <MapComponent 
                  center={[selectedDoctor.lat, selectedDoctor.lng]} 
                  zoom={14} 
                  markers={[selectedDoctor]} 
                />
              )}
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
            const appointment: Omit<Appointment, 'id'> = {
              doctorName: selectedDoctor?.name || '',
              date: formData.get('date') as string,
              time: formData.get('time') as string,
              patientName: formData.get('name') as string,
              email: formData.get('email') as string,
              phone: formData.get('phone') as string,
              reason: formData.get('reason') as string
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
                      <CardDescription>{appointment.date}, {appointment.time}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">Reason: {appointment.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline">Reschedule</Button>
                        <Button variant="destructive" onClick={async () => {
                          await deleteDoc(doc(db, 'appointments', appointment.id))
                          setAppointments(appointments.filter(a => a.id !== appointment.id))
                        }}>
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
    <div className="container mx-auto px-4 sm:px-6 py-8 transition-colors duration-200 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold cursor-pointer" onClick={() => setCurrentPage('home')}>Ayurvedic Doctor Locator</h1>
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