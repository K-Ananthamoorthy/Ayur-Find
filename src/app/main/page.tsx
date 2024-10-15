'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Search, MapPin, Moon, Sun, Star, Calendar, User, ChevronLeft, Phone, Mail, Clock, Tag, Loader2, AlertTriangle } from 'lucide-react'
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, where } from 'firebase/firestore'
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from 'framer-motion'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})

const LoadingSpinner = () => (
  <div className="h-full flex items-center justify-center">
    <motion.div
      animate={{
        scale: [1, 2, 2, 1, 1],
        rotate: [0, 0, 270, 270, 0],
        borderRadius: ["20%", "20%", "50%", "50%", "20%"],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1
      }}
      className="w-12 h-12 bg-primary"
    />
  </div>
)

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  lat: number;
  lng: number;
  experience: number;
  tags: string[];
  about: string;
  services: string[];
  education: string;
  availability: {
    [key: string]: {
      isAvailable: boolean;
      times: string;
    };
  };
  phone: string;
  email: string;
}

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  patientName: string;
  email: string;
  phone: string;
  reason: string;
  status: 'scheduled' | 'rescheduling' | 'cancelled';
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  favoriteDoctors: string[];
}

export default function AyurvedicDoctorLocator() {
  const [currentPage, setCurrentPage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const [sortOption, setSortOption] = useState('rating')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid)
      } else {
        router.push('/auth')
      }
    })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
      },
      (error) => {
        console.error('Error getting user location:', error)
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please enable location services.",
          variant: "destructive",
        })
      }
    )

    return () => unsubscribe()
  }, [router])

  const fetchUserData = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      const userProfileDoc = await getDoc(doc(db, 'userProfiles', userId))
      if (userProfileDoc.exists()) {
        const userProfileData = userProfileDoc.data() as UserProfile
        setUserProfile({ ...userProfileData, id: userId })
      } else {
        const newUserProfile: UserProfile = {
          id: userId,
          fullName: auth.currentUser?.displayName || '',
          email: auth.currentUser?.email || '',
          phone: auth.currentUser?.phoneNumber || '',
          favoriteDoctors: []
        }
        await setDoc(doc(db, 'userProfiles', userId), newUserProfile)
        setUserProfile(newUserProfile)
      }

      const [appointmentsSnapshot, doctorsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'appointments'), where('userId', '==', userId))),
        getDocs(collection(db, 'doctors'))
      ])

      setAppointments(appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)))
      setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)))
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch user data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleFavorite = useCallback(async (doctor: Doctor) => {
    if (!userProfile) return

    try {
      const updatedFavorites = userProfile.favoriteDoctors.includes(doctor.id)
        ? userProfile.favoriteDoctors.filter(id => id !== doctor.id)
        : [...userProfile.favoriteDoctors, doctor.id]

      await updateDoc(doc(db, 'userProfiles', userProfile.id), {
        favoriteDoctors: updatedFavorites
      })

      setUserProfile(prev => prev ? {
        ...prev,
        favoriteDoctors: updatedFavorites
      } : null)

      toast({
        title: userProfile.favoriteDoctors.includes(doctor.id) ? "Removed from favorites" : "Added to favorites",
        description: `${doctor.name} has been ${userProfile.favoriteDoctors.includes(doctor.id) ? "removed from" : "added to"} your favorites.`,
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }, [userProfile])

  const addAppointment = useCallback(async (appointment: Omit<Appointment, 'id' | 'userId' | 'status'>) => {
    if (!userProfile) return

    try {
      const newAppointment = {
        ...appointment,
        userId: userProfile.id,
        status: 'scheduled' as const
      }
      const docRef = await addDoc(collection(db, 'appointments'), newAppointment)
      setAppointments(prev => [...prev, { id: docRef.id, ...newAppointment }])
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully booked.",
      })
    } catch (error) {
      console.error("Error adding appointment:", error)
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
    }
  }, [userProfile])

  const updateUserProfile = useCallback(async (newProfile: Omit<UserProfile, 'id' | 'favoriteDoctors'>) => {
    if (!userProfile) return

    try {
      await updateDoc(doc(db, 'userProfiles', userProfile.id), newProfile)
      setUserProfile(prev => prev ? { ...prev, ...newProfile } : null)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating user profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }, [userProfile])

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth)
      setUserProfile(null)
      router.push('/')
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }, [router])

  const requestReschedule = useCallback(async (appointment: Appointment) => {
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), {
        status: 'rescheduling'
      })
      setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, status: 'rescheduling' } : a))
      toast({
        title: "Reschedule Requested",
        description: "Your reschedule request has been sent to the doctor.",
      })
    } catch (error) {
      console.error("Error requesting reschedule:", error)
      toast({
        title: "Error",
        description: "Failed to request reschedule. Please try again.",
        variant: "destructive",
      })
    }
  }, [])

  const cancelAppointment = useCallback(async (appointmentId: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled'
      })
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a))
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      })
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      })
    }
  }, [])

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => 
      searchQuery === '' || 
      (doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) 
      || doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      || doctor.location.toLowerCase().includes(searchQuery.toLowerCase()))
      && (selectedTags.length === 0 || selectedTags.every(tag => doctor.tags.includes(tag)))
    ).sort((a, b) => {
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

  const renderHomePage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
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

      <div className="flex justify-center">
        <Button 
          onClick={() => {
            setSearchQuery('')
            setCurrentPage('doctorListing')
          }} 
          variant="outline"
          className="w-full sm:w-auto"
        >
          View All Doctors
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Popular Locations</h3>
            <div className="flex flex-wrap gap-2">
              {['Udupi', 'Kundapura', 'Karkala', 'Hebri'].map((location) => (
                <Button key={location} variant="outline" size="sm" onClick={() => {
                  setSearchQuery(location)
                  setCurrentPage('doctorListing')
                }}>
                  <MapPin className="mr-2 h-4 w-4" />
                  {location}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Popular Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {['Panchakarma', 'Nadi Pariksha', 'Ayurvedic Massage', 'Herbal Medicine'].map((specialization) => (
                <Button key={specialization} variant="outline" size="sm"   onClick={() => {
                  setSearchQuery(specialization)
                  setCurrentPage('doctorListing')
                }}>
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
          <Suspense fallback={<LoadingSpinner />}>
            <MapComponent 
              center={userLocation || [13.3409, 74.7421]} 
              zoom={userLocation ? 13 : 10} 
              markers={doctors}
            />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.filter(a => a.status === 'scheduled').slice(0, 3).map((appointment) => (
            <div key={appointment.id} className="mb-4 p-4 border rounded-lg">
              <p className="font-semibold">{appointment.doctorName}</p>
              <p>{appointment.date} at {appointment.time}</p>
              <p className="text-sm text-muted-foreground">{appointment.reason}</p>
            </div>
          ))}
          {appointments.filter(a => a.status === 'scheduled').length > 3 && (
            <Button variant="link" onClick={() => setCurrentPage('userProfile')}>View all appointments</Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderDoctorListing = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3  }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => setCurrentPage('home')}>
          <ChevronLeft className="mr-2 h-3 w-2" />
          Back to Home
        </Button>
        <h2 className="text-1xl font-bold">Ayurvedic Doctors</h2>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Tag className="mr-2 h-4 w-4" />
                Filter Tags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Array.from(new Set(doctors.flatMap(d => d.tags))).map(tag => (
                <DropdownMenuItem key={tag} onClick={() => setSelectedTags(prev => 
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )}>
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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
                      <Star className={`h-5 w-5 ${userProfile?.favoriteDoctors.includes(doctor.id) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    </Button>
                  </CardTitle>
                  <CardDescription>{doctor.specialization}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{doctor.rating}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doctor.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <Button className="w-full" onClick={() => {
                    setSelectedDoctor(doctor)
                    setCurrentPage('doctorProfile')
                  }}>
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )

  const renderDoctorProfile = () => (
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
              <CardTitle className="flex justify-between items-center">
                <span>{selectedDoctor?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectedDoctor && toggleFavorite(selectedDoctor)}
                >
                  {selectedDoctor && (
                    <Star className={`h-5 w-5 ${userProfile?.favoriteDoctors.includes(selectedDoctor.id) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
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
                  <span>{selectedDoctor?.experience} + years of experience</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Availability</h3>
                  {selectedDoctor?.availability && Object.entries(selectedDoctor.availability).map(([day, { isAvailable, times }]) => (
                    <div key={day} className="flex justify-between">
                      <span>{day}</span>
                      <span>{isAvailable ? times : 'Not available'}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{selectedDoctor?.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{selectedDoctor?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>About {selectedDoctor?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{selectedDoctor?.about}</p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Education</h3>
                <p>{selectedDoctor?.education}</p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor?.tags.map(tag => (
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
                {selectedDoctor?.services.map(service => (
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
              {selectedDoctor && (
                <Suspense fallback={<LoadingSpinner />}>
                  <MapComponent 
                    center={[selectedDoctor.lat, selectedDoctor.lng]} 
                    zoom={14} 
                    markers={[selectedDoctor]} 
                  />
                </Suspense>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )

  const renderAppointmentBooking = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto space-y-8"
    >
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
            const appointment: Omit<Appointment, 'id' | 'userId' | 'status'> = {
              doctorId: selectedDoctor?.id || '',
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
              <Input id="name" name="name" placeholder="Enter your full name" required defaultValue={userProfile?.fullName} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Enter your email" required defaultValue={userProfile?.email} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="Enter your phone number" required defaultValue={userProfile?.phone} />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea id="reason" name="reason" placeholder="Briefly describe your reason for the appointment" required />
            </div>
            <Button type="submit" className="w-full">Confirm Booking</Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderUserProfile = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => setCurrentPage('home')}>
        <ChevronLeft className="mr-2 h-3 w-2" />
        Back to Home
      </Button>
      <h2 className="text-2xl font-bold">User Profile</h2>
      <Tabs defaultValue="personal-info" className="w-full">
      <TabsList className="flex flex-wrap w-full">
          <TabsTrigger value="personal-info">User Info</TabsTrigger>
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
                  phone: formData.get('phone') as string,
                }
                updateUserProfile(newProfile)
              }}>
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" name="fullName" defaultValue={userProfile?.fullName} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={userProfile?.email} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={userProfile?.phone} />
                </div>
                <Button type="submit">Update Profile</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Your Appointments</CardTitle>
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
                      <p className="mb-2">Status: {appointment.status}</p>
                      <div className="flex flex-wrap gap-2">
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button variant="outline" onClick={() => {
                              setSelectedAppointment(appointment)
                              setIsRescheduling(true)
                            }}>
                              Request Reschedule
                            </Button>
                            <Button variant="destructive" onClick={() => cancelAppointment(appointment.id)}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {appointment.status === 'rescheduling' && (
                          <Badge variant="secondary">Reschedule Requested</Badge>
                        )}
                        {appointment.status === 'cancelled' && (
                          <Badge variant="destructive">Cancelled</Badge>
                        )}
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
                {doctors.filter(doctor => userProfile?.favoriteDoctors.includes(doctor.id)).map((doctor) => (
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
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const renderFooter = () => (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Ayur-Find. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <a href="#" className="text-sm hover:underline">Privacy Policy</a>
          <a href="#" className="text-sm hover:underline">Terms of Service</a>
          <a href="#" className="text-sm hover:underline">Contact Us</a>
        </div>
      </div>
    </footer>
  )

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 transition-colors duration-200 min-h-screen flex flex-col">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <motion.h1 
          className="text-5xl sm:text-5xl font-bold cursor-pointer"
          onClick={() => setCurrentPage('home')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Ayur-Find
        </motion.h1>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <User className="mr-2 h-4 w-4" />
                {userProfile?.fullName || 'Profile'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCurrentPage('userProfile')}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && renderHomePage()}
          {currentPage === 'doctorListing' && renderDoctorListing()}
          {currentPage === 'doctorProfile' && renderDoctorProfile()}
          {currentPage === 'appointmentBooking' && renderAppointmentBooking()}
          {currentPage === 'userProfile' && renderUserProfile()}
        </AnimatePresence>
      </main>

      {renderFooter()}

      <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Appointment Reschedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to request a reschedule for your appointment with {selectedAppointment?.doctorName} on {selectedAppointment?.date} at {selectedAppointment?.time}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsRescheduling(false)}>Cancel</Button>
            <Button onClick={() => {
              if (selectedAppointment) {
                requestReschedule(selectedAppointment)
                setIsRescheduling(false)
              }
            }}>Confirm Reschedule Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}