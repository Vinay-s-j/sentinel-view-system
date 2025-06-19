
import { useEffect } from 'react';
import { VideoStreamPanel } from '@/components/VideoStreamPanel';
import { MapPanel } from '@/components/MapPanel';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { Header } from '@/components/Header';
import { useBotStore } from '@/store/botStore';

const Index = () => {
  const { initializeBot, updateTelemetry, updateLocation } = useBotStore();

  useEffect(() => {
    // Initialize bot data
    initializeBot();

    // Simulate real-time updates
    const telemetryInterval = setInterval(() => {
      updateTelemetry({
        battery: Math.max(20, Math.min(100, Math.random() * 100)),
        cpuUsage: Math.random() * 100,
        temperature: 45 + Math.random() * 15,
        fps: 28 + Math.random() * 4,
        objectsDetected: Math.floor(Math.random() * 5),
        status: Math.random() > 0.7 ? 'patrolling' : 'idle'
      });
    }, 2000);

    const locationInterval = setInterval(() => {
      updateLocation({
        lat: 12.9134 + (Math.random() - 0.5) * 0.01, // Rajarajeshwari Nagar area simulation
        lng: 77.5204 + (Math.random() - 0.5) * 0.01
      });
    }, 3000);

    return () => {
      clearInterval(telemetryInterval);
      clearInterval(locationInterval);
    };
  }, [initializeBot, updateTelemetry, updateLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Video Stream Panel */}
          <div className="lg:col-span-1">
            <VideoStreamPanel />
          </div>
          
          {/* Map Panel */}
          <div className="lg:col-span-1">
            <MapPanel />
          </div>
          
          {/* Telemetry Panel */}
          <div className="lg:col-span-1">
            <TelemetryPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
