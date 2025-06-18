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

    // Add vector-style tile layer optimized for surveillance/outdoor use
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors, Tiles courtesy of Humanitarian OpenStreetMap Team',
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(mapRef.current);

    // Alternative vector-style layer for better contrast
    // You can uncomment this and comment the above for a different style
    // L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    //   attribution: '© OpenStreetMap contributors, © OpenTopoMap (CC-BY-SA)',
    //   maxZoom: 17
    // }).addTo(mapRef.current);

    // Create custom bot icon with better visibility
    const botIcon = L.divIcon({
      className: 'custom-bot-marker',
      html: `
        <div class="relative">
          <div class="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-2xl animate-pulse flex items-center justify-center">
            <div class="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
          <div class="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            DRISHTI Bot
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Add bot marker
    markerRef.current = L.marker([location.lat, location.lng], { icon: botIcon })
      .addTo(mapRef.current)
      .bindPopup('DRISHTI Surveillance Bot<br/>Status: Active<br/>Signal: Strong');

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
        color: '#ef4444',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
        dashArray: '10, 5'
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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-blue-500/20 shadow-2xl hover:border-blue-400/40 transition-all duration-300 h-full">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapIcon className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Vector Navigation Map</h3>
          </div>
          
          <button
            onClick={centerOnBot}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
          >
            <Navigation className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-300">Center</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 h-[calc(100%-5rem)]">
        <div className="relative h-full rounded-xl overflow-hidden border border-slate-700/30">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {!isConnected && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Map Offline</p>
                <p className="text-sm text-slate-500 mt-2">
                  Waiting for GPS signal...
                </p>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-lg">
            <span className="text-xs text-white">
              Lat: {location.lat.toFixed(6)} • Lng: {location.lng.toFixed(6)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
