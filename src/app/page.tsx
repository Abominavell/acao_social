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

const features = [
  {
    icon: ClipboardIcon,
    title: "Inscreva-se",
    description: "Selecione seu setor, identifique-se e escolha a ação social para participar.",
    delay: "0s",
  },
  {
    icon: CheckCircleIcon,
    title: "Check-in",
    description: "O administrador confirma sua presença na ação social no dia do evento.",
    delay: "0.1s",
  },
  {
    icon: TrophyIcon,
    title: "Ranking",
    description: "Acompanhe o ranking gamificado do seu setor com atualização em tempo real.",
    delay: "0.2s",
  },
];

const stats = [
  { icon: UsersIcon, value: "Voluntários", label: "Cadastrados" },
  { icon: ShieldIcon, value: "Setores", label: "Participantes" },
  { icon: BarChartIcon, value: "Tempo Real", label: "Acompanhamento" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-institutional">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="IADVh - Página inicial">
            <Image
              src="/logo.svg"
              alt="Logo IADVh - Instituto de Apoio ao Desenvolvimento da Vida Humana"
              width={160}
              height={58}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Navegação principal">
            <Link href="/inscricao" className="btn btn-accent-solid text-sm">
              Inscrição
            </Link>
            <Link href="/admin" className="btn btn-header-outline text-sm">
              Admin
            </Link>
            <Link href="/dashboard" className="btn btn-header-outline text-sm">
              Dashboard
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2 -mr-2" aria-label="Abrir menu">
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="hero-section">
          <div className="max-w-6xl mx-auto px-4">
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
                <Link href="/inscricao" className="btn btn-primary btn-lg" id="cta-participar">
                  Quero Participar
                </Link>
                <Link href="/dashboard" className="btn btn-outline-white btn-lg" id="cta-dashboard">
                  Ver Dashboard
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
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="section-title">Como funciona</h3>

            <div className="features-grid">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="feature-card animate-fade-in-up"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="feature-step">{String(i + 1).padStart(2, "0")}</div>
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

        {/* Mobile CTA Section */}
        <section className="md:hidden px-4 pb-8">
          <div className="flex flex-col gap-3">
            <Link href="/inscricao" className="btn btn-primary btn-lg w-full" id="mobile-cta-inscricao">
              Inscrição de Voluntário
            </Link>
            <Link href="/admin" className="btn btn-secondary btn-lg w-full" id="mobile-cta-admin">
              Painel Admin
            </Link>
            <Link href="/dashboard" className="btn btn-outline btn-lg w-full" id="mobile-cta-dashboard">
              Dashboard Gamificado
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-institutional">
        <div className="max-w-6xl mx-auto px-4">
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
              <p className="footer-sub">Sistema de Voluntariado Social</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
