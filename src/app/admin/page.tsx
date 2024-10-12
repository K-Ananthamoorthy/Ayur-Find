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
    lng: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const doctorsSnapshot = await getDocs(collection(db, 'doctors'))
    const doctorsData = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor))
    setDoctors(doctorsData)

    const appointmentsSnapshot = await getDocs(collection(db, 'appointments'))
    const appointmentsData = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
    setAppointments(appointmentsData)

    const userProfilesSnapshot = await getDocs(collection(db, 'userProfiles'))
    const userProfilesData = userProfilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
    setUserProfiles(userProfilesData)
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    await addDoc(collection(db, 'doctors'), newDoctor)
    setNewDoctor({ name: '', specialization: '', location: '', rating: 0, lat: 0, lng: 0 })
    fetchData()
  }

  const handleDeleteDoctor = async (id: string) => {
    await deleteDoc(doc(db, 'doctors', id))
    fetchData()
  }

  const handleDeleteAppointment = async (id: string) => {
    await deleteDoc(doc(db, 'appointments', id))
    fetchData()
  }

  const handleDeleteUserProfile = async (id: string) => {
    await deleteDoc(doc(db, 'userProfiles', id))
    fetchData()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
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
                <Input
                  placeholder="Name"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Specialization"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  required
                />
                <Input
                  placeholder="Location"
                  value={newDoctor.location}
                  onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Rating"
                  value={newDoctor.rating}
                  onChange={(e) => setNewDoctor({ ...newDoctor, rating: parseFloat(e.target.value) })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Latitude"
                  value={newDoctor.lat}
                  onChange={(e) => setNewDoctor({ ...newDoctor, lat: parseFloat(e.target.value) })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Longitude"
                  value={newDoctor.lng}
                  onChange={(e) => setNewDoctor({ ...newDoctor, lng: parseFloat(e.target.value) })}
                  required
                />
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
                      <TableCell>
                        <Button variant="destructive" onClick={() => handleDeleteDoctor(doctor.id)}>Delete</Button>
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
                        <Button variant="destructive" onClick={() => handleDeleteAppointment(appointment.id)}>Delete</Button>
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
                        <Button variant="destructive" onClick={() => handleDeleteUserProfile(profile.id)}>Delete</Button>
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