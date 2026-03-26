import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
};

export function BrandLogo({ href = "/", compact = false }: BrandLogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-3" aria-label="Ir para página inicial">
      <div className="rounded-xl bg-white/95 px-3 py-2.5 shadow-sm ring-1 ring-black/5">
        <Image
          src="/logo.svg"
          alt="Logo IADVh"
          width={compact ? 118 : 132}
          height={compact ? 38 : 42}
          className={compact ? "h-9 w-auto" : "h-8 w-auto"}
          priority
        />
      </div>
      {!compact ? (
        <span className="hidden text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-200 md:inline">
          Monitoramento de Voluntariado
        </span>
      ) : null}
    </Link>
  );
}
