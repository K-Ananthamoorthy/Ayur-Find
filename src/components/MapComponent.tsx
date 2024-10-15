import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
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
  center: [number, number];
  zoom: number;
  markers: Doctor[];
  onMarkerClick?: (doctor: Doctor) => void;
};

export default function MapComponent({ center, zoom, markers, onMarkerClick }: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const [mapReady, setMapReady] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const routingControlRef = useRef<L.Routing.Control | null>(null)

  useEffect(() => {
    setMapReady(true)
  }, [])

  const initializeMap = useCallback(() => {
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

      mapRef.current.locate({
        setView: true,
        maxZoom: 16
      })

      mapRef.current.on('locationfound', (e) => {
        const { lat, lng } = e.latlng
        setUserLocation([lat, lng])
      })

      mapRef.current.on('locationerror', () => {
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please enable location services.",
          variant: "destructive",
        })
      })
    } else {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return

    const customIcon = new L.Icon({
      iconUrl: markerIcon.src,
      iconRetinaUrl: markerIcon2x.src,
      shadowUrl: markerShadow.src,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    markers.forEach(marker => {
      if (markersRef.current[marker.id]) {
        markersRef.current[marker.id].setLatLng([marker.lat, marker.lng])
      } else {
        const newMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <strong>${marker.name}</strong><br>
            ${marker.specialization}<br>
            Rating: ${marker.rating}<br>
            <button class="navigate-btn">Navigate</button>
          `)
        
        newMarker.on('popupopen', () => {
          const navigateBtn = document.querySelector('.navigate-btn')
          if (navigateBtn) {
            navigateBtn.addEventListener('click', () => startNavigation(marker))
          }
        })

        if (onMarkerClick) {
          newMarker.on('click', () => onMarkerClick(marker))
        }

        markersRef.current[marker.id] = newMarker
      }
    })

    Object.keys(markersRef.current).forEach(id => {
      if (!markers.find(m => m.id === id)) {
        mapRef.current!.removeLayer(markersRef.current[id])
        delete markersRef.current[id]
      }
    })
  }, [markers, onMarkerClick])

  useEffect(() => {
    if (mapReady && typeof window !== 'undefined') {
      initializeMap()
      updateMarkers()
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = {}
      }
    }
  }, [mapReady, initializeMap, updateMarkers])

  useEffect(() => {
    if (mapRef.current && userLocation) {
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

      markers.forEach(doctor => {
        const distance = mapRef.current!.distance(userLocation, [doctor.lat, doctor.lng])
        if (distance < 1000) {
          toast({
            title: "Doctor Nearby",
            description: `${doctor.name} is within 1km of your location.`,
          })
        }
      })
    }
  }, [userLocation, markers])

  const startNavigation = useCallback((doctor: Doctor) => {
    if (!userLocation || !mapRef.current) {
      toast({
        title: "Location Error",
        description: "Unable to get your current location. Please enable location services.",
        variant: "destructive",
      })
      return
    }

    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current)
    }

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(doctor.lat, doctor.lng)
      ],
      routeWhileDragging: true,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#6366f1', weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      },
    }).addTo(mapRef.current)

    routingControlRef.current.on('routesfound', function(e) {
      const routes = e.routes
      const summary = routes[0].summary
      toast({
        title: "Navigation Started",
        description: `Navigating to ${doctor.name}. Estimated time: ${Math.round(summary.totalTime / 60)} minutes, Distance: ${(summary.totalDistance / 1000).toFixed(2)} km`,
      })
    })

  }, [userLocation])

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