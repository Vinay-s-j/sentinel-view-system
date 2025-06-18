
import { create } from 'zustand';

interface BotLocation {
  lat: number;
  lng: number;
}

interface BotTelemetry {
  battery: number;
  cpuUsage: number;
  temperature: number;
  fps: number;
  objectsDetected: number;
  status: 'idle' | 'patrolling' | 'alert' | 'offline';
}

interface BotState {
  isConnected: boolean;
  location: BotLocation;
  telemetry: BotTelemetry;
  streamUrl: string;
  pathHistory: BotLocation[];
  initializeBot: () => void;
  updateTelemetry: (data: Partial<BotTelemetry>) => void;
  updateLocation: (location: BotLocation) => void;
  setStreamUrl: (url: string) => void;
}

export const useBotStore = create<BotState>((set, get) => ({
  isConnected: true,
  location: { lat: 40.7128, lng: -74.0060 },
  telemetry: {
    battery: 85,
    cpuUsage: 45,
    temperature: 52,
    fps: 30,
    objectsDetected: 0,
    status: 'idle'
  },
  streamUrl: '/api/placeholder/640/480',
  pathHistory: [],

  initializeBot: () => {
    set({
      isConnected: true,
      pathHistory: [{ lat: 40.7128, lng: -74.0060 }]
    });
  },

  updateTelemetry: (data) => {
    set((state) => ({
      telemetry: { ...state.telemetry, ...data }
    }));
  },

  updateLocation: (location) => {
    set((state) => ({
      location,
      pathHistory: [...state.pathHistory.slice(-50), location]
    }));
  },

  setStreamUrl: (url) => {
    set({ streamUrl: url });
  }
}));
