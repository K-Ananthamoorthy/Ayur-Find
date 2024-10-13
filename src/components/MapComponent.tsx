import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

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

        // Fix Leaflet icon issue
        // No need to delete _getIconUrl property
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: markerIcon2x.src,
          iconUrl: markerIcon.src,
          shadowUrl: markerShadow.src,
        })
      } else {
        mapRef.current.setView(center, zoom)
      }

      const customIcon = new L.Icon({
        iconUrl: markerIcon.src,
        iconRetinaUrl: markerIcon2x.src,
        shadowUrl: markerShadow.src,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      // Add or update markers
      markers.forEach(marker => {
        if (markersRef.current[marker.id]) {
          markersRef.current[marker.id].setLatLng([marker.lat, marker.lng])
        } else {
          const newMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
            .addTo(mapRef.current!)
            .bindPopup(`
              <strong>${marker.name}</strong><br>
              ${marker.specialization}<br>
              Rating: ${marker.rating}
            `)
          
          if (onMarkerClick) {
            newMarker.on('click', () => onMarkerClick(marker))
          }

          markersRef.current[marker.id] = newMarker
        }
      })

      // Remove markers that are no longer in the data
      Object.keys(markersRef.current).forEach(id => {
        if (!markers.find(m => m.id === id)) {
          mapRef.current!.removeLayer(markersRef.current[id])
          delete markersRef.current[id]
        }
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = {}
      }
    }
  }, [center, zoom, markers, mapReady, onMarkerClick])

  if (!mapReady) {
    return <div>Loading map...</div>
  }

  return <div id="map" style={{ height: '100%', width: '100%' }} />
}

export default MapComponent