'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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
    [key: string]: string;
  };
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
  favoriteDoctors: string[];
}

export default function AdminPanel() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [newDoctor, setNewDoctor] = useState<Omit<Doctor, 'id'>>({
    name: '',
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
    availability: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        availability: {}
      })
      await fetchData()
    } catch (err) {
      setError('Failed to add doctor. Please try again.')
      console.error("Error adding doctor:", err)
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      <Tabs defaultValue="doctors">
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="users">User Profiles</TabsTrigger>
        </TabsList>
        <TabsContent value="doctors">
          <Card>
            <CardHeader>
              <CardTitle>Add New Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDoctor} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Name"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="Specialization"
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Location"
                    value={newDoctor.location}
                    onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    placeholder="Rating"
                    value={newDoctor.rating}
                    onChange={(e) => setNewDoctor({ ...newDoctor, rating: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    placeholder="Latitude"
                    value={newDoctor.lat}
                    onChange={(e) => setNewDoctor({ ...newDoctor, lat: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    placeholder="Longitude"
                    value={newDoctor.lng}
                    onChange={(e) => setNewDoctor({ ...newDoctor, lng: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="Experience"
                    value={newDoctor.experience}
                    onChange={(e) => setNewDoctor({ ...newDoctor, experience: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="Tags"
                    value={newDoctor.tags.join(', ')}
                    onChange={(e) => setNewDoctor({ ...newDoctor, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="about">About</Label>
                  <Textarea
                    id="about"
                    placeholder="About the doctor"
                    value={newDoctor.about}
                    onChange={(e) => setNewDoctor({ ...newDoctor, about: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="services">Services (comma-separated)</Label>
                  <Input
                    id="services"
                    placeholder="Services"
                    value={newDoctor.services.join(', ')}
                    onChange={(e) => setNewDoctor({ ...newDoctor, services: e.target.value.split(',').map(service => service.trim()) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    placeholder="Education"
                    value={newDoctor.education}
                    onChange={(e) => setNewDoctor({ ...newDoctor, education: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <div key={day} className="flex items-center space-x-2 mt-2">
                      <Label htmlFor={`availability-${day}`}>{day}</Label>
                      <Input
                        id={`availability-${day}`}
                        placeholder="e.g., 9:00 AM - 5:00 PM"
                        value={newDoctor.availability[day] || ''}
                        onChange={(e) => setNewDoctor({
                          ...newDoctor,
                          availability: { ...newDoctor.availability, [day]: e.target.value }
                        })}
                      />
                    </div>
                  ))}
                </div>
                <Button type="submit">Add Doctor</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Doctors List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>{doctor.name}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.location}</TableCell>
                      <TableCell>{doctor.rating}</TableCell>
                      <TableCell>{doctor.experience} years</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {doctor.tags && doctor.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete</Button>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments List</CardTitle>
            </CardHeader>
            <CardContent>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete</Button>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Profiles</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {userProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.fullName}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>{profile.phone}</TableCell>
                      <TableCell>{profile.favoriteDoctors?.length ?? 0}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete</Button>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}