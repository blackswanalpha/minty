import { Cpu, Wifi, Battery, Clock, Terminal, Package, MemoryStick } from "lucide-react";
import { useState, useEffect } from "react";
import { useTerminalStore } from "@/stores/terminalStore";

interface SystemInfo {
  cpuUsage: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline' | 'weak';
  batteryLevel: number;
  processCount: number;
}

export const TerminalStatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [sessionStart] = useState(new Date());
  const { tabs } = useTerminalStore();
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    cpuUsage: 8,
    memoryUsage: 45,
    networkStatus: 'online',
    batteryLevel: 100,
    processCount: 156
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate system monitoring updates
    const systemTimer = setInterval(() => {
      setSystemInfo(prev => ({
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkStatus: Math.random() > 0.9 ? 'weak' : 'online',
        batteryLevel: Math.max(0, prev.batteryLevel - 0.1),
        processCount: Math.max(100, prev.processCount + Math.floor((Math.random() - 0.5) * 10))
      }));
    }, 5000);
    return () => clearInterval(systemTimer);
  }, []);

  const getSessionDuration = () => {
    const diff = time.getTime() - sessionStart.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getNetworkIcon = () => {
    switch (systemInfo.networkStatus) {
      case 'offline': return 'text-red-500';
      case 'weak': return 'text-yellow-500';
      default: return 'text-terminal-green';
    }
  };

  const getBatteryColor = () => {
    if (systemInfo.batteryLevel < 20) return 'text-red-500';
    if (systemInfo.batteryLevel < 50) return 'text-yellow-500';
    return 'text-terminal-green';
  };

  return (
    <div className="bg-secondary/50 border-t border-border px-4 py-1.5 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-4">
        <span className="text-terminal-green flex items-center gap-1">
          <span className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
          {systemInfo.networkStatus === 'offline' ? 'Offline' : 'Connected'}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Session: {getSessionDuration()}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Terminal className="w-3 h-3" />
          Tabs: {tabs.length}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Package className="w-3 h-3" />
          {systemInfo.processCount} processes
        </span>
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          {Math.round(systemInfo.cpuUsage)}%
        </span>
        <span className="flex items-center gap-1">
          <MemoryStick className="w-3 h-3" />
          {Math.round(systemInfo.memoryUsage)}%
        </span>
        <span className={`flex items-center gap-1 ${getNetworkIcon()}`}>
          <Wifi className="w-3 h-3" />
          {systemInfo.networkStatus === 'offline' ? 'Offline' :
            systemInfo.networkStatus === 'weak' ? 'Weak' : 'Strong'}
        </span>
        <span className={`flex items-center gap-1 ${getBatteryColor()}`}>
          <Battery className="w-3 h-3" />
          {Math.round(systemInfo.batteryLevel)}%
        </span>
        <span className="text-foreground">
          {time.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
