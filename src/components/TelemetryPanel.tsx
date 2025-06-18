
import { Battery, Cpu, Thermometer, Camera, Activity, Eye } from 'lucide-react';
import { useBotStore } from '@/store/botStore';

export const TelemetryPanel = () => {
  const { telemetry, isConnected } = useBotStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'patrolling': return 'text-green-400';
      case 'alert': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-blue-400';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-blue-500/20 shadow-2xl hover:border-blue-400/40 transition-all duration-300 h-full">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Bot Telemetry</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-4 h-[calc(100%-5rem)] overflow-y-auto">
        {/* Battery Status */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Battery className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">Battery</span>
            </div>
            <span className="text-green-400 font-bold">{Math.round(telemetry.battery)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getBatteryColor(telemetry.battery)}`}
              style={{ width: `${telemetry.battery}%` }}
            ></div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">CPU Usage</span>
            </div>
            <span className="text-blue-400 font-bold">{Math.round(telemetry.cpuUsage)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${telemetry.cpuUsage}%` }}
            ></div>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-orange-400" />
              <span className="text-white font-medium">Temperature</span>
            </div>
            <span className="text-orange-400 font-bold">{Math.round(telemetry.temperature)}°C</span>
          </div>
        </div>

        {/* Camera Status */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-purple-400" />
              <span className="text-white font-medium">Camera Feed</span>
            </div>
            <span className="text-purple-400 font-bold">{Math.round(telemetry.fps)} FPS</span>
          </div>
          <div className="text-sm text-gray-400">
            Resolution: 640x480
          </div>
        </div>

        {/* Object Detection */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-cyan-400" />
              <span className="text-white font-medium">Objects Detected</span>
            </div>
            <span className="text-cyan-400 font-bold">{telemetry.objectsDetected}</span>
          </div>
          {telemetry.objectsDetected > 0 && (
            <div className="mt-2 text-sm text-yellow-400">
              ⚠️ Motion detected in area
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${
                isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}></div>
              <span className="text-white font-medium">System Status</span>
            </div>
            <span className={`font-bold ${getStatusColor(telemetry.status)}`}>
              {telemetry.status.toUpperCase()}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};
