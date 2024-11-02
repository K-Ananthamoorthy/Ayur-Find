import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, where } from 'firebase/firestore'
import { db } from './firebase'
import { UserProfile, Doctor, Appointment } from '@/types'
import { toast } from "@/hooks/use-toast"

export async function fetchUserData(userId: string) {
  try {
    const userProfileDoc = await getDoc(doc(db, 'userProfiles', userId))
    let userProfile: UserProfile
    if (userProfileDoc.exists()) {
      userProfile = { id: userId, ...userProfileDoc.data() as Omit<UserProfile, 'id'> }
    } else {
      userProfile = {
        id: userId,
        fullName: '',
        email: '',
        phone: '',
        favoriteDoctors: []
      }
      await setDoc(doc(db, 'userProfiles', userId), userProfile)
    }

    const [appointmentsSnapshot, doctorsSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'appointments'), where('userId', '==', userId))),
      getDocs(collection(db, 'doctors'))
    ])

    const appointments = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
    const doctors = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor))

    return { userProfile, appointments, doctors }
  } catch (error) {
    console.error("Error fetching user data:", error)
    throw error
  }
}

export async function updateUserProfile(newProfile: Partial<UserProfile>) {
  try {
    await updateDoc(doc(db, 'userProfiles', newProfile.id!), newProfile)
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
    throw error
  }
}

export async function addAppointment(appointment: Omit<Appointment, 'id' | 'status'>, userId: string) {
  try {
    const newAppointment = {
      ...appointment,
      userId: userId,
      status: 'scheduled' as const
    }
    const docRef = await addDoc(collection(db, 'appointments'), newAppointment)
    toast({
      title: "Appointment Booked",
      description: "Your appointment has been successfully booked.",
    })
    return { id: docRef.id, ...newAppointment }
  } catch (error) {
    console.error("Error adding appointment:", error)
    toast({
      title: "Error",
      description: "Failed to book appointment. Please try again.",
      variant: "destructive",
    })
    throw error
  }
}

export async function cancelAppointment(appointmentId: string) {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), { status: 'cancelled' })
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
    throw error
  }
}

export async function requestReschedule(appointment: Appointment) {
  try {
    await updateDoc(doc(db, 'appointments', appointment.id), { status: 'rescheduling' })
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
    throw error
  }
}