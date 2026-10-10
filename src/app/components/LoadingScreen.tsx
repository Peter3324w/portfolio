"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";

export interface LoadingScreenHandle {
  replay: () => void;
}

// Module-level flag: persists across client-side nav (same tab session) but
// resets on hard reload. Lets us show the intro on first visit/reload, and
// skip it when returning via Link from /about etc.
let hasShownLoading = false;

interface LoadingScreenProps {
  onComplete?: () => void;
}

function runPortalReveal(
  screen: HTMLDivElement,
  onDone: () => void
) {
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);
  const hero = document.querySelector(".hero-section") as HTMLElement | null;
  const feather = 80;

  if (hero) {
    hero.style.transform = "scale(1.15)";
    hero.style.transformOrigin = "center center";
    gsap.to(hero, { scale: 1, duration: 3.2, ease: "power2.out" });
  }

  const portal = { r: 0 };
  gsap.to(portal, {
    r: maxRadius,
    duration: 3.2,
    ease: "power2.inOut",
    onUpdate: () => {
      const r = portal.r;
      const mask = `radial-gradient(circle ${r}px at 50% 50%, transparent ${Math.max(
        0,
        r - feather
      )}px, black ${r + feather}px)`;
      screen.style.maskImage = mask;
      screen.style.webkitMaskImage = mask;
    },
    onComplete: onDone,
  });
}

const LoadingScreen = forwardRef<LoadingScreenHandle, LoadingScreenProps>(
  function LoadingScreen({ onComplete }, ref) {
    const barRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const screenRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef(0);
    const [progress, setProgress] = useState(0);
    const [decodedText, setDecodedText] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [showIntro, setShowIntro] = useState(true);

    const target = "PETER PHIRI";
    const targetChars = target.split("");

    const runePool = [
      "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ",
      "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ",
      "ᛚ", "ᛜ", "ᛞ", "ᛟ", "ᚼ", "ᚽ", "ᛉ", "ᚴ",
    ];

    useImperativeHandle(ref, () => ({
      replay: () => {
        flushSync(() => {
          setShowIntro(false);
          setIsVisible(true);
        });
        const screen = screenRef.current;
        if (!screen) return;
        screen.style.maskImage = "none";
        screen.style.webkitMaskImage = "none";
        runPortalReveal(screen, () => {
          setIsVisible(false);
        });
      },
    }));

    const skippedRef = useRef(false);

    // Runs before browser paint — if we're returning via nav, hide before the
    // black overlay ever shows (eliminates the flash).
    useLayoutEffect(() => {
      if (hasShownLoading) {
        skippedRef.current = true;
        setIsVisible(false);
        onComplete?.();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (skippedRef.current) return;

      const screen = screenRef.current;
      if (!screen) return;

      // Signal to TopoBackground (and any other expensive background loop)
      // that the loading overlay is active. Cleared when the portal reveal
      // finishes and the overlay unmounts.
      document.documentElement.dataset.topoPaused = "1";

      const tweenObj = { val: 0 };
      const progressTween = gsap.to(tweenObj, {
        val: 100,
        duration: 3.5,
        ease: "power2.out",
        onUpdate: () => {
          const val = Math.round(tweenObj.val);
          progressRef.current = val;
          setProgress(val);
        },
        onComplete: () => {
          clearInterval(scrambleInterval);
          setDecodedText(target);

          gsap.to(".loading-content", {
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
            onComplete: () => {
              runPortalReveal(screen, () => {
                delete document.documentElement.dataset.topoPaused;
                setIsVisible(false);
              });
              gsap.delayedCall(1.8, () => {
                hasShownLoading = true;
                onComplete?.();
              });
            },
          });
        },
      });

      const CHAR_SWITCH_MS = 180;

      const scrambleInterval = setInterval(() => {
        const currentProgress = progressRef.current;

        setDecodedText(
          targetChars
            .map((char, index) => {
              const lockAt = ((index + 1) / targetChars.length) * 100;

              if (char === " ") return "\u00A0";
              if (currentProgress >= lockAt) return char;

              return runePool[Math.floor(Math.random() * runePool.length)];
            })
            .join("")
        );
      }, CHAR_SWITCH_MS);

      setDecodedText(
        targetChars
          .map((char) =>
            char === " "
              ? "\u00A0"
              : runePool[Math.floor(Math.random() * runePool.length)]
          )
          .join("")
      );

      return () => {
        progressTween.kill();
        clearInterval(scrambleInterval);
        // Ensure the pause flag is cleared even if the effect tears down
        // before the reveal completes (fast nav, Strict Mode double-mount).
        delete document.documentElement.dataset.topoPaused;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isVisible) return null;

    return (
      <div
        ref={screenRef}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      >
        {showIntro && (
          <div className="loading-content w-48 md:w-64 mb-8">
            <div
              ref={textRef}
              className="text-center text-base md:text-base font-mono tracking-wider text-white mb-2"
            >
              {decodedText}
            </div>

            <div className="relative h-0.5 w-full rounded-full overflow-hidden bg-[rgba(255,255,255,0.3)]">
              <div
                ref={barRef}
                className="absolute left-0 top-0 h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default LoadingScreen;
