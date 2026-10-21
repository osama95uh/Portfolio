"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches || !cursorRef.current) return;

    const cursor = cursorRef.current;
    let animationFrame = 0;

    const moveCursor = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
        cursor.classList.add("is-visible");
      });
    };

    const updateInteractiveState = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      cursor.classList.toggle(
        "is-interactive",
        Boolean(event.target.closest("a, button, input, textarea, select, label, [role='button']"))
      );
    };

    const hideCursor = () => {
      cursor.classList.remove("is-visible", "is-interactive", "is-pressed");
    };
    const pressCursor = () => cursor.classList.add("is-pressed");
    const releaseCursor = () => cursor.classList.remove("is-pressed");

    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("pointerover", updateInteractiveState);
    window.addEventListener("pointerout", updateInteractiveState);
    window.addEventListener("pointerdown", pressCursor);
    window.addEventListener("pointerup", releaseCursor);
    window.addEventListener("pointercancel", releaseCursor);
    window.addEventListener("blur", hideCursor);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("pointerover", updateInteractiveState);
      window.removeEventListener("pointerout", updateInteractiveState);
      window.removeEventListener("pointerdown", pressCursor);
      window.removeEventListener("pointerup", releaseCursor);
      window.removeEventListener("pointercancel", releaseCursor);
      window.removeEventListener("blur", hideCursor);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
      <span className="custom-cursor__ring" />
      <span className="custom-cursor__dot" />
    </div>
  );
}