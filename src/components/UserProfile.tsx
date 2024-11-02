import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { UserProfile as UserProfileType, Appointment, Doctor } from '@/types'
import { updateUserProfile, cancelAppointment, requestReschedule } from '@/lib/api'

interface UserProfileProps {
  userProfile: UserProfileType | null
  appointments: Appointment[]
  doctors: Doctor[]
  setCurrentPage: (page: string) => void
}

export default function UserProfile({ userProfile, appointments, doctors, setCurrentPage }: UserProfileProps) {
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newProfile = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    }
    await updateUserProfile(newProfile)
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    await cancelAppointment(appointmentId)
  }

  const handleRequestReschedule = async (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsRescheduling(true)
  }

  const confirmReschedule = async () => {
    if (selectedAppointment) {
      await requestReschedule(selectedAppointment)
      setIsRescheduling(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8"
    >
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
              <form className="space-y-4" onSubmit={handleProfileUpdate}>
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
                            <Button variant="outline" onClick={() => handleRequestReschedule(appointment)}>
                              Request Reschedule
                            </Button>
                            <Button variant="destructive" onClick={() => handleCancelAppointment(appointment.id)}>
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
                          <span>{doctor.location}</span>
                        </div>
                        <Button variant="outline" onClick={() => {
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

      {isRescheduling && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Confirm Reschedule Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Are you sure you want to request a reschedule for your appointment with {selectedAppointment.doctorName} on {selectedAppointment.date} at {selectedAppointment.time}?</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsRescheduling(false)}>Cancel</Button>
                <Button onClick={confirmReschedule}>Confirm</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  )
}