
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
  location: { lat: 12.9134, lng: 77.5204 }, // Rajarajeshwari Nagar, Bangalore coordinates
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
      pathHistory: [{ lat: 12.9134, lng: 77.5204 }] // Initialize with Rajarajeshwari Nagar coordinates
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
