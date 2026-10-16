"use client";

import { useState, useEffect, useRef } from "react";
import { HiOutlineTerminal, HiOutlinePlay, HiOutlinePause, HiOutlineTrash } from "react-icons/hi";

interface SocLogEvent {
  id: string;
  timestamp: string;
  source: "pfSense" | "Suricata" | "Snort" | "Wazuh-SIEM" | "Sentinel";
  severity: "INFO" | "NOTICE" | "WARNING" | "CRITICAL";
  mitreTag?: string;
  message: string;
  details: string;
}

export default function SocMonitor() {
  const [logs, setLogs] = useState<SocLogEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource("/api/soc-stream");

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        if (pausedRef.current) return;
        try {
          const newLog: SocLogEvent = JSON.parse(event.data);
          setLogs((prev) => [newLog, ...prev.slice(0, 24)]);
        } catch (e) {
          console.warn("Failed to parse SOC log event:", e);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.warn("EventSource setup error:", e);
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto font-mono text-xs">
      {/* Section Header */}
      <div className="text-center mb-8">
        <p className="section-label mb-2">--- LIVE TELEMETRY STREAM ---</p>
        <h2 className="section-title text-2xl md:text-3xl font-mono text-white">
          SOC_SECURITY_EVENT_FEED
        </h2>
        <p className="text-gray-400 mt-2 max-w-xl mx-auto text-xs leading-relaxed">
          Simulated SOC feed flexing enterprise IDS/IPS telemetry, firewall events, and SIEM ingestion — demo stream, not live infrastructure. Just for flexing with recruiters.
        </p>
      </div>

      {/* Monitor Terminal Window */}
      <div className="bg-black/80 border border-emerald-500/30 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Terminal Header */}
        <div className="bg-gradient-to-r from-gray-900/90 to-black/90 px-4 py-2.5 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="flex items-center gap-2 text-emerald-400/80">
              <HiOutlineTerminal className="w-4 h-4" />
              <span className="font-bold tracking-wider text-[11px]">
                SIEM-CORE-DAEMON://telemetry.stream
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-emerald-500/20">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected && !isPaused ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                {isPaused ? "STREAM PAUSED" : isConnected ? "INGESTING LIVE" : "CONNECTING..."}
              </span>
            </div>

            {/* Pause / Resume Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 hover:text-emerald-300 text-gray-400 transition-colors"
              title={isPaused ? "Resume Stream" : "Pause Stream"}
            >
              {isPaused ? <HiOutlinePlay className="w-4 h-4 text-emerald-400" /> : <HiOutlinePause className="w-4 h-4" />}
            </button>

            {/* Clear Button */}
            <button
              onClick={() => setLogs([])}
              className="p-1 hover:text-red-400 text-gray-400 transition-colors"
              title="Clear Terminal"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={logContainerRef}
          className="p-4 md:p-6 min-h-[280px] max-h-[380px] overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-emerald-900/40"
        >
          {logs.length === 0 ? (
            <div className="text-gray-600 flex items-center gap-2 py-8 justify-center">
              <span className="animate-pulse">_</span> Awaiting live packet events from network interfaces...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col md:flex-row md:items-baseline gap-1.5 md:gap-3 py-1.5 px-3 rounded hover:bg-emerald-500/5 transition-colors border border-transparent hover:border-emerald-500/10"
              >
                {/* Timestamp */}
                <span className="text-gray-500 shrink-0 text-[10px] tabular-nums">
                  [{log.timestamp}]
                </span>

                {/* Source Badge */}
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${
                    log.source === "pfSense"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : log.source === "Suricata"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : log.source === "Wazuh-SIEM"
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                      : "bg-teal-500/10 border-teal-500/30 text-teal-300"
                  }`}
                >
                  {log.source}
                </span>

                {/* Severity */}
                <span
                  className={`text-[10px] font-bold shrink-0 ${
                    log.severity === "CRITICAL"
                      ? "text-red-400"
                      : log.severity === "WARNING"
                      ? "text-amber-400"
                      : log.severity === "NOTICE"
                      ? "text-cyan-400"
                      : "text-gray-400"
                  }`}
                >
                  [{log.severity}]
                </span>

                {/* MITRE Tag */}
                {log.mitreTag && (
                  <span className="text-[9px] px-1 bg-red-950/40 border border-red-500/30 text-red-400 rounded shrink-0">
                    MITRE {log.mitreTag}
                  </span>
                )}

                {/* Log Message */}
                <span className="text-gray-200 text-xs">
                  {log.message}
                </span>

                {/* Log Details */}
                <span className="text-[11px] text-emerald-400/60 md:ml-auto shrink-0 font-light truncate max-w-sm">
                  {log.details}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Terminal Footer */}
        <div className="bg-black/90 px-4 py-2 border-t border-emerald-500/10 flex items-center justify-between text-[10px] text-gray-500">
          <span>PACKET_FILTER: ACTIVE</span>
          <span className="text-emerald-500/60">INTEGRITY_CHECK: PASS</span>
          <span>BUFFER: {logs.length}/25 EVENTS</span>
        </div>
      </div>
    </section>
  );
}
