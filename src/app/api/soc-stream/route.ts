export const dynamic = "force-dynamic";

interface SocLogEvent {
  id: string;
  timestamp: string;
  source: "pfSense" | "Suricata" | "Snort" | "Wazuh-SIEM" | "Cisco-IOS";
  severity: "INFO" | "NOTICE" | "WARNING" | "CRITICAL";
  mitreTag?: string;
  message: string;
  details: string;
}

const TEMPLATES: Omit<SocLogEvent, "id" | "timestamp">[] = [
  {
    source: "pfSense",
    severity: "INFO",
    message: "PASS: IPv4 TCP handshake accepted on interface igb0_wan",
    details: "SRC: 103.145.24.12:49382 -> DST: 192.168.10.1:443 [FLAGS: S,A / SYN_ACK]",
  },
  {
    source: "Suricata",
    severity: "NOTICE",
    mitreTag: "T1046",
    message: "SURICATA IDS: Network service discovery scan detected and flagged",
    details: "Signature: [1:2001219:2] ET SCAN Potential Nmap OS Detection Probe",
  },
  {
    source: "Wazuh-SIEM",
    severity: "INFO",
    message: "Syscheck integrity baseline verified for /etc/snort/rules",
    details: "Agent 001 (core-node) - MD5 and SHA256 checksums matched",
  },
  {
    source: "pfSense",
    severity: "WARNING",
    message: "BLOCK: Inbound SYN Flood pattern suppressed by Rate-Limiting Filter",
    details: "Dropped 42 packets in 100ms from untrusted subnet 185.220.101.0/24",
  },
  {
    source: "Snort",
    severity: "INFO",
    message: "ICMP Echo payload inspected - Zero-day signature matching: NEGATIVE",
    details: "Packet size: 64 bytes, TTL: 64, Checksum: valid",
  },
  {
    source: "Cisco-IOS",
    severity: "INFO",
    message: "%OSPF-5-ADJCHG: Process 1, Nbr 192.168.1.1 on Gi0/0/1 from LOADING to FULL",
    details: "Area: 0.0.0.0, Neighbor State: Full/DR, Hello: 10s, Dead: 40s",
  },
  {
    source: "Wazuh-SIEM",
    severity: "INFO",
    message: "Active Directory policy audit: User account login telemetry ingested",
    details: "EventID 4624 - Successful Network Logon / Domain Controller Synced",
  },
  {
    source: "pfSense",
    severity: "INFO",
    message: "VLAN Trunking Link igb1.10 <-> igb1.20 routing telemetry healthy",
    details: "Bandwidth: 1.0 Gbps Full-Duplex, Packet Loss: 0.00%",
  },
  {
    source: "Suricata",
    severity: "CRITICAL",
    mitreTag: "T1110.001",
    message: "DROP: Repeated failed SSH authentication attempts mitigated by Fail2Ban",
    details: "SRC: 194.26.29.11 -> Port 22 [Rule: ET SCAN SSH Brute Force]",
  },
];

let counter = 1000;

function getRandomLog(): SocLogEvent {
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false }) + "." + String(now.getMilliseconds()).padStart(3, "0");
  counter++;

  return {
    id: `EVT-${counter}`,
    timestamp: timeStr,
    ...template,
  };
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send 3 initial seed logs immediately
      for (let i = 0; i < 3; i++) {
        const log = getRandomLog();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(log)}\n\n`));
      }

      // Send new log every 3 seconds
      const interval = setInterval(() => {
        try {
          const log = getRandomLog();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(log)}\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 3000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
