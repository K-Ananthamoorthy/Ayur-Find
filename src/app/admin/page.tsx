'use client'

import { useState, useEffect } from 'react'
import { db, storage } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
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
import * as XLSX from 'xlsx'
import { Loader2, Plus, Upload } from 'lucide-react'

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

export default function AdminPanel() {
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const doctorsSnapshot = await getDocs(collection(db, 'doctors'))
      const doctorsData = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor))
      setDoctors(doctorsData)

      const appointmentsSnapshot = await getDocs(collection(db, 'appointments'))
      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
      setAppointments(appointmentsData)

      const userProfilesSnapshot = await getDocs(collection(db, 'userProfiles'))
      const userProfilesData = userProfilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
      setUserProfiles(userProfilesData)
    } catch (err) {
      setError('Failed to fetch data. Please try again.')
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDoctor) return
    setIsLoading(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'doctors', editingDoctor.id), { ...editingDoctor })
      setEditingDoctor(null)
      await fetchData()
    } catch (err) {
      setError('Failed to update doctor. Please try again.')
      console.error("Error updating doctor:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDoctor = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'doctors', id))
      await fetchData()
    } catch (err) {
      setError('Failed to delete doctor. Please try again.')
      console.error("Error deleting doctor:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAppointment) return
    setIsLoading(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'appointments', editingAppointment.id), { ...editingAppointment })
      setEditingAppointment(null)
      await fetchData()
    } catch (err) {
      setError('Failed to update appointment. Please try again.')
      console.error("Error updating appointment:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'appointments', id))
      await fetchData()
    } catch (err) {
      setError('Failed to delete appointment. Please try again.')
      console.error("Error deleting appointment:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsLoading(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'userProfiles', editingUser.id), { ...editingUser })
      setEditingUser(null)
      await fetchData()
    } catch (err) {
      setError('Failed to update user profile. Please try again.')
      console.error("Error updating user profile:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUserProfile = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'userProfiles', id))
      await fetchData()
    } catch (err) {
      setError('Failed to delete user profile. Please try again.')
      console.error("Error deleting user profile:", err)
    } finally {
      setIsLoading(false)
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

      type ExcelRow = {
        Name: string
        Email: string
        Phone: string
        Specialization: string
        Location: string
        Rating: string
        Latitude: string
        Longitude: string
        Experience: string
        Tags: string
        About: string
        Services: string
        Education: string
      }

      for (const row of jsonData as ExcelRow[]) {
        const doctor: Omit<Doctor, 'id'> = {
          name: row.Name || '',
          email: row.Email || '',
          phone: row.Phone || '',
          specialization: row.Specialization || '',
          location: row.Location || '',
          rating: parseFloat(row.Rating) || 0,
          lat: parseFloat(row.Latitude) || 0,
          lng: parseFloat(row.Longitude) || 0,
          experience: parseInt(row.Experience) || 0,
          tags: (row.Tags || '').split(',').map(tag => tag.trim()),
          about: row.About || '',
          services: (row.Services || '').split(',').map(service => service.trim()),
          education: row.Education || '',
          availability: {
            Monday: { isAvailable: false, times: '' },
            Tuesday: { isAvailable: false, times: '' },
            Wednesday: { isAvailable: false, times: '' },
            Thursday: { isAvailable: false, times: '' },
            Friday: { isAvailable: false, times: '' },
            Saturday: { isAvailable: false, times: '' },
            Sunday: { isAvailable: false, times: '' },
          }
        }

        try {
          await addDoc(collection(db, 'doctors'), doctor)
        } catch (err) {
          console.error("Error adding doctor from Excel:", err)
        }
      }

      await fetchData()
    }
    reader.readAsArrayBuffer(file)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1 md:col-span-4">
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
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button variant={activeTab === 'overview' ? "default" : "outline"} onClick={() => setActiveTab('overview')}>Overview</Button>
              <Button variant={activeTab === 'doctors' ? "default" : "outline"} onClick={() => setActiveTab('doctors')}>Manage Doctors</Button>
              <Button variant={activeTab === 'appointments' ? "default" : "outline"} onClick={() => setActiveTab('appointments')}>Manage Appointments</Button>
              <Button variant={activeTab === 'users' ? "default" : "outline"} onClick={() => setActiveTab('users')}>Manage Users</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>{activeTab === 'overview' ? 'Recent Activity' : activeTab === 'doctors' ? 'Manage Doctors' : activeTab === 'appointments' ? 'Manage Appointments' : 'Manage Users'}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'overview' && (
              <div className="overflow-x-auto">
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
                    {appointments.slice(0, 5).map((appointment) => (
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
            )}
            {activeTab === 'doctors' && (
              <div>
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
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the doctor's profile.
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
              </div>
            )}
            {activeTab === 'appointments' && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
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
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Edit</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Appointment</DialogTitle>
                                  <DialogDescription>
                                    Make changes to the appointment here. Click save when you're done.
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdateAppointment} className="space-y-4">
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
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
            )}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.fullName}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.phone}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Edit</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit User Profile</DialogTitle>
                                  <DialogDescription>
                                    Make changes to the user's profile here. Click save when you're done.
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdateUserProfile} className="space-y-4">
                                  <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="edit-fullName">Full Name</Label>
                                    <Input
                                      id="edit-fullName"
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
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user profile.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUserProfile(profile.id)}>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}