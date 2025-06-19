
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
  const objectsLayerRef = useRef<L.LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // SLAM objects simulation data for Bangalore area
  const slamObjects = [
    { lat: 12.9722, lng: 77.5946, type: 'obstacle', size: 'large' },
    { lat: 12.9718, lng: 77.5950, type: 'wall', size: 'medium' },
    { lat: 12.9726, lng: 77.5943, type: 'obstacle', size: 'small' },
    { lat: 12.9717, lng: 77.5953, type: 'feature', size: 'small' },
    { lat: 12.9729, lng: 77.5940, type: 'wall', size: 'large' },
    { lat: 12.9714, lng: 77.5958, type: 'obstacle', size: 'medium' },
    { lat: 12.9732, lng: 77.5937, type: 'feature', size: 'small' },
  ];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with dark SLAM-style appearance
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([location.lat, location.lng], 18);

    // Add dark SLAM-style tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '',
      maxZoom: 20,
      subdomains: 'abcd'
    }).addTo(mapRef.current);

    // Create SLAM objects layer
    objectsLayerRef.current = L.layerGroup().addTo(mapRef.current);

    // Add SLAM objects
    slamObjects.forEach((obj, index) => {
      const size = obj.size === 'large' ? 12 : obj.size === 'medium' ? 8 : 6;
      const color = obj.type === 'obstacle' ? '#ef4444' : 
                   obj.type === 'wall' ? '#f97316' : '#10b981';
      
      const objectIcon = L.divIcon({
        className: 'slam-object-marker',
        html: `
          <div class="relative">
            <div class="w-${size/2} h-${size/2} bg-${color === '#ef4444' ? 'red' : color === '#f97316' ? 'orange' : 'green'}-500 rounded-full border border-gray-300 shadow-lg opacity-80"></div>
            <div class="absolute inset-0 bg-${color === '#ef4444' ? 'red' : color === '#f97316' ? 'orange' : 'green'}-500/20 rounded-full animate-pulse"></div>
          </div>
        `,
        iconSize: [size + 4, size + 4],
        iconAnchor: [(size + 4) / 2, (size + 4) / 2]
      });

      const marker = L.marker([obj.lat, obj.lng], { icon: objectIcon });
      marker.bindPopup(`
        <div class="text-xs bg-gray-800 text-white p-2 rounded">
          <strong>SLAM Object #${index + 1}</strong><br>
          Type: ${obj.type.toUpperCase()}<br>
          Size: ${obj.size.toUpperCase()}<br>
          Coords: ${obj.lat.toFixed(6)}, ${obj.lng.toFixed(6)}
        </div>
      `);
      objectsLayerRef.current?.addLayer(marker);
    });

    // Create SLAM-style bot marker
    const botIcon = L.divIcon({
      className: 'slam-bot-marker',
      html: `
        <div class="relative">
          <div class="w-4 h-4 bg-cyan-400 rounded-full border border-cyan-300 shadow-lg animate-pulse"></div>
          <div class="absolute -inset-2 border border-cyan-400/30 rounded-full"></div>
          <div class="absolute -inset-4 border border-cyan-400/20 rounded-full animate-ping"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Add bot marker
    markerRef.current = L.marker([location.lat, location.lng], { icon: botIcon })
      .addTo(mapRef.current);

    // Add custom zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

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
    
    // Update SLAM path with technical styling
    if (pathRef.current) {
      pathRef.current.remove();
    }
    
    if (pathHistory.length > 1) {
      const pathCoords = pathHistory.map(pos => [pos.lat, pos.lng] as [number, number]);
      pathRef.current = L.polyline(pathCoords, {
        color: '#00ffff',
        weight: 2,
        opacity: 0.8,
        dashArray: '5, 5',
        smoothFactor: 0
      }).addTo(mapRef.current);
    }

    // Center map on bot location
    mapRef.current.setView([location.lat, location.lng], mapRef.current.getZoom(), {
      animate: true,
      duration: 0.3
    });
  }, [location, pathHistory]);

  const centerOnBot = () => {
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], 18, {
        animate: true,
        duration: 0.5
      });
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-sm h-full">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapIcon className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-medium text-white">SLAM Map</h3>
          </div>
          
          <button
            onClick={centerOnBot}
            className="flex items-center space-x-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-md transition-colors border border-cyan-500/30"
          >
            <Navigation className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-cyan-400">Center</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 h-[calc(100%-5rem)]">
        <div className="relative h-full rounded-md overflow-hidden border border-gray-700">
          <div ref={mapContainerRef} className="w-full h-full bg-gray-950" />
          
          {!isConnected && (
            <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300">SLAM Offline</p>
                <p className="text-sm text-gray-500 mt-2">
                  Waiting for mapping data...
                </p>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 bg-gray-800/90 px-2 py-1 rounded text-xs text-cyan-400 font-mono border border-gray-600">
            GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </div>
          
          <div className="absolute top-2 left-2 bg-gray-800/90 px-2 py-1 rounded text-xs text-green-400 font-mono border border-gray-600">
            SLAM: ACTIVE
          </div>

          <div className="absolute top-2 right-2 bg-gray-800/90 px-2 py-1 rounded text-xs text-yellow-400 font-mono border border-gray-600">
            Objects: {slamObjects.length}
          </div>
        </div>
      </div>
    </div>
  );
};
