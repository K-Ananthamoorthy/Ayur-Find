import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { toast } from "@/hooks/use-toast"
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.js'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'

declare module 'leaflet' {
  interface Map {
    locate: (options?: LocateOptions | undefined) => this;
  }
  namespace Control {
    class Locate extends L.Control {}
  }
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  lat: number;
  lng: number;
}

interface MapProps {
  center: [number, number]
  zoom: number
  markers: Doctor[]
  onMarkerClick?: (doctor: Doctor) => void
}

const MapComponent = ({ center, zoom, markers, onMarkerClick }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const [mapReady, setMapReady] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [nearbyDoctors, setNearbyDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    setMapReady(true)
  }, [])

  useEffect(() => {
    if (mapReady && typeof window !== 'undefined') {
      if (!mapRef.current) {
        mapRef.current = L.map('map').setView(center, zoom)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current)

        L.Icon.Default.mergeOptions({
          iconRetinaUrl: markerIcon2x.src,
          iconUrl: markerIcon.src,
          shadowUrl: markerShadow.src,
        })

        // Add geolocation control
        if ((L.Control as any).Locate) {
          (L.control as any).locate({
            position: 'topright',
            strings: {
              title: "Show me where I am"
            },
            onLocationError: (err: { message: any }) => {
              toast({
                title: "Location Error",
                description: err.message,
                variant: "destructive",
              })
            },
            onLocationOutsideMapBounds: () => {
              toast({
                title: "Location Outside Map",
                description: "Your location is outside the map bounds.",
                variant: "destructive",
              })
            },
            onActivate: () => {
              toast({
                title: "Locating",
                description: "Finding your location...",
              })
            }
          }).addTo(mapRef.current)
        }
        (L.control as any).locate({
          position: 'topright',
          strings: {
            title: "Show me where I am"
          },
          onLocationError: (err: { message: any }) => {
            toast({
              title: "Location Error",
              description: err.message,
              variant: "destructive",
            })
          },
          onLocationOutsideMapBounds: () => {
            toast({
              title: "Location Outside Map",
              description: "Your location is outside the map bounds.",
              variant: "destructive",
            })
          },
          onActivate: () => {
            toast({
              title: "Locating",
              description: "Finding your location...",
            })
          }
        }).addTo(mapRef.current)

        // Watch user's position
        navigator.geolocation.watchPosition(
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
          },
          { enableHighAccuracy: true }
        )
      } else {
        mapRef.current.setView(center, zoom)
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = {}
      }
    }
  }, [center, zoom, mapReady])

  useEffect(() => {
    if (mapRef.current && userLocation) {
      // Update user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation)
      } else {
        userMarkerRef.current = L.marker(userLocation, {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div class="ping"></div>',
          })
        }).addTo(mapRef.current)
      }

      // Find nearby doctors (within 5km)
      const nearby = markers.filter(doctor => {
        const distance = mapRef.current!.distance(userLocation, [doctor.lat, doctor.lng])
        return distance <= 5000 // 5km radius
      })
      setNearbyDoctors(nearby)

      // Clear existing markers
      Object.values(markersRef.current).forEach(marker => {
        mapRef.current!.removeLayer(marker)
      })
      markersRef.current = {}

      // Add markers for nearby doctors
      nearby.forEach(doctor => {
        const customIcon = new L.Icon({
          iconUrl: markerIcon.src,
          iconRetinaUrl: markerIcon2x.src,
          shadowUrl: markerShadow.src,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })

        const newMarker = L.marker([doctor.lat, doctor.lng], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <strong>${doctor.name}</strong><br>
            ${doctor.specialization}<br>
            Rating: ${doctor.rating}<br>
            <button class="navigate-btn">Navigate</button>
          `)
        
        newMarker.on('popupopen', () => {
          const navigateBtn = document.querySelector('.navigate-btn')
          if (navigateBtn) {
            navigateBtn.addEventListener('click', () => startNavigation(doctor))
          }
        })

        if (onMarkerClick) {
          newMarker.on('click', () => onMarkerClick(doctor))
        }

        markersRef.current[doctor.id] = newMarker
      })

      // Fit map bounds to show all nearby doctors and user location
      const bounds = L.latLngBounds([userLocation, ...nearby.map(d => [d.lat, d.lng] as [number, number])])
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })

      // Notify user about nearby doctors
      if (nearby.length > 0) {
        toast({
          title: "Doctors Nearby",
          description: `Found ${nearby.length} doctor(s) within 5km of your location.`,
        })
      } else {
        toast({
          title: "No Nearby Doctors",
          description: "There are no doctors within 5km of your location.",
          variant: "destructive",
        })
      }
    }
  }, [userLocation, markers, onMarkerClick])

  const startNavigation = (doctor: Doctor) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${doctor.lat},${doctor.lng}`
      window.open(url, '_blank')
    } else {
      toast({
        title: "Location Error",
        description: "Unable to get your current location. Please enable location services.",
        variant: "destructive",
      })
    }
  }

  if (!mapReady) {
    return <div>Loading map...</div>
  }

  return (
    <>
      <div id="map" style={{ height: '100%', width: '100%' }} />
      <style jsx global>{`
        .user-location-marker {
          width: 20px;
          height: 20px;
        }
        .ping {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4285f4;
          opacity: 0.7;
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}

export default MapComponent