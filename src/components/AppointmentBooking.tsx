import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Doctor, UserProfile, Appointment } from '@/types';
import { addAppointment } from '@/lib/api';

interface AppointmentBookingProps {
  doctor: Doctor;
  userProfile: UserProfile | null;
  setCurrentPage: (page: string) => void;
}

export default function AppointmentBooking({ doctor, userProfile, setCurrentPage }: AppointmentBookingProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Construct appointment data
    const appointment: Omit<Appointment, 'id' | 'status'> = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      patientName: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      reason: formData.get('reason') as string,
      userId: userProfile?.id || '',
    };

    console.log("Submitting appointment:", appointment); // Debug log

    try {
      // Call the API to add the appointment
      await addAppointment(appointment, userProfile?.id || '');
      setCurrentPage('userProfile'); // Redirect to user profile on success
    } catch (error) {
      console.error('Error while booking appointment:', error); // Error handling
      alert('Failed to book appointment. Please try again.'); // User feedback
    }
  };

  return (
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
          <CardTitle>Book an Appointment with {doctor.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
  );
}
