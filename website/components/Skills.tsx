"use client";

import { useEffect, useRef } from "react";
import type { SiteContent } from "@/lib/fr";

function LocalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8.5" stroke="var(--copper)" strokeWidth="1.5" />
      <ellipse cx="10" cy="10" rx="3.5" ry="8.5" stroke="var(--copper)" strokeWidth="1.5" />
      <line x1="2" y1="10" x2="18" y2="10" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="6" x2="16" y2="6" stroke="var(--copper)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="4" y1="14" x2="16" y2="14" stroke="var(--copper)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  );
}

function ReactivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="3" stroke="var(--copper)" strokeWidth="1.5" />
      <path d="M10 2 L10 5" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 15 L10 18" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 10 L5 10" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 10 L18 10" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.22 4.22 L6.34 6.34" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.66 13.66 L15.78 15.78" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.78 4.22 L13.66 6.34" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.34 13.66 L4.22 15.78" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TechIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="var(--copper)" strokeWidth="1.5" />
      <path d="M7 8 L5 10 L7 12" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 8 L15 10 L13 12" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="7" x2="10" y2="13" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="var(--copper)" strokeWidth="1.5" />
      <path d="M7 9 V6 a3 3 0 0 1 6 0 V9" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="1.5" stroke="var(--copper)" strokeWidth="1.5" />
    </svg>
  );
}

const argIcons = [<LocalIcon key={0} />, <ReactivityIcon key={1} />, <TechIcon key={2} />, <LockIcon key={3} />];

export default function Skills({ content }: { content: SiteContent['skills'] }) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (leftRef.current) observer.observe(leftRef.current);
    if (rightRef.current) observer.observe(rightRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="expertise"
      style={{ padding: "120px 0", background: "var(--bg-white)" }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <p className="section-label">{content.label}</p>
          <h2
            className="section-title"
            style={{ marginTop: "16px" }}
          >
            {content.title}<em>{content.titleAccent}</em>{content.titleEnd}
          </h2>
        </div>

        {/* Two-column layout */}
        <div className="skills-layout">
          {/* Left column — arguments */}
          <div ref={leftRef} className="reveal">
            {content.arguments.map((arg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  marginBottom: index < content.arguments.length - 1 ? "40px" : 0,
                  alignItems: "flex-start",
                }}
              >
                {/* Icon square */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    flexShrink: 0,
                    background: "var(--bg-cream)",
                    border: "1px solid var(--border)",
                    borderRadius: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {argIcons[index]}
                </div>

                {/* Text */}
                <div>
                  <h3
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "20px",
                      fontWeight: 500,
                      color: "var(--text-dark)",
                      margin: "0 0 8px",
                    }}
                  >
                    {arg.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      color: "var(--text-medium)",
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {arg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right column — chiffres clés */}
          <div ref={rightRef} className="reveal">
            <div
              className="card glow-card"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
                e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
              }}
              style={{ padding: "48px" }}
            >
              <h3
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "28px",
                  fontWeight: 500,
                  color: "var(--text-dark)",
                  margin: "0 0 16px",
                }}
              >
                {content.statsTitle}
              </h3>

              {/* Copper line */}
              <div
                style={{
                  width: "32px",
                  height: "1px",
                  background: "var(--copper)",
                  marginBottom: "40px",
                }}
              />

              {/* Stats grid 2×2 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "32px",
                  marginBottom: "40px",
                }}
              >
                {content.stats.map((stat, index) => (
                  <div key={index}>
                    <p
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "52px",
                        fontWeight: 300,
                        color: "var(--copper)",
                        margin: "0 0 4px",
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "10px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "var(--text-light)",
                        margin: 0,
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Blockquote */}
              <blockquote
                style={{
                  borderLeft: "2px solid var(--copper)",
                  paddingLeft: "20px",
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "18px",
                  fontStyle: "italic",
                  color: "var(--text-medium)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {content.quote}
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .skills-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .skills-layout {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }
      `}</style>
    </section>
  );
}
