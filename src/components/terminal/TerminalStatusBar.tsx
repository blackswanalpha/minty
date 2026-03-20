import { Cpu, Wifi, WifiOff, Battery, BatteryCharging, Clock, Terminal, MemoryStick, Plug } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useTerminalStore } from "@/stores/terminalStore";

interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  battery: {
    level: number;
    charging: boolean;
    available: boolean;
  };
  wifi: {
    connected: boolean;
    quality: number;
    strength: string;
    available: boolean;
  };
}

export const TerminalStatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [sessionStart] = useState(new Date());
  const tabCount = useTerminalStore(state => state.tabs.length);
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await window.ipcRenderer.invoke('get-system-stats') as SystemStats;
      setStats(data);
    } catch {
      // IPC not available (e.g. in dev browser mode)
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const getSessionDuration = () => {
    const diff = time.getTime() - sessionStart.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getWifiColor = () => {
    if (!stats?.wifi.available) return 'text-muted-foreground';
    if (!stats.wifi.connected) return 'text-red-500';
    if (stats.wifi.strength === 'weak') return 'text-yellow-500';
    if (stats.wifi.strength === 'moderate') return 'text-yellow-400';
    return 'text-terminal-green';
  };

  const getWifiLabel = () => {
    if (!stats?.wifi.available) return 'N/A';
    if (!stats.wifi.connected) return 'Offline';
    return `${stats.wifi.quality}%`;
  };

  const getBatteryColor = () => {
    if (!stats?.battery.available) return 'text-muted-foreground';
    if (stats.battery.charging) return 'text-terminal-green';
    if (stats.battery.level < 20) return 'text-red-500';
    if (stats.battery.level < 50) return 'text-yellow-500';
    return 'text-terminal-green';
  };

  const getBatteryLabel = () => {
    if (!stats?.battery.available) return 'AC';
    return `${stats.battery.level}%`;
  };

  const BatteryIcon = stats?.battery.charging ? BatteryCharging : Battery;
  const WifiIcon = stats?.wifi.connected === false ? WifiOff : Wifi;

  return (
    <div className="bg-secondary/50 border-t border-border px-4 py-1.5 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-4">
        <span className="text-terminal-green flex items-center gap-1">
          <span className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
          {navigator.onLine ? 'Connected' : 'Offline'}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Session: {getSessionDuration()}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Terminal className="w-3 h-3" />
          Tabs: {tabCount}
        </span>
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="flex items-center gap-1" title={`CPU: ${stats ? stats.cpuUsage : '—'}%`}>
          <Cpu className="w-3 h-3" />
          {stats ? `${stats.cpuUsage}%` : '—'}
        </span>
        <span className="flex items-center gap-1" title={`Memory: ${stats ? stats.memoryUsage : '—'}%`}>
          <MemoryStick className="w-3 h-3" />
          {stats ? `${stats.memoryUsage}%` : '—'}
        </span>
        <span className={`flex items-center gap-1 ${getWifiColor()}`} title={stats?.wifi.available ? `WiFi: ${stats.wifi.strength} (${stats.wifi.quality}%)` : 'WiFi: N/A'}>
          <WifiIcon className="w-3 h-3" />
          {getWifiLabel()}
        </span>
        <span className={`flex items-center gap-1 ${getBatteryColor()}`} title={stats?.battery.available ? `Battery: ${stats.battery.level}%${stats.battery.charging ? ' (charging)' : ''}` : 'No battery detected'}>
          {stats?.battery.available ? <BatteryIcon className="w-3 h-3" /> : <Plug className="w-3 h-3" />}
          {getBatteryLabel()}
        </span>
        <span className="text-foreground">
          {time.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
