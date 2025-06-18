import { useEffect, useRef } from 'react';
import { Map as MapIcon, Navigation } from 'lucide-react';
import { useBotStore } from '@/store/botStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const MapPanel = () => {
  const { location, pathHistory, isConnected } = useBotStore();
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([location.lat, location.lng], 15);

    // Add Google Maps-like tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapRef.current);

    // Create simple bot marker similar to Google Maps
    const botIcon = L.divIcon({
      className: 'custom-bot-marker',
      html: `
        <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Add bot marker
    markerRef.current = L.marker([location.lat, location.lng], { icon: botIcon })
      .addTo(mapRef.current)
      .bindPopup('DRISHTI Bot<br/>Status: Active');

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    // Update marker position
    markerRef.current.setLatLng([location.lat, location.lng]);
    
    // Update path
    if (pathRef.current) {
      pathRef.current.remove();
    }
    
    if (pathHistory.length > 1) {
      const pathCoords = pathHistory.map(pos => [pos.lat, pos.lng] as [number, number]);
      pathRef.current = L.polyline(pathCoords, {
        color: '#4285f4',
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1
      }).addTo(mapRef.current);
    }

    // Center map on bot location
    mapRef.current.setView([location.lat, location.lng], mapRef.current.getZoom(), {
      animate: true,
      duration: 0.5
    });
  }, [location, pathHistory]);

  const centerOnBot = () => {
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], 16, {
        animate: true,
        duration: 0.5
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Map</h3>
          </div>
          
          <button
            onClick={centerOnBot}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
          >
            <Navigation className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600">Center</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 h-[calc(100%-5rem)]">
        <div className="relative h-full rounded-md overflow-hidden border border-gray-200">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {!isConnected && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Map Offline</p>
                <p className="text-sm text-gray-500 mt-2">
                  Waiting for GPS signal...
                </p>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
};
