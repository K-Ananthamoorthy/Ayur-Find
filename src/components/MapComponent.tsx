import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from "@/hooks/use-toast"

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  lat: number;
  lng: number;
}

type MapProps = {
  markers: Doctor[];
  onMarkerClick?: (doctor: Doctor) => void;
  center: number[]

  zoom: number
};

declare global {
  interface Window {
    mappls: any;
  }
}

export default function MapComponent({ markers, onMarkerClick }: MapProps) {
  const mapRef = useRef<any>(null)
  const markersRef = useRef<{ [key: string]: any }>({})
  const [mapReady, setMapReady] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const userMarkerRef = useRef<any>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://apis.mappls.com/advancedmaps/v1/768cea0573a4b636509a001319e54f99/map_sdk?layer=vector&v=3.0&callback=initMap'
    script.async = true
    document.body.appendChild(script)

    window.initMap = () => {
      setMapReady(true)
    }

    return () => {
      document.body.removeChild(script)
      delete window.initMap
    }
  }, [])

  const initializeMap = useCallback(() => {
    if (!mapRef.current && window.mappls) {
      mapRef.current = new window.mappls.Map('map', {
        center: [20.5937, 78.9629], // Center of India as default
        zoom: 5,
        zoomControl: true,
        location: true
      })

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setUserLocation([latitude, longitude])
          },
          (error) => {
            console.error("Error getting location:", error)
            toast({
              title: "Location Error",
              description: "Unable to get your location. Please enable location services.",
              variant: "destructive",
            })
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        )
      }
    }
  }, [])

  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return

    markers.forEach(marker => {
      if (markersRef.current[marker.id]) {
        markersRef.current[marker.id].setLngLat([marker.lng, marker.lat])
      } else {
        const newMarker = new window.mappls.Marker({
          map: mapRef.current,
          position: {lat: marker.lat, lng: marker.lng},
          draggable: false,
          fitbounds: true,
          popupHtml: `
            <strong>${marker.name}</strong><br>
            ${marker.specialization}<br>
            Rating: ${marker.rating}<br>
            <a href="https://maps.google.com/maps?q=${marker.lat},${marker.lng}" target="_blank" rel="noopener noreferrer">Navigate</a>
          `
        })
        
        newMarker.addListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(marker)
          }
        })

        markersRef.current[marker.id] = newMarker
      }
    })
  }, [markers, onMarkerClick])

  useEffect(() => {
    if (mapReady && typeof window !== 'undefined') {
      initializeMap()
    }
  }, [mapReady, initializeMap])

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setCenter(userLocation)
      mapRef.current.setZoom(12)

      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat(userLocation)
      } else {
        userMarkerRef.current = new window.mappls.Marker({
          map: mapRef.current,
          position: {lat: userLocation[0], lng: userLocation[1]},
          icon: 'https://apis.mapmyindia.com/map_v3/1.png'
        })
      }

      updateMarkers()

      markers.forEach(doctor => {
        const distance = window.mappls.distance({
          coord1: `${userLocation[1]},${userLocation[0]}`,
          coord2: `${doctor.lng},${doctor.lat}`
        })
        if (distance <= 5000) {
          toast({
            title: "Doctor Nearby",
            description: `${doctor.name} is within 5km of your location.`,
          })
        }
      })
    }
  }, [userLocation, markers, updateMarkers])

  if (!mapReady) {
    return <div>Loading map...</div>
  }

  return (
    <div id="map" style={{ height: '100%', width: '100%' }} />
  )
}