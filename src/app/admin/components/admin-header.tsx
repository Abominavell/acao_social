import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

type AdminHeaderProps = {
  username?: string;
  signOutButton: ReactNode;
};

export function AdminHeader({ username, signOutButton }: AdminHeaderProps) {
  return (
    <header className="bg-dark text-white border-b border-white/10">
      <div className="w-[96vw] max-w-[1800px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Voltar para início">
          <div className="bg-white/90 px-3 py-1.5 rounded-sm">
            <Image src="/logo.svg" alt="Logo IADVh" width={120} height={44} className="h-7 w-auto" priority />
          </div>
          <span className="font-bold text-sm text-white/60">Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 hidden md:inline">{username}</span>
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            Dashboard
          </Link>
          {signOutButton}
        </div>
      </div>
    </header>
  );
}
