"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { navLinks } from "@/src/data/navLinks";
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineFolderOpen,
  HiOutlineMail,
  HiOutlineMenu,
  HiOutlineX,
} from "react-icons/hi";

const iconMap: Record<string, React.ReactNode> = {
  Home: <HiOutlineHome className="w-6 h-6" />,
  About: <HiOutlineUser className="w-6 h-6" />,
  Projects: <HiOutlineFolderOpen className="w-6 h-6" />,
  Contact: <HiOutlineMail className="w-6 h-6" />,
};

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const lenis = useLenis();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (window.innerWidth < 1024) {
      setIsVisible(false);
    }
    const hash = href.includes("#") ? href.substring(href.indexOf("#")) : "";
    if (hash) {
      e.preventDefault();
      const target = document.querySelector(hash);
      if (target) {
        if (lenis) {
          lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  // Initialize visibility logic safely after hydration to avoid mismatch
  useEffect(() => {
    // A small timeout ensures this doesn't trigger synchronous cascading render warnings
    const timer = setTimeout(() => {
      if (window.innerWidth >= 1024) {
        setIsVisible(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Active section tracking with IntersectionObserver (zero layout thrashing)
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length > 0) {
        visible.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        setActiveSection(visible[0].target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-15% 0px -35% 0px",
      threshold: [0, 0.2, 0.5],
    });

    navLinks.forEach(({ href }) => {
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Floating Toggle Button (Visible when navbar is hidden) */}
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed left-1 top-[27%] -translate-y-1/2 z-40 p-3 rounded-full bg-black/60 border border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/40 hover:scale-110 backdrop-blur-md transition-all duration-300 shadow-lg shadow-black/50 ${
          isVisible
            ? "opacity-0 pointer-events-none scale-50"
            : "opacity-100 scale-100"
        }`}
        aria-label="Open Navigation"
      >
        <HiOutlineMenu className="w-5 h-5" />
      </button>

      {/* Mobile Backdrop overlay to close when tapped outside */}
      {isVisible && (
        <div
          onClick={() => setIsVisible(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Vertical Navbar - Changed from bg-black/80 to glass blur */}
      <nav
        className={`fixed left-0 top-1/2 -translate-y-1/2 w-20 backdrop-blur-xl bg-white/5 border-y border-r border-emerald-900/40 rounded-r-3xl z-50 flex flex-col items-center py-8 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl shadow-emerald-900/20 ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -right-1 -top-3 p-1.5 bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-full text-gray-400 hover:text-emerald-300 hover:scale-110 hover:bg-emerald-900/80 transition-all z-10"
          aria-label="Close Navigation"
        >
          <HiOutlineX className="w-4 h-4" />
        </button>

        {/* Logo */}
        <Link
          href="/#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="mb-8 group flex items-center justify-center relative w-10 h-10"
        >
          <Image
            src="/Logo.png"
            alt="Tandith Logo"
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            sizes="40px"
          />
        </Link>

        {/* Divider */}
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mb-6" />

        {/* Links */}
        <div className="flex flex-col gap-4 w-full items-center relative flex-1">
          {navLinks.map(({ label, href }) => {
            const id = href.replace("#", "");
            const isActive = activeSection === id;

            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className={`group relative flex flex-col items-center justify-center p-1.5 w-14 h-14 transition-all duration-300 rounded-full z-10 ${
                  isActive
                    ? "text-emerald-50"
                    : "text-gray-400 hover:text-emerald-300 hover:scale-105"
                }`}
              >
                {/* Active Blob Background */}
                {isActive && (
                  <div
                    className="absolute inset-[6px] bg-gradient-to-tr from-emerald-600/40 to-teal-400/20 shadow-[0_0_12px_rgba(16,185,129,0.2)] backdrop-blur-sm -z-10 animate-nav-blob"
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-1 transition-transform duration-300">
                  {iconMap[label] || <HiOutlineHome className="w-5 h-5" />}
                  <span
                    className={`text-[10px] tracking-wider font-medium transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}