export interface Doctor {
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
  
  export interface Appointment {
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
  
  export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    favoriteDoctors: string[];
  }