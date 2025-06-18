import { useState, useEffect } from 'react';
import { Camera, Maximize2, Pause, Play, RotateCcw } from 'lucide-react';
import { useBotStore } from '@/store/botStore';

export const VideoStreamPanel = () => {
  const { streamUrl, isConnected } = useBotStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const handleRefresh = () => {
    setLastRefresh(Date.now());
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds to keep stream alive
    const interval = setInterval(() => {
      if (!isPaused) {
        setLastRefresh(Date.now());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-blue-500/20 shadow-2xl hover:border-blue-400/40 transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50' : 'h-full'
    }`}>
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Live Camera Feed</h3>
            {isConnected && (
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-400">LIVE</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              {isPaused ? (
                <Play className="h-4 w-4 text-green-400" />
              ) : (
                <Pause className="h-4 w-4 text-yellow-400" />
              )}
            </button>
            
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4 text-blue-400" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Maximize2 className="h-4 w-4 text-purple-400" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 h-[calc(100%-5rem)]">
        <div className="relative h-full bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/30">
          {isConnected && !isPaused ? (
            <img
              src={`${streamUrl}?t=${lastRefresh}`}
              alt="Live camera feed"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('Stream error, showing placeholder');
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Camera className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">
                  {isPaused ? 'Stream Paused' : 'Camera Offline'}
                </p>
                {!isConnected && (
                  <p className="text-sm text-slate-500 mt-2">
                    Waiting for bot connection...
                  </p>
                )}
              </div>
            </div>
          )}
          
          {isConnected && !isPaused && (
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-lg">
              <span className="text-xs text-white">
                Resolution: 640x480 • FPS: 30
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
