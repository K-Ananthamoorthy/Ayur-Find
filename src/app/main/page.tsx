"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { toast } from "@/hooks/use-toast"
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HomePage from '@/components/Homepage'
import DoctorListing from '@/components/DoctorListing'
import DoctorProfile from '@/components/DoctorProfile'
import AppointmentBooking from '@/components/AppointmentBooking'
import UserProfile from '@/components/UserProfile'
import { fetchUserData } from '@/lib/api'
import { CookieConsent } from '@/components/CookieConsent'
import { Doctor, Appointment, UserProfile as UserProfileType } from '@/types'
import LoadingSpinner from '@/components/LoadingAnimation'

export default function MainApplication() {
  const [currentPage, setCurrentPage] = useState('home')
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid)
          .then(({ userProfile, doctors, appointments }) => {
            setUserProfile(userProfile)
            setDoctors(doctors)
            setAppointments(appointments)
            setLoading(false)
          })
          .catch((error) => {
            console.error("Error fetching user data:", error)
            toast({
              title: "Error",
              description: "Failed to fetch user data. Please try again.",
              variant: "destructive",
            })
            setLoading(false)
          })
      } else {
        router.push('/auth')
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 transition-colors duration-200 min-h-screen flex flex-col">
      <Header userProfile={userProfile} setCurrentPage={setCurrentPage} />

      <main className="flex-grow">
        {currentPage === 'home' && (
          <HomePage 
            setCurrentPage={setCurrentPage} 
            doctors={doctors} 
            setSearchQuery={setSearchQuery}
          />
        )}
        {currentPage === 'doctorListing' && (
          <DoctorListing 
            doctors={doctors} 
            setSelectedDoctor={setSelectedDoctor} 
            setCurrentPage={setCurrentPage}
            initialSearchQuery={searchQuery}
          />
        )}
        {currentPage === 'doctorProfile' && selectedDoctor && (
          <DoctorProfile 
            doctor={selectedDoctor} 
            setCurrentPage={setCurrentPage} 
          />
        )}
        {currentPage === 'appointmentBooking' && selectedDoctor && (
          <AppointmentBooking 
            doctor={selectedDoctor} 
            userProfile={userProfile} 
            setCurrentPage={setCurrentPage} 
          />
        )}
        {currentPage === 'userProfile' && (
          <UserProfile 
            userProfile={userProfile} 
            appointments={appointments} 
            doctors={doctors} 
            setCurrentPage={setCurrentPage} 
          />
        )}
      </main>

      <Footer />
      <CookieConsent />
    </div>
  )
}