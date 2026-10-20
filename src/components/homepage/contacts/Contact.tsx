"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineMail } from "react-icons/hi";
import { FaDiscord, FaGithub, FaLinkedin } from "react-icons/fa";
import "./Contact.css"

const socials = [
  {
    icon: <FaLinkedin className="w-5 h-5" />,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/siam-khan",
    handle: "siam-khan",
    command: "npx connect --profile Siam-Khan --platform linkedin",
  },
  {
    icon: <HiOutlineMail className="w-5 h-5" />,
    label: "Email",
    href: "mailto:whoamimcc@gmail.com",
    handle: "whoamimcc@gmail.com",
    command: "echo 'get in touch!' | mail -s 'Networking Opportunity'",
  },
  {
    icon: <FaDiscord className="w-5 h-5" />,
    label: "Discord",
    href: "https://discord.com/users/793803998876401695",
    handle: "siam khan",
    command: "/msg siam khan",
  },

  {
    icon: <FaGithub className="w-5 h-5" />,
    label: "GitHub",
    href: "https://github.com/osama95uh",
    handle: "siam khan",
    command: "git clone https://github.com/osama95uh",
  },

];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Contact() {
  return (
    <section id="contact" className="relative py-28 px-4 overflow-hidden bg-black">
      {/* MATRIX GRID */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#22c55e_1px,transparent_1px),linear-gradient(to_bottom,#22c55e_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* SCANLINES */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgba(0,255,120,0.08)_3px)] animate-scanlines" />

      {/* GLITCH LINES */}
      <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent animate-glitch" />
      <div className="absolute bottom-1/3 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-glitch-delayed" />

      {/* TERMINAL CURSOR */}
      <div className="absolute top-8 left-8 text-2xl font-mono text-emerald-500/30 animate-blink pointer-events-none">_</div>

      {/* DECORATIVE BRACKETS */}
      <div className="absolute top-8 left-8 text-3xl font-mono text-emerald-500/10 font-bold pointer-events-none">{'{'}</div>
      <div className="absolute top-8 right-8 text-3xl font-mono text-emerald-500/10 font-bold pointer-events-none">{'}'}</div>
      <div className="absolute bottom-8 left-8 text-3xl font-mono text-emerald-500/10 font-bold pointer-events-none">{'/*'}</div>
      <div className="absolute bottom-8 right-8 text-3xl font-mono text-emerald-500/10 font-bold pointer-events-none">{'*/'}</div>

      {/* Ambient Glows (GPU radial gradient without expensive blur filters) */}
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,rgba(16,185,129,0.02)_50%,transparent_70%)] pointer-events-none"
        style={{ marginRight: "calc(50% - 50vw)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,rgba(16,185,129,0.02)_50%,transparent_70%)] pointer-events-none"
        style={{ marginRight: "calc(50% - 50vw)" }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-emerald-400 text-xs tracking-widest uppercase">---</span>
            <span className="text-emerald-400 text-xs font-mono">$ ./contact.sh</span>
            <span className="text-emerald-400 text-xs tracking-widest uppercase">---</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-mono tracking-tight">
            <span className="text-emerald-400">&gt;</span> 
            <span className="text-white"> ESTABLISH_CONNECTION</span>
            <span className="text-emerald-400 animate-blink inline-block">_</span>
          </h2>
          
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-emerald-500/50" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-emerald-500/50" />
          </div>
          
          <p className="text-gray-400 leading-relaxed font-mono text-sm">
            <span className="text-emerald-500">STATUS:</span> ONLINE_AND_READY
            <br />
            <span className="text-emerald-500">MODE:</span> ACCEPTING_CONNECTIONS
          </p>
        </motion.div>

        {/* Social cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col gap-4"
        >
          {socials.map(({ icon, label, href, handle, command }) => (
            <motion.a
              key={label}
              variants={item}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl border border-emerald-500/20 bg-black/60 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all duration-300 backdrop-blur-sm"
            >
              {/* HOVER GLOW */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0" />
              
              {/* TERMINAL PROMPT ON HOVER */}
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="text-emerald-400 group-hover:scale-110 group-hover:text-emerald-300 transition-all duration-300 shrink-0">
                  {icon}
                </span>
                <div className="min-w-0">
                  <span className="font-medium text-gray-200 group-hover:text-emerald-300 transition-colors duration-300 font-mono text-sm sm:text-base">
                    {label}
                  </span>
                  <p className="text-[10px] font-mono text-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                    {command}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                <span className="text-gray-500 text-xs sm:text-sm group-hover:text-emerald-400 transition-colors duration-300 font-mono truncate max-w-[120px] sm:max-w-none">
                  {handle}
                </span>
                {/* Arrow */}
                <svg
                  className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* TERMINAL FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16"
        >
          <div className="border-t border-emerald-500/20 pt-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-xs font-mono">[root@portfolio]</span>
                <span className="text-gray-500 text-xs font-mono">$</span>
                <span className="text-gray-400 text-xs font-mono animate-pulse">./deploy_connection.sh --status=ready</span>
              </div>
              
              <div className="flex gap-4 text-[10px] font-mono text-gray-600">
                <span>© {new Date().getFullYear()}</span>
                <span>|</span>
                <Link
                  href="/admin"
                  className="hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
                  title="NOC Command Center (Admin)"
                >
                  SECURE_SHELL_v2.0
                </Link>
                <span>|</span>
                <span className="text-emerald-500/50">ENCRYPTED_CONNECTION</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      
    </section>
  );
}