import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-text-on-primary">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-black text-lg">IA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">IADVH</h1>
              <p className="text-xs text-accent opacity-90">Voluntariado Social</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/inscricao" className="btn btn-secondary text-sm">
              Inscrição
            </Link>
            <Link href="/admin" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary text-sm">
              Admin
            </Link>
            <Link href="/dashboard" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary text-sm">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="badge badge-success mb-4">✨ Gamificação Ativa</span>
          <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-4 leading-tight">
            Compromisso Social<br />
            <span className="text-primary">que Transforma</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
            Engaje-se em ações sociais, confirme sua presença e acompanhe o ranking do seu setor em tempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscricao" className="btn btn-primary text-base px-8 py-3">
              🤝 Quero Participar
            </Link>
            <Link href="/dashboard" className="btn btn-outline text-base px-8 py-3">
              📊 Ver Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-12 h-12 bg-accent rounded-[var(--radius-sm)] flex items-center justify-center mb-4 text-2xl">
              📝
            </div>
            <h3 className="font-bold text-lg mb-2">Inscreva-se</h3>
            <p className="text-text-secondary text-sm">
              Selecione seu setor, identifique-se e escolha a ação social para participar.
            </p>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-12 h-12 bg-accent rounded-[var(--radius-sm)] flex items-center justify-center mb-4 text-2xl">
              ✅
            </div>
            <h3 className="font-bold text-lg mb-2">Check-in</h3>
            <p className="text-text-secondary text-sm">
              O administrador confirma sua presença na ação social no dia do evento.
            </p>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="w-12 h-12 bg-accent rounded-[var(--radius-sm)] flex items-center justify-center mb-4 text-2xl">
              🏆
            </div>
            <h3 className="font-bold text-lg mb-2">Ranking</h3>
            <p className="text-text-secondary text-sm">
              Acompanhe o ranking gamificado do seu setor com atualização em tempo real.
            </p>
          </div>
        </div>

        {/* Mobile nav for small screens */}
        <div className="md:hidden mt-12 flex flex-col gap-3">
          <Link href="/inscricao" className="btn btn-primary w-full py-4 text-base">
            📝 Inscrição de Voluntário
          </Link>
          <Link href="/admin" className="btn btn-secondary w-full py-4 text-base">
            🔧 Painel Admin
          </Link>
          <Link href="/dashboard" className="btn btn-outline w-full py-4 text-base">
            📊 Dashboard Gamificado
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-accent text-sm font-semibold mb-1">IADVH</p>
          <p className="text-text-secondary text-xs">
            Instituto de Apoio ao Desenvolvimento da Vida Humana • Sistema de Voluntariado
          </p>
        </div>
      </footer>
    </div>
  );
}
