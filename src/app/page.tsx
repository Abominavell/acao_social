"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function ClipboardListIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

function LayoutDashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const features = [
  {
    icon: ClipboardIcon,
    title: "Inscreva-se",
    description: "Selecione seu setor, identifique-se e escolha o projeto/data para participar.",
    delay: "0s",
    highlight: "Etapa inicial",
  },
  {
    icon: CheckCircleIcon,
    title: "Check-in",
    description: "O administrador confirma sua presença na ação social no dia do evento.",
    delay: "0.1s",
    highlight: "Validação final",
  },
];

const stats = [
  { icon: UsersIcon, value: "Voluntários", label: "Cadastrados" },
  { icon: ShieldIcon, value: "Setores", label: "Participantes" },
  { icon: BarChartIcon, value: "Tempo Real", label: "Acompanhamento" },
];

const drawerLinks = [
  { href: "/inscricao", label: "Inscrição de Voluntário", icon: ClipboardListIcon },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin", label: "Painel Admin", icon: SettingsIcon },
];

const quickAccess = [
  {
    href: "/inscricao",
    title: "Nova inscrição",
    description: "Acesse o formulário e selecione projeto e data.",
    icon: ClipboardListIcon,
  },
  {
    href: "/dashboard",
    title: "Ver engajamento",
    description: "Acompanhe resultados e evolução por setor.",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/admin",
    title: "Gerenciar projetos",
    description: "Cadastre projetos, datas e confirme presenças.",
    icon: SettingsIcon,
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-institutional">
        <div className="w-[96vw] max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="IADVh - Página inicial">
            <div className="bg-white/90 px-3 py-1.5 rounded-sm">
              <Image
                src="/logo.svg"
                alt="Logo IADVh - Instituto de Apoio ao Desenvolvimento da Vida Humana"
                width={160}
                height={58}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </div>
          </Link>

          {/* Desktop Quick Access */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Acesso rápido">
            {quickAccess.map((item) => (
              <Link key={item.href} href={item.href} className="header-quick-link">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 -mr-2"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <nav
        className={`mobile-drawer ${menuOpen ? "mobile-drawer-open" : ""}`}
        aria-label="Menu mobile"
      >
        <div className="mobile-drawer-header">
          <div className="bg-white/90 px-3 py-1.5 rounded-sm">
            <Image
              src="/logo.svg"
              alt="Logo IADVh"
              width={120}
              height={44}
              className="h-7 w-auto"
            />
          </div>
          <button
            className="text-white/70 hover:text-white p-2 -mr-2 transition-colors"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mobile-drawer-links">
          {drawerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-drawer-link"
              onClick={() => setMenuOpen(false)}
            >
              <link.icon />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mobile-drawer-footer">
          <p className="text-white/40 text-xs text-center">
            IADVh — Monitoramento de Voluntariado
          </p>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="hero-section">
          <div className="w-[96vw] max-w-[1800px] mx-auto px-4">
            <div className="hero-content animate-fade-in-up">
              <span className="badge badge-institutional">
                <ShieldIcon />
                Seja voluntário
              </span>

              <h2 className="hero-title">
                Responsabilidade Social
              </h2>

              <p className="hero-description">
                Faça sua inscrição, confirme sua presença e acompanhe o ranking do seu setor em tempo real.
              </p>

              <div className="hero-actions">
                <Link href="/inscricao" className="btn btn-cta-hero" id="cta-participar">
                  Quero Participar
                </Link>
                <Link href="/dashboard" className="btn btn-outline-white">
                  Ver Engajamento
                </Link>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="stats-bar animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              {stats.map((stat, i) => (
                <div key={i} className="stat-item">
                  <stat.icon />
                  <div>
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="features-section" aria-label="Como funciona">
          <div className="w-[96vw] max-w-[1800px] mx-auto px-4">
            <h3 className="section-title">Como funciona</h3>

            <div className="features-grid">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="feature-card animate-fade-in-up"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="feature-topline">
                    <div className="feature-step">{String(i + 1).padStart(2, "0")}</div>
                    <span className="feature-highlight">{feature.highlight}</span>
                  </div>
                  <div className="feature-icon-wrapper">
                    <feature.icon />
                  </div>
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-institutional">
        <div className="w-[96vw] max-w-[1800px] mx-auto px-4">
          <div className="footer-content">
            <Image
              src="/logo.svg"
              alt="Logo IADVh"
              width={120}
              height={44}
              className="h-8 w-auto opacity-80"
            />
            <div className="footer-text">
              <p className="footer-brand">Instituto de Apoio ao Desenvolvimento da Vida Humana</p>
              <p className="footer-sub">Sistema de Monitoramento de Voluntariado — Gerenciado pela Equipe de Responsabilidade Social</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
