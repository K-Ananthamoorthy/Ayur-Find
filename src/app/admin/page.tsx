'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from 'xlsx'
import { Upload, Moon, Sun, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  location: string
  rating: number
  lat: number
  lng: number
  experience: number
  tags: string[]
  about: string
  services: string[]
  education: string
  availability: {
    [key: string]: {
      isAvailable: boolean
      times: string
    }
  }
}

interface Appointment {
  id: string
  doctorName: string
  date: string
  time: string
  patientName: string
  email: string
  phone: string
  reason: string
}

interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string
  favoriteDoctors: string[]
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [newDoctor, setNewDoctor] = useState<Omit<Doctor, 'id'>>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    location: '',
    rating: 0,
    lat: 0,
    lng: 0,
    experience: 0,
    tags: [],
    about: '',
    services: [],
    education: '',
    availability: {
      Monday: { isAvailable: false, times: '' },
      Tuesday: { isAvailable: false, times: '' },
      Wednesday: { isAvailable: false, times: '' },
      Thursday: { isAvailable: false, times: '' },
      Friday: { isAvailable: false, times: '' },
      Saturday: { isAvailable: false, times: '' },
      Sunday: { isAvailable: false, times: '' },
    }
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      if (user && user.email === 'ayurvedicheal@gmail.com') {
        fetchData()
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [doctorsSnapshot, appointmentsSnapshot, userProfilesSnapshot] = await Promise.all([
        getDocs(collection(db, 'doctors')),
        getDocs(collection(db, 'appointments')),
        getDocs(collection(db, 'userProfiles'))
      ])

      setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)))
      setAppointments(appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)))
      setUserProfiles(userProfilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)))
    } catch (err) {
      setError('Failed to fetch data. Please try again.')
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setError('Failed to log in. Please check your credentials.')
      console.error("Login error:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await addDoc(collection(db, 'doctors'), newDoctor)
      setNewDoctor({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        location: '',
        rating: 0,
        lat: 0,
        lng: 0,
        experience: 0,
        tags: [],
        about: '',
        services: [],
        education: '',
        availability: {
          Monday: { isAvailable: false, times: '' },
          Tuesday: { isAvailable: false, times: '' },
          Wednesday: { isAvailable: false, times: '' },
          Thursday: { isAvailable: false, times: '' },
          Friday: { isAvailable: false, times: '' },
          Saturday: { isAvailable: false, times: '' },
          Sunday: { isAvailable: false, times: '' },
        }
      })
      await fetchData()
    } catch (err) {
      setError('Failed to add doctor. Please try again.')
      console.error("Error adding doctor:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDoctor) return
    setLoading(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'doctors', editingDoctor.id), { ...editingDoctor })
      setEditingDoctor(null)
      await fetchData()
    } catch (err) {
      setError('Failed to update doctor. Please try again.')
      console.error("Error updating doctor:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDoctor = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'doctors', id))
      await fetchData()
    } catch (err) {
      setError('Failed to delete doctor. Please try again.')
      console.error("Error deleting doctor:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAppointment) return
    setLoading(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'appointments', editingAppointment.id), { ...editingAppointment })
      setEditingAppointment(null)
      await fetchData()
    } catch (err) {
      setError('Failed to update appointment. Please try again.')
      console.error("Error updating appointment:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'appointments', id))
      await fetchData()
    } catch (err) {
      setError('Failed to delete appointment. Please try again.')
      console.error("Error deleting appointment:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setLoading(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'userProfiles', editingUser.id), { ...editingUser })
      setEditingUser(null)
      await fetchData()
    } catch (err) {
      setError('Failed to update user profile. Please try again.')
      console.error("Error updating user profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUserProfile = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'userProfiles', id))
      await fetchData()
    } catch (err) {
      setError('Failed to delete user profile. Please try again.')
      console.error("Error deleting user profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length > 0) {
        const firstRow = jsonData[0] as any
        setNewDoctor({
          name: firstRow.Name || '',
          email: firstRow.Email || '',
          phone: firstRow.Phone || '',
          specialization: firstRow.Specialization || '',
          location: firstRow.Location || '',
          rating: parseFloat(firstRow.Rating) || 0,
          lat: parseFloat(firstRow.Latitude) || 0,
          lng: parseFloat(firstRow.Longitude) || 0,
          experience: parseInt(firstRow.Experience) || 0,
          tags: (firstRow.Tags || '').split(',').map((tag: string) => tag.trim()),
          about: firstRow.About || '',
          services: (firstRow.Services || '').split(',').map((service: string) => service.trim()),
          education: firstRow.Education || '',
          availability: {
            Monday: { isAvailable: false, times: '' },
            Tuesday: { isAvailable: false, times: '' },
            Wednesday: { isAvailable: false, times: '' },
            Thursday: { isAvailable: false, times: '' },
            Friday: { isAvailable: false, times: '' },
            Saturday: { isAvailable: false, times: '' },
            Sunday: { isAvailable: false, times: '' },
          }
        })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const recentAppointments = useMemo(() => {
    return appointments.slice(0, 5)
  }, [appointments])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
  }

  if (user && user.email === 'ayurvedicheal@gmail.com') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              />
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </div>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">Total Doctors</h3>
                    <p className="text-3xl font-bold">{doctors.length}</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">Total Appointments</h3>
                    <p className="text-3xl font-bold">{appointments.length}</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">Total Users</h3>
                    <p className="text-3xl font-bold">{userProfiles.length}</p>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="font-semibold mb-2">Recent Appointments</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.doctorName}</TableCell>
                          <TableCell>{appointment.patientName}</TableCell>
                          <TableCell>{appointment.date}</TableCell>
                          <TableCell>{appointment.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <CardTitle>Manage Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" /> Add Doctor</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] w-11/12 max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Add New Doctor</DialogTitle>
                        <DialogDescription>
                          Enter the details of the new doctor here. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                        <form onSubmit={handleAddDoctor} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={newDoctor.name}
                                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={newDoctor.email}
                                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                                required
                              />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={newDoctor.phone}
                                onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                                required
                              />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="specialization">Specialization</Label>
                              <Input
                                id="specialization"
                                value={newDoctor.specialization}
                                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                                required
                              />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={newDoctor.location}
                                onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
                                required
                              />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="rating">Rating</Label>
                              <Input
                                id="rating"
                                type="number"
                                value={newDoctor.rating}
                                onChange={(e) => setNewDoctor({ ...newDoctor, rating: parseFloat(e.target.value) })}
                                required
                              />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="lat">Latitude</Label>
                              <Input
                                id="lat"
                                type="number"
                                value={newDoctor.lat}
                                onChange={(e) => setNewDoctor({ ...newDoctor, lat: parseFloat(e.target.value) })}
                                required
                              />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="lng">Longitude</Label>
                              <Input
                                id="lng"
                                type="number"
                                value={newDoctor.lng}
                                onChange={(e) => setNewDoctor({ ...newDoctor, lng: parseFloat(e.target.value) })}
                                required
                              />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="experience">Experience (years)</Label>
                              <Input
                                id="experience"
                                type="number"
                                value={newDoctor.experience}
                                onChange={(e) => setNewDoctor({ ...newDoctor, experience: parseInt(e.target.value) })}
                                required
                              />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                              <Label htmlFor="tags">Tags (comma-separated)</Label>
                              <Input
                                id="tags"
                                value={newDoctor.tags.join(', ')}
                                onChange={(e) => setNewDoctor({ ...newDoctor, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="about">About</Label>
                            <Textarea
                              id="about"
                              value={newDoctor.about}
                              onChange={(e) => setNewDoctor({ ...newDoctor, about: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="services">Services (comma-separated)</Label>
                            <Input
                              id="services"
                              value={newDoctor.services.join(', ')}
                              onChange={(e) => setNewDoctor({ ...newDoctor, services: e.target.value.split(',').map(service => service.trim()) })}
                              required
                            />
                          </div>
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="education">Education</Label>
                            <Input
                              id="education"
                              value={newDoctor.education}
                              onChange={(e) => setNewDoctor({ ...newDoctor, education: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid w-full items-center gap-1.5">
                            <Label>Availability</Label>
                            {Object.entries(newDoctor.availability).map(([day, { isAvailable, times }]) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`availability-${day}`}
                                  checked={isAvailable}
                                  onCheckedChange={(checked) =>
                                    setNewDoctor({
                                      ...newDoctor,
                                      availability: {
                                        ...newDoctor.availability,
                                        [day]: { ...newDoctor.availability[day], isAvailable: checked as boolean }
                                      }
                                    })
                                  }
                                />
                                <Label htmlFor={`availability-${day}`} className="w-20">{day}</Label>
                                <Input
                                  placeholder="e.g., 9:00 AM - 5:00 PM"
                                  value={times}
                                  onChange={(e) =>
                                    setNewDoctor({
                                      ...newDoctor,
                                      availability: {
                                        ...newDoctor.availability,
                                        [day]: { ...newDoctor.availability[day], times: e.target.value }
                                      }
                                    })
                                  }
                                  disabled={!isAvailable}
                                  className="flex-grow"
                                />
                              </div>
                            ))}
                          </div>
                          <Button type="submit">Add Doctor</Button>
                        </form>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <div>
                    <Input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" id="excel-upload" />
                    <Label htmlFor="excel-upload" className="cursor-pointer">
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Excel
                      </Button>
                    </Label>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>{doctor.name}</TableCell>
                          <TableCell>{doctor.email}</TableCell>
                          <TableCell>{doctor.phone}</TableCell>
                          <TableCell>{doctor.specialization}</TableCell>
                          <TableCell>{doctor.location}</TableCell>
                          <TableCell>{doctor.rating}</TableCell>
                          <TableCell>{doctor.experience} years</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">Edit</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] w-11/12 max-h-[90vh]">
                                  <DialogHeader>
                                    <DialogTitle>Edit Doctor</DialogTitle>
                                    <DialogDescription>
                                      Make changes to the doctor's information here. Click save when you're done.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                                    <form onSubmit={handleUpdateDoctor} className="space-y-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-name">Name</Label>
                                          <Input
                                            id="edit-name"
                                            value={editingDoctor?.name}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, name: e.target.value } : null)}
                                            required
                                          />
                                        </div>
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-email">Email</Label>
                                          <Input
                                            id="edit-email"
                                            type="email"
                                            value={editingDoctor?.email}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, email: e.target.value } : null)}
                                            required
                                          />
                                        </div>
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-phone">Phone</Label>
                                          <Input
                                            id="edit-phone"
                                            value={editingDoctor?.phone}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                            required
                                          />
                                        </div>
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-specialization">Specialization</Label>
                                          <Input
                                            id="edit-specialization"
                                            value={editingDoctor?.specialization}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, specialization: e.target.value } : null)}
                                            required
                                          />
                                        </div>
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-location">Location</Label>
                                          <Input
                                            id="edit-location"
                                            value={editingDoctor?.location}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, location: e.target.value } : null)}
                                            required
                                          />
                                        </div>
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-rating">Rating</Label>
                                          <Input
                                            id="edit-rating"
                                            type="number"
                                            value={editingDoctor?.rating}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, rating: parseFloat(e.target.value) } : null)}
                                            required
                                          />
                                        </div>
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-lat">Latitude</Label>
                                          <Input
                                            id="edit-lat"
                                            type="number"
                                            value={editingDoctor?.lat}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, lat: parseFloat(e.target.value) } : null)}
                                            required
                                          />
                                        </div>
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-lng">Longitude</Label>
                                          <Input
                                            id="edit-lng"
                                            type="number"
                                            value={editingDoctor?.lng}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, lng: parseFloat(e.target.value) } : null)}
                                            required
                                          />
                                        </div>
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-experience">Experience (years)</Label>
                                          <Input
                                            id="edit-experience"
                                            type="number"
                                            value={editingDoctor?.experience}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, experience: parseInt(e.target.value) } : null)}
                                            required
                                          />
                                        </div>
                                        <div className="grid w-full items-center gap-1.5">
                                          <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                                          <Input
                                            id="edit-tags"
                                            value={editingDoctor?.tags.join(', ')}
                                            onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) } : null)}
                                            required
                                          />
                                        </div>
                                      </div>
                                      <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="edit-about">About</Label>
                                        <Textarea
                                          id="edit-about"
                                          value={editingDoctor?.about}
                                          onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, about: e.target.value } : null)}
                                          required
                                        />
                                      </div>
                                      <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="edit-services">Services (comma-separated)</Label>
                                        <Input
                                          id="edit-services"
                                          value={editingDoctor?.services.join(', ')}
                                          onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, services: e.target.value.split(',').map(service => service.trim()) } : null)}
                                          required
                                        />
                                      </div>
                                      <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="edit-education">Education</Label>
                                        <Input
                                          id="edit-education"
                                          value={editingDoctor?.education}
                                          onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, education: e.target.value } : null)}
                                          required
                                        />
                                      </div>
                                      <div className="grid w-full items-center gap-1.5">
                                        <Label>Availability</Label>
                                        {editingDoctor && Object.entries(editingDoctor.availability).map(([day, { isAvailable, times }]) => (
                                          <div key={day} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`edit-availability-${day}`}
                                              checked={isAvailable}
                                              onCheckedChange={(checked) =>
                                                setEditingDoctor(prev => prev ? {
                                                  ...prev,
                                                  availability: {
                                                    ...prev.availability,
                                                    [day]: { ...prev.availability[day], isAvailable: checked as boolean }
                                                  }
                                                } : null)
                                              }
                                            />
                                            <Label htmlFor={`edit-availability-${day}`} className="w-20">{day}</Label>
                                            <Input
                                              placeholder="e.g., 9:00 AM - 5:00 PM"
                                              value={times}
                                              onChange={(e) =>
                                                setEditingDoctor(prev => prev ? {
                                                  ...prev,
                                                  availability: {
                                                    ...prev.availability,
                                                    [day]: { ...prev.availability[day], times: e.target.value }
                                                  }
                                                } : null)
                                              }
                                              disabled={!isAvailable}
                                              className="flex-grow"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                      <Button type="submit">Save Changes</Button>
                                    </form>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the doctor's account and remove their data from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDoctor(doctor.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Manage Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.doctorName}</TableCell>
                          <TableCell>{appointment.patientName}</TableCell>
                          <TableCell>{appointment.date}</TableCell>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>{appointment.reason}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">Edit</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Appointment</DialogTitle>
                                    <DialogDescription>
                                      Make changes to the appointment here. Click save when you're done.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleUpdateAppointment} className="space-y-4">
                                    <div className="grid w-full items-center gap-1.5">
                                      <Label htmlFor="edit-doctor-name">Doctor Name</Label>
                                      <Input
                                        id="edit-doctor-name"
                                        value={editingAppointment?.doctorName}
                                        onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, doctorName: e.target.value } : null)}
                                        required
                                      />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                      <Label htmlFor="edit-patient-name">Patient Name</Label>
                                      <Input
                                        id="edit-patient-name"
                                        value={editingAppointment?.patientName}
                                        onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, patientName: e.target.value } : null)}
                                        required
                                      />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                      <Label htmlFor="edit-date">Date</Label>
                                      <Input
                                        id="edit-date"
                                        type="date"
                                        value={editingAppointment?.date}
                                        onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, date: e.target.value } : null)}
                                        required
                                      />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                      <Label htmlFor="edit-time">Time</Label>
                                      <Input
                                        id="edit-time"
                                        type="time"
                                        value={editingAppointment?.time}
                                        onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, time: e.target.value } : null)}
                                        required
                                      />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                      <Label htmlFor="edit-reason">Reason</Label>
                                      <Textarea
                                        id="edit-reason"
                                        value={editingAppointment?.reason}
                                        onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, reason: e.target.value } : null)}
                                        required
                                      />
                                    </div>
                                    <Button type="submit">Save Changes</Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the appointment.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAppointment(appointment.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Favorite Doctors</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userProfiles.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{user.favoriteDoctors.join(', ')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">Edit</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit User Profile</DialogTitle>
                                    <DialogDescription>
                                      Make changes to the user profile here. Click save when you're done.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleUpdateUserProfile} className="space-y-4">
                                    <div className="grid w-full items-center gap-1.5">
                                      <Label htmlFor="edit-full-name">Full Name</Label>
                                      <Input
                                        id="edit-full-name"
                                        value={editingUser?.fullName}
                                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                                        required
                                      />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                      <Label htmlFor="edit-email">Email</Label>
                                      <Input
                                        id="edit-email"
                                        type="email"
                                        value={editingUser?.email}
                                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                                        required
                                      />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                      <Label htmlFor="edit-phone">Phone</Label>
                                      <Input
                                        id="edit-phone"
                                        value={editingUser?.phone}
                                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                        required
                                      />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                      <Label htmlFor="edit-favorite-doctors">Favorite Doctors (comma-separated)</Label>
                                      <Input
                                        id="edit-favorite-doctors"
                                        value={editingUser?.favoriteDoctors.join(', ')}
                                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, favoriteDoctors: e.target.value.split(',').map(doctor => doctor.trim()) } : null)}
                                      />
                                    </div>
                                    <Button type="submit">Save Changes</Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the user's account and remove their data from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUserProfile(user.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}