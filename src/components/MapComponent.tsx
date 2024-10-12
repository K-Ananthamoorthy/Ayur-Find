import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  center: [number, number]
  zoom: number
  markers: Array<{ lat: number; lng: number; name: string }>
}

const MapComponent = ({ center, zoom, markers }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)

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
      } else {
        mapRef.current.setView(center, zoom)
      }

      markers.forEach(marker => {
        L.marker([marker.lat, marker.lng])
          .addTo(mapRef.current!)
          .bindPopup(marker.name)
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center, zoom, markers, mapReady])

  if (!mapReady) {
    return <div>Loading map...</div>
  }

  return <div id="map" style={{ height: '100%', width: '100%' }} />
}

export default MapComponent