"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface InteractivePetTrioProps {
  className?: string;
}

export function InteractivePetTrio({ className = "" }: InteractivePetTrioProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPet, setHoveredPet] = useState<"dog" | "cat" | "bunny" | null>(null);
  const [isAwake, setIsAwake] = useState(true);
  const [blinking, setBlinking] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState<{ pet: "dog" | "cat" | "bunny"; text: string } | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; symbol: string }>>([]);

  // Normalized cursor look coordinates (-1 to 1)
  const [lookPos, setLookPos] = useState({ x: 0, y: 0 });
  const [currentLook, setCurrentLook] = useState({ x: 0, y: 0 });

  const animFrameRef = useRef<number | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track cursor relative to footer
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.65;
    const clampedDist = Math.min(distance / maxDist, 1);
    const angle = Math.atan2(dy, dx);

    const targetX = Math.cos(angle) * clampedDist;
    const targetY = Math.sin(angle) * clampedDist;

    setLookPos({ x: targetX, y: targetY });
    setIsAwake(true);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsAwake(false);
    }, 5000);
  }, []);

  // Smooth lerp loop
  useEffect(() => {
    let active = true;

    const lerpLoop = () => {
      setCurrentLook((prev) => {
        const factor = 0.12;
        return {
          x: prev.x + (lookPos.x - prev.x) * factor,
          y: prev.y + (lookPos.y - prev.y) * factor,
        };
      });

      if (active) {
        animFrameRef.current = requestAnimationFrame(lerpLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(lerpLoop);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [handleMouseMove, lookPos]);

  // Periodic blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3500 + Math.random() * 4000;
      blinkTimerRef.current = setTimeout(() => {
        if (isAwake) {
          setBlinking(true);
          setTimeout(() => setBlinking(false), 160);
        }
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [isAwake]);

  // Pet interaction
  const triggerPet = (pet: "dog" | "cat" | "bunny", e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);

    const symbols = {
      dog: ["🐾", "🦴", "♥", "✨"],
      cat: ["🐾", "🐟", "💕", "✨"],
      bunny: ["🥕", "🌸", "💖", "✨"],
    };
    const randomSymbol = symbols[pet][Math.floor(Math.random() * symbols[pet].length)];
    const id = Date.now();

    setParticles((prev) => [...prev.slice(-5), { id, x, y, symbol: randomSymbol }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1200);

    const speechOptions = {
      dog: ["Woof! 🐶", "*wags tail*", "Good doggo! 🐾", "Boop! ✨"],
      cat: ["Purrr~ 🐱", "Meow! 💕", "*nuzzles*", "Prrrrt! 🐾"],
      bunny: ["Hop hop! 🐰", "*nose wiggle*", "Crunch crunch 🥕", "Squeak! 💖"],
    };
    const speech = speechOptions[pet][Math.floor(Math.random() * speechOptions[pet].length)];
    setActiveSpeech({ pet, text: speech });
    setTimeout(() => setActiveSpeech(null), 2000);
  };

  // Tracking offsets
  const lookX = currentLook.x;
  const lookY = currentLook.y;

  return (
    <div
      ref={containerRef}
      className={`interactive-pet-trio relative select-none ${className}`}
      aria-label="Interactive pet trio watching your cursor"
    >
      {/* Active Speech / Reaction Bubble */}
      {activeSpeech && (
        <div
          className={`absolute -top-10 z-30 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-full text-xs font-bold shadow-md animate-bounce pointer-events-none whitespace-nowrap transition-all ${
            activeSpeech.pet === "dog"
              ? "left-6"
              : activeSpeech.pet === "cat"
              ? "left-1/2 -translate-x-1/2"
              : "right-6"
          }`}
        >
          {activeSpeech.text}
        </div>
      )}

      {/* Floating Click Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute pointer-events-none text-base font-bold z-40 select-none animate-float-up"
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
        >
          {p.symbol}
        </span>
      ))}

      {/* Sleep ZZZ when idle */}
      {!isAwake && (
        <div className="absolute -top-4 right-1/2 translate-x-1/2 flex items-center gap-1 pointer-events-none">
          <span className="cat-z cat-z1 text-amber-800/70 text-xs font-bold">z</span>
          <span className="cat-z cat-z2 text-amber-800/80 text-sm font-bold">z</span>
          <span className="cat-z cat-z3 text-amber-800 text-base font-bold">Z</span>
        </div>
      )}

      {/* The Multi-Pet Trio SVG */}
      <svg
        viewBox="0 0 380 160"
        className="w-full h-auto max-w-[380px] drop-shadow-sm overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="dogFur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5bb73" />
            <stop offset="100%" stopColor="#d9822b" />
          </linearGradient>

          <linearGradient id="catFur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f3e8dc" />
          </linearGradient>

          <linearGradient id="catPatch" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c2632b" />
            <stop offset="100%" stopColor="#8d3d14" />
          </linearGradient>

          <linearGradient id="bunnyFur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffdfa" />
            <stop offset="100%" stopColor="#e8ded1" />
          </linearGradient>

          <linearGradient id="innerPink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>

        {/* ----------------- 1. DOG (LEFT) ----------------- */}
        <g
          className="pet-group cursor-pointer transition-transform duration-200"
          transform={`translate(65, 95) ${hoveredPet === "dog" ? "scale(1.06)" : "scale(1)"}`}
          onMouseEnter={() => setHoveredPet("dog")}
          onMouseLeave={() => setHoveredPet(null)}
          onClick={(e) => triggerPet("dog", e)}
        >
          {/* Dog Head with dynamic cursor tilt */}
          <g
            style={{
              transform: `translate(${lookX * 5}px, ${lookY * 4}px) rotate(${lookX * 10}deg)`,
              transformOrigin: "0px 0px",
              transition: "transform 0.08s ease-out",
            }}
          >
            {/* Floppy Left Ear */}
            <path
              d="M -32 -20 C -48 -10 -50 20 -38 32 C -30 38 -24 15 -22 0 Z"
              fill="#b45309"
              stroke="#2d221b"
              strokeWidth="3.5"
              style={{
                transform: `rotate(${lookX * -6}deg)`,
                transformOrigin: "-28px -15px",
              }}
            />

            {/* Floppy Right Ear */}
            <path
              d="M 28 -20 C 44 -10 48 20 36 32 C 28 38 22 15 20 0 Z"
              fill="#b45309"
              stroke="#2d221b"
              strokeWidth="3.5"
              style={{
                transform: `rotate(${lookX * -6}deg)`,
                transformOrigin: "26px -15px",
              }}
            />

            {/* Dog Head Base */}
            <circle cx="0" cy="0" r="32" fill="url(#dogFur)" stroke="#2d221b" strokeWidth="3.5" />

            {/* Forehead Patch */}
            <path d="M -6 -32 Q 0 -15 6 -32 Z" fill="#b45309" />

            {/* Dog Eyes */}
            {isAwake && !blinking ? (
              <g className="dog-eyes">
                <ellipse cx="-12" cy="-4" rx="5" ry="6" fill="#2d221b" />
                <ellipse cx="12" cy="-4" rx="5" ry="6" fill="#2d221b" />
                {/* Catchlight offsets */}
                <circle cx={-12 + lookX * 2.2} cy={-5 + lookY * 2} r="2" fill="#ffffff" />
                <circle cx={12 + lookX * 2.2} cy={-5 + lookY * 2} r="2" fill="#ffffff" />
              </g>
            ) : (
              <g className="dog-eyes-sleep" stroke="#2d221b" strokeWidth="3" strokeLinecap="round">
                <path d="M -17 -3 Q -12 2 -7 -3" fill="none" />
                <path d="M 7 -3 Q 12 2 17 -3" fill="none" />
              </g>
            )}

            {/* Snout */}
            <ellipse cx="0" cy="11" rx="14" ry="10" fill="#fffaf2" stroke="#2d221b" strokeWidth="2.5" />

            {/* Black Nose */}
            <ellipse cx="0" cy="6" rx="6" ry="4.5" fill="#2d221b" />

            {/* Mouth / Tongue */}
            {hoveredPet === "dog" ? (
              <g className="dog-tongue">
                <path d="M -5 13 Q 0 17 5 13" fill="none" stroke="#2d221b" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M -3 14 Q 0 25 3 14 Z" fill="#f87171" stroke="#2d221b" strokeWidth="1.5" />
              </g>
            ) : (
              <path d="M -5 13 Q 0 17 5 13" fill="none" stroke="#2d221b" strokeWidth="2.5" strokeLinecap="round" />
            )}

            {/* Cheeks */}
            <circle cx="-18" cy="7" r="4.5" fill="#f43f5e" opacity="0.4" />
            <circle cx="18" cy="7" r="4.5" fill="#f43f5e" opacity="0.4" />
          </g>

          {/* Peeking Front Paws resting on the border */}
          <g className="dog-paws" stroke="#2d221b" strokeWidth="2.5">
            <ellipse cx="-20" cy="34" rx="9" ry="7" fill="#fffaf2" />
            <ellipse cx="20" cy="34" rx="9" ry="7" fill="#fffaf2" />
          </g>
        </g>

        {/* ----------------- 2. KITTEN (CENTER) ----------------- */}
        <g
          className="pet-group cursor-pointer transition-transform duration-200"
          transform={`translate(190, 88) ${hoveredPet === "cat" ? "scale(1.06)" : "scale(1)"}`}
          onMouseEnter={() => setHoveredPet("cat")}
          onMouseLeave={() => setHoveredPet(null)}
          onClick={(e) => triggerPet("cat", e)}
        >
          {/* Cat Head with dynamic cursor tilt */}
          <g
            style={{
              transform: `translate(${lookX * 6}px, ${lookY * 4.5}px) rotate(${lookX * 12}deg)`,
              transformOrigin: "0px 0px",
              transition: "transform 0.08s ease-out",
            }}
          >
            {/* Left Pointed Ear */}
            <g style={{ transform: `rotate(${lookX * -4}deg)`, transformOrigin: "-20px -25px" }}>
              <polygon points="-28,-10 -20,-42 -4,-18" fill="url(#catPatch)" stroke="#2d221b" strokeWidth="3.5" strokeLinejoin="round" />
              <polygon points="-24,-13 -19,-35 -8,-18" fill="url(#innerPink)" />
            </g>

            {/* Right Pointed Ear */}
            <g style={{ transform: `rotate(${lookX * -4}deg)`, transformOrigin: "20px -25px" }}>
              <polygon points="4,-18 20,-42 28,-10" fill="#2d221b" stroke="#2d221b" strokeWidth="3.5" strokeLinejoin="round" />
              <polygon points="8,-18 19,-35 24,-13" fill="url(#innerPink)" />
            </g>

            {/* Cat Head Base */}
            <circle cx="0" cy="0" r="30" fill="url(#catFur)" stroke="#2d221b" strokeWidth="3.5" />

            {/* Calico eye patch */}
            <path d="M 6 -28 C 18 -26 28 -12 28 8 C 18 18 8 14 3 -5 Z" fill="url(#catPatch)" opacity="0.9" />

            {/* Cat Eyes */}
            {isAwake && !blinking ? (
              <g className="cat-eyes">
                <ellipse cx="-11" cy="-3" rx="7" ry="8" fill="#fffdfa" stroke="#2d221b" strokeWidth="2.5" />
                <circle cx={-11 + lookX * 4} cy={-3 + lookY * 3.5} r="5" fill="#4ade80" stroke="#15803d" strokeWidth="1.2" />
                <ellipse cx={-11 + lookX * 4} cy={-3 + lookY * 3.5} rx="2.5" ry="4" fill="#1c1917" />
                <circle cx={-13 + lookX * 2.8} cy={-5 + lookY * 2.5} r="1.6" fill="#ffffff" />

                <ellipse cx="11" cy="-3" rx="7" ry="8" fill="#fffdfa" stroke="#2d221b" strokeWidth="2.5" />
                <circle cx={11 + lookX * 4} cy={-3 + lookY * 3.5} r="5" fill="#4ade80" stroke="#15803d" strokeWidth="1.2" />
                <ellipse cx={11 + lookX * 4} cy={-3 + lookY * 3.5} rx="2.5" ry="4" fill="#1c1917" />
                <circle cx={9 + lookX * 2.8} cy={-5 + lookY * 2.5} r="1.6" fill="#ffffff" />
              </g>
            ) : (
              <g className="cat-eyes-sleep" stroke="#2d221b" strokeWidth="3" strokeLinecap="round">
                <path d="M -17 -2 Q -11 3 -5 -2" fill="none" />
                <path d="M 5 -2 Q 11 3 17 -2" fill="none" />
              </g>
            )}

            {/* Pink Nose */}
            <polygon points="0,5 -3.5,2 3.5,2" fill="#f472b6" stroke="#2d221b" strokeWidth="1.5" strokeLinejoin="round" />

            {/* Cat Mouth */}
            <path d="M -5 8 Q -2 12 0 8 Q 2 12 5 8" fill="none" stroke="#2d221b" strokeWidth="2.2" strokeLinecap="round" />

            {/* Cute Whiskers */}
            <g stroke="#4a3728" strokeWidth="1.8" strokeLinecap="round">
              <line x1="-9" y1="7" x2="-28" y2="4" />
              <line x1="-9" y1="9" x2="-30" y2="10" />
              <line x1="9" y1="7" x2="28" y2="4" />
              <line x1="9" y1="9" x2="30" y2="10" />
            </g>

            {/* Rosy Cheeks */}
            <circle cx="-19" cy="8" r="4.5" fill="#fb7185" opacity="0.45" />
            <circle cx="19" cy="8" r="4.5" fill="#fb7185" opacity="0.45" />
          </g>

          {/* Peeking Front Paws */}
          <g className="cat-paws" stroke="#2d221b" strokeWidth="2.5">
            <ellipse cx="-16" cy="33" rx="8" ry="6.5" fill="#ffffff" />
            <ellipse cx="16" cy="33" rx="8" ry="6.5" fill="#ffffff" />
          </g>
        </g>

        {/* ----------------- 3. BUNNY (RIGHT) ----------------- */}
        <g
          className="pet-group cursor-pointer transition-transform duration-200"
          transform={`translate(315, 95) ${hoveredPet === "bunny" ? "scale(1.06)" : "scale(1)"}`}
          onMouseEnter={() => setHoveredPet("bunny")}
          onMouseLeave={() => setHoveredPet(null)}
          onClick={(e) => triggerPet("bunny", e)}
        >
          {/* Bunny Head with dynamic cursor tilt */}
          <g
            style={{
              transform: `translate(${lookX * 5}px, ${lookY * 4}px) rotate(${lookX * 8}deg)`,
              transformOrigin: "0px 0px",
              transition: "transform 0.08s ease-out",
            }}
          >
            {/* Long Left Ear */}
            <g style={{ transform: `rotate(${lookX * -8 - 5}deg)`, transformOrigin: "-12px -28px" }}>
              <ellipse cx="-14" cy="-48" rx="8" ry="24" fill="url(#bunnyFur)" stroke="#2d221b" strokeWidth="3.5" />
              <ellipse cx="-14" cy="-48" rx="4.5" ry="17" fill="url(#innerPink)" />
            </g>

            {/* Long Right Ear */}
            <g style={{ transform: `rotate(${lookX * -8 + 5}deg)`, transformOrigin: "12px -28px" }}>
              <ellipse cx="14" cy="-48" rx="8" ry="24" fill="url(#bunnyFur)" stroke="#2d221b" strokeWidth="3.5" />
              <ellipse cx="14" cy="-48" rx="4.5" ry="17" fill="url(#innerPink)" />
            </g>

            {/* Bunny Head Base */}
            <circle cx="0" cy="0" r="30" fill="url(#bunnyFur)" stroke="#2d221b" strokeWidth="3.5" />

            {/* Bunny Big Bright Eyes */}
            {isAwake && !blinking ? (
              <g className="bunny-eyes">
                <circle cx="-11" cy="-3" r="6" fill="#3b2d24" />
                <circle cx="11" cy="-3" r="6" fill="#3b2d24" />
                {/* Catchlight */}
                <circle cx={-12 + lookX * 2.5} cy={-5 + lookY * 2.2} r="2.2" fill="#ffffff" />
                <circle cx={-9 + lookX * 2.5} cy={-1 + lookY * 2.2} r="1.1" fill="#ffffff" />
                <circle cx={10 + lookX * 2.5} cy={-5 + lookY * 2.2} r="2.2" fill="#ffffff" />
                <circle cx={13 + lookX * 2.5} cy={-1 + lookY * 2.2} r="1.1" fill="#ffffff" />
              </g>
            ) : (
              <g className="bunny-eyes-sleep" stroke="#2d221b" strokeWidth="3" strokeLinecap="round">
                <path d="M -16 -2 Q -11 3 -6 -2" fill="none" />
                <path d="M 6 -2 Q 11 3 16 -2" fill="none" />
              </g>
            )}

            {/* Cute Twitching Pink Nose (Y-shape) */}
            <polygon points="0,5 -3,2 3,2" fill="#f472b6" stroke="#2d221b" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 0 5 L 0 8 M -3 9 Q 0 11 3 9" fill="none" stroke="#2d221b" strokeWidth="2" strokeLinecap="round" />

            {/* Rosy Cheeks */}
            <circle cx="-17" cy="6" r="5" fill="#f43f5e" opacity="0.45" />
            <circle cx="17" cy="6" r="5" fill="#f43f5e" opacity="0.45" />

            {/* Tiny Bunny Whiskers */}
            <g stroke="#60493b" strokeWidth="1.5" strokeLinecap="round">
              <line x1="-8" y1="7" x2="-24" y2="5" />
              <line x1="-8" y1="9" x2="-25" y2="10" />
              <line x1="8" y1="7" x2="24" y2="5" />
              <line x1="8" y1="9" x2="25" y2="10" />
            </g>
          </g>

          {/* Peeking Front Paws */}
          <g className="bunny-paws" stroke="#2d221b" strokeWidth="2.5">
            <ellipse cx="-15" cy="33" rx="7.5" ry="6" fill="#fffdfa" />
            <ellipse cx="15" cy="33" rx="7.5" ry="6" fill="#fffdfa" />
          </g>
        </g>
      </svg>
    </div>
  );
}
