
import { Camera } from 'lucide-react';
import { useBotStore } from '@/store/botStore';

export const Header = () => {
  const { isConnected, telemetry } = useBotStore();

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-blue-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Camera className="h-8 w-8 text-blue-400" />
              <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              } animate-pulse`}></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DRISHTI</h1>
              <p className="text-sm text-blue-300">Autonomous Surveillance System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              } animate-pulse`}></div>
              <span className="text-sm text-gray-300">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Status</div>
              <div className={`text-sm font-medium ${
                telemetry.status === 'patrolling' ? 'text-green-400' :
                telemetry.status === 'alert' ? 'text-red-400' :
                'text-blue-400'
              }`}>
                {telemetry.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
