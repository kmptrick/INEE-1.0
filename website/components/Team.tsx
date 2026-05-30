"use client";

import { useEffect, useRef } from "react";

interface TeamMember {
  initials: string;
  name: string;
  title: string;
  bio: string;
  avatarGradient: string;
  initialsColor: string;
  certifications: string[];
}

const members: TeamMember[] = [
  {
    initials: "PD",
    name: "Patrick Dumont",
    title: "Expert-comptable & Gérant",
    bio: "Fondateur d'INEE, Patrick cumule 15 ans d'expérience en expertise comptable et conseil aux PME luxembourgeoises.",
    avatarGradient: "linear-gradient(135deg, #E8D4BC 0%, #D4C0A8 100%)",
    initialsColor: "#7A5C3C",
    certifications: ["OEC Luxembourg", "Expert-comptable"],
  },
  {
    initials: "SM",
    name: "Sophie Martin",
    title: "Responsable Fiscalité",
    bio: "Spécialiste TVA et fiscalité internationale, Sophie maîtrise les spécificités du droit fiscal luxembourgeois et de la Grande Région.",
    avatarGradient: "linear-gradient(135deg, #E8DCC8 0%, #D8CC9C 100%)",
    initialsColor: "#7A6A3C",
    certifications: ["Fiscaliste agréée", "TVA Luxembourg"],
  },
  {
    initials: "LW",
    name: "Lucas Weber",
    title: "Auditeur Senior",
    bio: "Auditeur certifié ISA, Lucas supervise les missions de révision légale et les due diligences pour les opérations de cession.",
    avatarGradient: "linear-gradient(135deg, #D4DCC8 0%, #C4CCAC 100%)",
    initialsColor: "#4A6040",
    certifications: ["Auditeur certifié", "ISA"],
  },
  {
    initials: "EB",
    name: "Emma Braun",
    title: "Responsable Paie & Social",
    bio: "Expert en droit social luxembourgeois, Emma gère les paies et les déclarations sociales d'une vingtaine d'entreprises clientes.",
    avatarGradient: "linear-gradient(135deg, #D4C8D8 0%, #C4B8C8 100%)",
    initialsColor: "#5C4668",
    certifications: ["Droit social LU", "CCSS"],
  },
];

export default function Team() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="equipe"
      style={{ padding: "120px 0", background: "var(--bg-cream)" }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <p className="section-label">Notre équipe</p>
          <h2
            className="section-title"
            style={{ marginTop: "16px", marginBottom: "24px" }}
            dangerouslySetInnerHTML={{
              __html: "Des experts <em>à votre service</em>",
            }}
          />
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              color: "var(--text-medium)",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            Une équipe d&apos;experts-comptables et de conseillers passionnés,
            engagés à défendre vos intérêts avec rigueur et discrétion.
          </p>
        </div>

        {/* Grid */}
        <div className="team-grid">
          {members.map((member, index) => (
            <div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="card reveal team-card"
              style={{
                padding: "40px 32px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transitionDelay: `${index * 80}ms`,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "2px",
                  background: member.avatarGradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "36px",
                  fontWeight: 300,
                  color: member.initialsColor,
                  flexShrink: 0,
                }}
              >
                {member.initials}
              </div>

              {/* Copper line */}
              <div
                style={{
                  width: "32px",
                  height: "1px",
                  background: "var(--copper)",
                  margin: "24px auto 16px",
                }}
              />

              {/* Name */}
              <h3
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "22px",
                  fontWeight: 500,
                  color: "var(--text-dark)",
                  margin: "0 0 6px",
                }}
              >
                {member.name}
              </h3>

              {/* Title */}
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "10px",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: "var(--copper)",
                  margin: "0 0 16px",
                }}
              >
                {member.title}
              </p>

              {/* Bio */}
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "var(--text-medium)",
                  lineHeight: 1.7,
                  flex: 1,
                }}
              >
                {member.bio}
              </p>

              {/* Certifications */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginTop: "20px",
                  justifyContent: "center",
                }}
              >
                {member.certifications.map((cert, ci) => (
                  <span
                    key={ci}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "9px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      border: "1px solid var(--border)",
                      padding: "4px 10px",
                      borderRadius: "1px",
                      color: "var(--text-light)",
                    }}
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .team-card {
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .team-card:hover {
          border-color: var(--copper);
        }

        @media (max-width: 1024px) {
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
