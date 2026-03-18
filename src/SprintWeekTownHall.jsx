import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Globe,
  Rocket,
  Users,
  Calendar,
  MapPin,
  Coffee,
  Handshake,
  BookOpen,
  Mic2,
  Clock,
  Sun,
  Sunset,
  Moon,
  Smile,
  Wifi,
  Smartphone,
  Phone,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Star,
  Target,
  Menu,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────
// DESIGN TOKENS (from tbdcdesign.md)
// ─────────────────────────────────────────────
const COLORS = {
  navy: "#0A1628",
  navyLight: "#0f1f38",
  teal: "#00A88E",
  tealDark: "#008c76",
  warmWhite: "#FAF8F5",
  sand: "#F0ECE3",
  charcoal: "#1E293B",
  slate: "#64748B",
  gold: "#D4A843",
};

const FONTS = {
  heading: "'Plus Jakarta Sans', sans-serif",
  serif: "'Instrument Serif', serif",
  body: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ─────────────────────────────────────────────
// NOISE OVERLAY (global cinematic texture)
// ─────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0.04,
      }}
    >
      <svg width="100%" height="100%">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROGRESS BAR (top of viewport)
// ─────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 2,
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: "100%",
          background: COLORS.teal,
          transition: "width 0.3s ease-out",
          width: `${((current + 1) / total) * 100}%`,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// SLIDE COUNTER (mono font, e.g. "04 / 16")
// ─────────────────────────────────────────────
function SlideCounter({ current, total }) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <span
      style={{
        fontFamily: FONTS.mono,
        fontSize: 14,
        fontWeight: 700,
        color: "rgba(255,255,255,0.5)",
      }}
    >
      {pad(current + 1)} / {pad(total)}
    </span>
  );
}

// ─────────────────────────────────────────────
// CONTROL BAR (bottom, auto-hiding)
// ─────────────────────────────────────────────
function ControlBar({ current, total, onPrev, onNext, onFullscreen, isFullscreen, visible }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(10,22,40,0.9)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(100%)",
      }}
    >
      <SlideCounter current={current} total={total} />
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onPrev}
          aria-label="Previous slide"
          style={{
            color: "rgba(255,255,255,0.5)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#fff")}
          onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.5)")}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={onNext}
          aria-label="Next slide"
          style={{
            color: "rgba(255,255,255,0.5)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#fff")}
          onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.5)")}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      <button
        onClick={onFullscreen}
        aria-label="Toggle fullscreen"
        style={{
          color: "rgba(255,255,255,0.5)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 8,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.color = "#fff")}
        onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.5)")}
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// TABLE OF CONTENTS OVERLAY
// ─────────────────────────────────────────────
function TableOfContents({ slides, current, onSelect, open, onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,22,40,0.85)",
          backdropFilter: "blur(8px)",
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: "relative",
          zIndex: 81,
          width: 420,
          maxWidth: "90vw",
          height: "100vh",
          background: COLORS.navy,
          borderRight: "1px solid rgba(255,255,255,0.1)",
          overflowY: "auto",
          padding: "48px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.teal,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Table of Contents
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => {
              onSelect(i);
              onClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: "none",
              background: i === current ? "rgba(0,168,142,0.15)" : "transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.2s",
              marginBottom: 4,
            }}
            onMouseEnter={(e) => {
              if (i !== current) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              if (i !== current) e.currentTarget.style.background = "transparent";
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                fontWeight: 700,
                color: i === current ? COLORS.teal : "rgba(255,255,255,0.3)",
                minWidth: 28,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 14,
                fontWeight: 500,
                color: i === current ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              {slide.tocTitle || slide.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────

function Eyebrow({ children, light = false }) {
  return (
    <p
      style={{
        fontFamily: FONTS.mono,
        fontSize: 13,
        fontWeight: 700,
        color: COLORS.teal,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  );
}

function SlideTitle({ children, dark = true }) {
  return (
    <h1
      style={{
        fontFamily: FONTS.heading,
        fontWeight: 800,
        fontSize: "clamp(2rem, 5vw, 3.75rem)",
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: dark ? "#fff" : COLORS.charcoal,
        margin: 0,
        marginBottom: 16,
      }}
    >
      {children}
    </h1>
  );
}

function AccentText({ children }) {
  return (
    <span
      style={{
        fontFamily: FONTS.serif,
        fontStyle: "italic",
        color: COLORS.teal,
      }}
    >
      {children}
    </span>
  );
}

function BodyText({ children, dark = true }) {
  return (
    <p
      style={{
        fontFamily: FONTS.body,
        fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
        lineHeight: 1.7,
        color: dark ? "rgba(255,255,255,0.7)" : "rgba(30,41,59,0.8)",
        maxWidth: 640,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

function TealBullet({ items, dark = true }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: COLORS.teal,
              marginTop: 8,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: FONTS.body,
              fontSize: "clamp(0.95rem, 1.3vw, 1.15rem)",
              lineHeight: 1.6,
              color: dark ? "rgba(255,255,255,0.7)" : "rgba(30,41,59,0.8)",
            }}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DarkCard({ icon: Icon, title, description, accent = false }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderLeft: accent ? `3px solid ${COLORS.teal}` : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: "28px 24px",
      }}
    >
      {Icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(0,168,142,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Icon size={22} color={COLORS.teal} />
        </div>
      )}
      <h3
        style={{
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
          color: "#fff",
          margin: 0,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: "clamp(0.85rem, 1.1vw, 1rem)",
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.6)",
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function LightCard({ icon: Icon, title, description, number }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "28px 24px",
        border: "1px solid rgba(203,213,225,0.5)",
        borderLeft: `3px solid ${COLORS.teal}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {number && (
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 12,
            fontFamily: FONTS.mono,
            fontSize: "clamp(3rem, 5vw, 5rem)",
            fontWeight: 800,
            color: "rgba(30,41,59,0.03)",
            pointerEvents: "none",
          }}
        >
          {number}
        </span>
      )}
      {Icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(0,168,142,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Icon size={22} color={COLORS.teal} />
        </div>
      )}
      <h3
        style={{
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
          color: COLORS.charcoal,
          margin: 0,
          marginBottom: 8,
          position: "relative",
          zIndex: 1,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)",
          lineHeight: 1.6,
          color: "rgba(30,41,59,0.7)",
          margin: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {description}
      </p>
    </div>
  );
}

// Placeholder graphic component for slides that need imagery
function PlaceholderGraphic({ label, width = "100%", height = 280 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${COLORS.navyLight}, ${COLORS.navy})`,
        border: "1px dashed rgba(0,168,142,0.3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "rgba(0,168,142,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Star size={24} color={COLORS.teal} />
      </div>
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: 11,
          color: "rgba(0,168,142,0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// SLIDE WRAPPER (viewport-locked)
// ─────────────────────────────────────────────
function Slide({ bg = COLORS.navy, children }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        background: bg,
      }}
    >
      {children}
    </div>
  );
}

function SlideContent({ children, center = false, maxWidth = 1152 }) {
  return (
    <div
      style={{
        maxWidth,
        width: "100%",
        margin: "0 auto",
        padding: "64px clamp(32px, 5vw, 80px)",
        textAlign: center ? "center" : "left",
      }}
    >
      {children}
    </div>
  );
}

// Decorative blur circle
function BlurCircle({ top = "50%", left = "50%", size = 600, opacity = 0.03 }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        transform: "translate(-50%, -50%)",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `rgba(0,168,142,${opacity})`,
        filter: "blur(80px)",
        pointerEvents: "none",
      }}
    />
  );
}

// ─────────────────────────────────────────────
// INDIVIDUAL SLIDES
// ─────────────────────────────────────────────

// SLIDE 1 — Title
function Slide01() {
  return (
    <Slide bg={COLORS.navy}>
      <BlurCircle top="40%" left="60%" />
      {/* Placeholder: very subtle Toronto skyline background at 6% opacity */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          background: `linear-gradient(180deg, transparent 40%, ${COLORS.teal}22 100%)`,
        }}
      />
      <SlideContent center maxWidth={900}>
        <Eyebrow>March 26, 2025 · Team Briefing</Eyebrow>
        <SlideTitle>
          Sprint Week{" "}
          <AccentText>Town Hall.</AccentText>
        </SlideTitle>
        <BodyText>
          How we deliver a world-class founder experience — together.
        </BodyText>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 2 — Why This Matters
function Slide02() {
  return (
    <Slide bg={COLORS.warmWhite}>
      <SlideContent maxWidth={1100}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 5vw, 80px)", alignItems: "center" }}>
          <div>
            <Eyebrow>Why This Matters</Eyebrow>
            <SlideTitle dark={false}>
              First impressions <AccentText>matter.</AccentText>
            </SlideTitle>
            <div style={{ marginTop: 24 }}>
              <TealBullet
                dark={false}
                items={[
                  "Sprint Week is one of the most visible experiences we deliver for international founders.",
                  "For many, this is their first time engaging with TBDC and the Canadian startup ecosystem in person.",
                  "How we show up as a team during this week directly shapes their perception of our organization.",
                ]}
              />
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: 360,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/Slide2.jpg`}
              alt="Founders networking at TBDC Sprint Week event"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 3 — Section Divider: Programs
function Slide03() {
  return (
    <Slide bg={COLORS.navy}>
      <BlurCircle top="50%" left="50%" size={500} />
      <SlideContent center maxWidth={800}>
        <Eyebrow>Part 01</Eyebrow>
        <SlideTitle>
          The <AccentText>Programs.</AccentText>
        </SlideTitle>
        <BodyText>
          Understanding Horizon and Pivot — and the founders they serve.
        </BodyText>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 4 — Horizon & Pivot Programs
function Slide04() {
  return (
    <Slide bg={COLORS.sand}>
      <SlideContent maxWidth={1100}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>Two Programs, One Mission</Eyebrow>
          <SlideTitle dark={false}>
            Where Sprint Week <AccentText>fits.</AccentText>
          </SlideTitle>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <LightCard
            icon={Globe}
            title="Horizon"
            description="Supports founders from European markets who are exploring or entering North America. Funded through international partnerships focused on cross-border scaling."
            number="01"
          />
          <LightCard
            icon={Rocket}
            title="Pivot"
            description="Supports founders from outside Europe — primarily India and the Middle East — who have established revenue and are ready to expand into North American markets."
            number="02"
          />
        </div>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 15,
            color: "rgba(30,41,59,0.6)",
            textAlign: "center",
            marginTop: 32,
          }}
        >
          Both programs share the same programming model. The primary difference is geographic focus.
        </p>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 5 — Founder Journey (Scout → Sprint → Surge)
function Slide05() {
  return (
    <Slide bg={COLORS.navy}>
      <BlurCircle top="60%" left="30%" />
      <SlideContent maxWidth={1100}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>The Founder Journey</Eyebrow>
          <SlideTitle>
            Scout. Sprint. <AccentText>Surge.</AccentText>
          </SlideTitle>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          <DarkCard
            icon={BookOpen}
            title="Scout Report"
            description="A market-entry report we prepare that gives founders strategic insight on entering North America — tailored to their industry and stage."
            accent
          />
          <DarkCard
            icon={Target}
            title="Sprint Week"
            description="A one-week, in-person immersion in Toronto featuring structured programming, customer conversations, and ecosystem introductions."
            accent
          />
          <DarkCard
            icon={Rocket}
            title="Surge"
            description="A paid engagement model where founders work with experienced mentors and operators on specific growth challenges over an extended period."
            accent
          />
        </div>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 15,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
            marginTop: 32,
          }}
        >
          Not every founder participates in all three — but Sprint Week is often the central experience.
        </p>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 6 — What Sprint Week Is
function Slide06() {
  return (
    <Slide bg={COLORS.warmWhite}>
      <SlideContent maxWidth={1100}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 5vw, 80px)", alignItems: "center" }}>
          <div>
            <Eyebrow>What Sprint Week Is</Eyebrow>
            <SlideTitle dark={false}>
              A week of <AccentText>acceleration.</AccentText>
            </SlideTitle>
            <div style={{ marginTop: 24 }}>
              <TealBullet
                dark={false}
                items={[
                  "Full week of curated programming designed to accelerate North American market entry.",
                  "Founders meet customers, investors, mentors, and ecosystem partners.",
                  "They leave Toronto with stronger market insight, new connections, and clear next steps.",
                ]}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <LightCard icon={BookOpen} title="Educational Programming" description="Market entry, fundraising, regulatory insights." />
            <LightCard icon={Handshake} title="Curated Meetings" description="Tailored customer and investor introductions." />
            <LightCard icon={Users} title="Networking" description="Events, dinners, ecosystem gatherings." />
            <LightCard icon={Mic2} title="Mentor Engagement" description="Guidance from experienced operators." />
          </div>
        </div>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 7 — Dates & Logistics
function Slide07() {
  return (
    <Slide bg={COLORS.navy}>
      <BlurCircle top="30%" left="70%" />
      <SlideContent center maxWidth={900}>
        <Eyebrow>Upcoming Sprint Week</Eyebrow>
        <SlideTitle>
          March 22–27, <AccentText>2025.</AccentText>
        </SlideTitle>
        <BodyText>
          Sunday through Friday. Hosted at TBDC.
        </BodyText>
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            marginTop: 48,
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: Calendar, label: "6 Days", sub: "Sun – Fri" },
            { icon: MapPin, label: "TBDC HQ", sub: "111 Peter St" },
            { icon: Globe, label: "International", sub: "Multi-market cohort" },
          ].map(({ icon: Icon, label, sub }, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "24px 32px",
                textAlign: "center",
                minWidth: 180,
              }}
            >
              <Icon size={28} color={COLORS.teal} style={{ marginBottom: 12 }} />
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#fff",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 4,
                }}
              >
                {sub}
              </div>
            </div>
          ))}
        </div>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 8 — Section Divider: Weekly Flow
function Slide08() {
  return (
    <Slide bg={COLORS.sand}>
      <SlideContent center maxWidth={800}>
        <Eyebrow>Part 02</Eyebrow>
        <SlideTitle dark={false}>
          How the week <AccentText>flows.</AccentText>
        </SlideTitle>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: "clamp(1rem, 1.3vw, 1.15rem)",
            color: "rgba(30,41,59,0.7)",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          A structured rhythm of programming, meetings, and relationship building — from Sunday to Friday.
        </p>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 9 — Morning Programming
function Slide09() {
  return (
    <Slide bg={COLORS.navy}>
      <BlurCircle top="50%" left="40%" />
      <SlideContent maxWidth={1100}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 5vw, 80px)", alignItems: "center" }}>
          <div>
            <Eyebrow>Sunday Evening</Eyebrow>
            <SlideTitle>
              Welcome dinner & <AccentText>introductions.</AccentText>
            </SlideTitle>
            <BodyText>
              The week begins with an informal welcome dinner on Sunday evening. Founders meet each other, the programming team, and key TBDC staff in a relaxed setting before the week officially begins.
            </BodyText>
          </div>
          <div>
            <Eyebrow>Monday – Friday Mornings</Eyebrow>
            <SlideTitle>
              Group <AccentText>programming.</AccentText>
            </SlideTitle>
            <div style={{ marginTop: 16 }}>
              <TealBullet
                items={[
                  "Market entry strategy",
                  "Customer discovery frameworks",
                  "Fundraising and investor expectations",
                  "Regulatory and market insights",
                ]}
              />
            </div>
          </div>
        </div>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 10 — Afternoon Meetings
function Slide10() {
  return (
    <Slide bg={COLORS.warmWhite}>
      <SlideContent maxWidth={1100}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>Afternoons</Eyebrow>
          <SlideTitle dark={false}>
            Curated <AccentText>meetings.</AccentText>
          </SlideTitle>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 16,
              color: "rgba(30,41,59,0.7)",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            Afternoons are structured around smaller, tailored sessions — matched to each company's goals.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { icon: Users, title: "Customer Meetings", desc: "Validate product-market fit with real buyers." },
            { icon: Handshake, title: "Investor Conversations", desc: "Build relationships with Canadian and North American investors." },
            { icon: Mic2, title: "Mentor Sessions", desc: "One-on-one guidance from seasoned operators." },
            { icon: Globe, title: "Partner Introductions", desc: "Connect with ecosystem players and potential collaborators." },
          ].map(({ icon, title, desc }, i) => (
            <LightCard key={i} icon={icon} title={title} description={desc} />
          ))}
        </div>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 11 — Evening Events
function Slide11() {
  return (
    <Slide bg={COLORS.navy}>
      <BlurCircle top="40%" left="60%" size={500} />
      <SlideContent center maxWidth={900}>
        <Eyebrow>Evenings</Eyebrow>
        <SlideTitle>
          Networking & <AccentText>community.</AccentText>
        </SlideTitle>
        <BodyText>
          Several evenings throughout the week include networking events, founder dinners, and ecosystem gatherings. These informal touchpoints help founders build genuine relationships with the broader Toronto startup community.
        </BodyText>
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            marginTop: 48,
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: Coffee, label: "Networking Events" },
            { icon: Users, label: "Founder Dinners" },
            { icon: Globe, label: "Ecosystem Gatherings" },
          ].map(({ icon: Icon, label }, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Icon size={20} color={COLORS.teal} />
              <span style={{ fontFamily: FONTS.body, fontSize: 15, color: "rgba(255,255,255,0.7)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 12 — Section Divider: Your Role
function Slide12() {
  return (
    <Slide bg={COLORS.sand}>
      <SlideContent center maxWidth={800}>
        <Eyebrow>Part 03</Eyebrow>
        <SlideTitle dark={false}>
          How <AccentText>you</AccentText> support Sprint Week.
        </SlideTitle>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: "clamp(1rem, 1.3vw, 1.15rem)",
            color: "rgba(30,41,59,0.7)",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Sprint Week is an organization-wide effort. Here's what to expect.
        </p>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 13 — Assigned Support Roles
function Slide13() {
  return (
    <Slide bg={COLORS.navy}>
      <BlurCircle top="50%" left="30%" />
      <SlideContent maxWidth={1100}>
        <div style={{ display: "grid", gridTemplateColumns: "5fr 4fr", gap: "clamp(40px, 5vw, 80px)", alignItems: "center" }}>
          <div>
            <Eyebrow>Assigned Support Roles</Eyebrow>
            <SlideTitle>
              Small windows. <AccentText>Big impact.</AccentText>
            </SlideTitle>
            <div style={{ marginTop: 24 }}>
              <TealBullet
                items={[
                  "Most roles involve 2–3 hour windows — not full-day commitments.",
                  "You'll receive a calendar invite with time, location, and a short description of what's expected.",
                  "Roles include event check-in, guiding founders, supporting speakers, coffee and lunch setup, AV/tech, and evening event logistics.",
                ]}
              />
            </div>
            <div
              style={{
                marginTop: 32,
                background: "rgba(0,168,142,0.1)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <ListTodo size={20} color={COLORS.teal} />
              <span style={{ fontFamily: FONTS.body, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                Check the shared spreadsheet for your personal schedule tab.
              </span>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: 380,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/Slide13.jpg`}
              alt="Team supporting founders at event check-in"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 14 — What Great Looks Like
function Slide14() {
  return (
    <Slide bg={COLORS.warmWhite}>
      <SlideContent maxWidth={1100}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>The White Glove Standard</Eyebrow>
          <SlideTitle dark={false}>
            What <AccentText>great</AccentText> looks like.
          </SlideTitle>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 16,
              color: "rgba(30,41,59,0.7)",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            We want founders to feel that TBDC is their home base. Small moments add up.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { icon: Smile, title: "Greet Every Founder", desc: "Smile, say hello, introduce yourself. First names go a long way." },
            { icon: MapPin, title: "Help People Navigate", desc: "If someone looks unsure, offer directions to rooms, washrooms, or events." },
            { icon: Wifi, title: "Handle the Basics", desc: "WiFi passwords, coffee locations, printer access — be the person who knows." },
            { icon: Coffee, title: "Keep Things Flowing", desc: "If you see a coffee station running low or chairs out of place, step in." },
            { icon: CheckCircle2, title: "Be Proactive", desc: "Don't wait to be asked. Anticipate what founders, speakers, and guests need." },
            { icon: Star, title: "Make It Memorable", desc: "Every interaction contributes to the experience. Own yours." },
          ].map(({ icon, title, desc }, i) => (
            <LightCard key={i} icon={icon} title={title} description={desc} />
          ))}
        </div>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 15 — Tools & Event App
function Slide15() {
  return (
    <Slide bg={COLORS.navy}>
      <BlurCircle top="50%" left="60%" />
      <SlideContent maxWidth={1000}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>Tools & Communication</Eyebrow>
          <SlideTitle>
            Stay <AccentText>connected.</AccentText>
          </SlideTitle>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <DarkCard
            icon={Smartphone}
            title="Sprint Week Event App"
            description="All schedules, sessions, meeting locations, and live updates will be accessible through the event app. Familiarize yourself so you can help founders navigate it."
            accent
          />
          <DarkCard
            icon={MessageSquare}
            title="WhatsApp — Primary Channel"
            description="WhatsApp will be the primary communication channel throughout the week to reach Sen, Jaghan, Rahul, and Yasseen. Check messages regularly for updates and coordination."
            accent
          />
        </div>
        {/* Emergency Contact Callout */}
        <div
          style={{
            marginTop: 24,
            background: "rgba(212,168,67,0.1)",
            border: "1px solid rgba(212,168,67,0.3)",
            borderRadius: 12,
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <Phone size={20} color={COLORS.gold} />
          <span style={{ fontFamily: FONTS.body, fontSize: 15, color: "rgba(255,255,255,0.85)" }}>
            <strong style={{ color: COLORS.gold }}>Urgent/Emergency:</strong> Call or text Yasseen at{" "}
            <span style={{ fontFamily: FONTS.mono, fontWeight: 700, color: "#fff" }}>289-894-3431</span>
          </span>
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <div
            style={{
              display: "inline-flex",
              gap: 32,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "20px 32px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.teal, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Programming
              </span>
              <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 16, color: "#fff", marginTop: 4 }}>
                Sen · Jaghan · Rahul
              </div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.teal, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Coordination
              </span>
              <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 16, color: "#fff", marginTop: 4 }}>
                Yasseen
              </div>
            </div>
          </div>
        </div>
      </SlideContent>
    </Slide>
  );
}

// SLIDE 16 — Closing / Thank You
function Slide16() {
  return (
    <Slide bg={COLORS.navy}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          background: `radial-gradient(ellipse at 50% 50%, ${COLORS.teal}44, transparent 70%)`,
        }}
      />
      <SlideContent center maxWidth={800}>
        <Eyebrow>Our Collective Goal</Eyebrow>
        <SlideTitle>
          Professional. Welcoming.{" "}
          <AccentText>Uniquely TBDC.</AccentText>
        </SlideTitle>
        <BodyText>
          Help founders feel supported while they're here. Make Sprint Week feel energetic, coordinated, and memorable. Every interaction contributes to that experience.
        </BodyText>
        <div style={{ marginTop: 48 }}>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 8,
            }}
          >
            Programming will circulate detailed role assignments, schedules, and logistics before the week begins.
          </p>
          <p
            style={{
              fontFamily: FONTS.serif,
              fontStyle: "italic",
              fontSize: 22,
              color: COLORS.teal,
              marginTop: 32,
            }}
          >
            Thank you for helping us deliver an outstanding Sprint Week.
          </p>
        </div>
      </SlideContent>
    </Slide>
  );
}

// ─────────────────────────────────────────────
// SLIDE REGISTRY
// ─────────────────────────────────────────────
const SLIDES = [
  { component: Slide01, title: "Sprint Week Town Hall", tocTitle: "Title" },
  { component: Slide02, title: "Why This Matters", tocTitle: "Why This Matters" },
  { component: Slide03, title: "The Programs", tocTitle: "Section: The Programs" },
  { component: Slide04, title: "Horizon & Pivot", tocTitle: "Horizon & Pivot" },
  { component: Slide05, title: "Founder Journey", tocTitle: "Scout · Sprint · Surge" },
  { component: Slide06, title: "What Sprint Week Is", tocTitle: "What Sprint Week Is" },
  { component: Slide07, title: "Dates & Logistics", tocTitle: "March 22–27" },
  { component: Slide08, title: "Weekly Flow", tocTitle: "Section: Weekly Flow" },
  { component: Slide09, title: "Sunday & Mornings", tocTitle: "Welcome & Morning Programming" },
  { component: Slide10, title: "Afternoon Meetings", tocTitle: "Afternoon Meetings" },
  { component: Slide11, title: "Evening Events", tocTitle: "Evening Events" },
  { component: Slide12, title: "Your Role", tocTitle: "Section: Your Role" },
  { component: Slide13, title: "Support Roles", tocTitle: "Assigned Support Roles" },
  { component: Slide14, title: "What Great Looks Like", tocTitle: "The White Glove Standard" },
  { component: Slide15, title: "Tools & Contacts", tocTitle: "Tools & Key Contacts" },
  { component: Slide16, title: "Closing", tocTitle: "Thank You" },
];

// ─────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────
export default function SprintWeekTownHall() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const hideTimeout = useRef(null);

  const totalSlides = SLIDES.length;

  const goToSlide = useCallback((n) => {
    setCurrentSlide(Math.max(0, Math.min(n, totalSlides - 1)));
  }, [totalSlides]);

  const next = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prev = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      if (tocOpen) {
        if (e.key === "Escape") setTocOpen(false);
        return;
      }
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "Enter":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "Backspace":
          e.preventDefault();
          prev();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
        case "Home":
          goToSlide(0);
          break;
        case "End":
          goToSlide(totalSlides - 1);
          break;
        case "t":
          setTocOpen((v) => !v);
          break;
        default:
          if (e.key >= "1" && e.key <= "9") {
            goToSlide(parseInt(e.key) - 1);
          }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, toggleFullscreen, goToSlide, totalSlides, tocOpen]);

  // Auto-hide controls
  useEffect(() => {
    const showControls = () => {
      setControlsVisible(true);
      clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => setControlsVisible(false), 3000);
    };
    window.addEventListener("mousemove", showControls);
    hideTimeout.current = setTimeout(() => setControlsVisible(false), 3000);
    return () => {
      window.removeEventListener("mousemove", showControls);
      clearTimeout(hideTimeout.current);
    };
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const CurrentSlideComponent = SLIDES[currentSlide].component;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: COLORS.navy,
        position: "relative",
      }}
    >
      {/* Global noise overlay */}
      <NoiseOverlay />

      {/* Progress bar */}
      <ProgressBar current={currentSlide} total={totalSlides} />

      {/* TOC toggle button (top-left) */}
      <button
        onClick={() => setTocOpen(true)}
        aria-label="Open table of contents"
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 60,
          background: "rgba(10,22,40,0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "10px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "all 0.3s",
          opacity: controlsVisible ? 1 : 0,
        }}
      >
        <Menu size={18} color="rgba(255,255,255,0.6)" />
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Slides
        </span>
      </button>

      {/* Keyboard hint (top-right) */}
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 60,
          display: "flex",
          gap: 8,
          opacity: controlsVisible ? 0.5 : 0,
          transition: "opacity 0.5s",
        }}
      >
        {[
          { key: "←→", label: "Navigate" },
          { key: "F", label: "Fullscreen" },
          { key: "T", label: "TOC" },
        ].map(({ key, label }) => (
          <span
            key={key}
            style={{
              fontFamily: FONTS.mono,
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 6,
              padding: "4px 8px",
            }}
          >
            {key} {label}
          </span>
        ))}
      </div>

      {/* Table of Contents overlay */}
      <TableOfContents
        slides={SLIDES}
        current={currentSlide}
        onSelect={goToSlide}
        open={tocOpen}
        onClose={() => setTocOpen(false)}
      />

      {/* Slide content with crossfade */}
      <div
        key={currentSlide}
        style={{
          animation: "slideIn 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <CurrentSlideComponent />
      </div>

      {/* Control bar */}
      <ControlBar
        current={currentSlide}
        total={totalSlides}
        onPrev={prev}
        onNext={next}
        onFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        visible={controlsVisible}
      />

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }

        button:focus-visible {
          outline: 2px solid ${COLORS.teal};
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Screen reader announcements */}
      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
        Slide {currentSlide + 1} of {totalSlides}: {SLIDES[currentSlide].title}
      </div>
    </div>
  );
}
