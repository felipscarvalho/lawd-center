"use client";

import { useRef } from "react";
import Image from "next/image";
import { LogIn01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ThemeToggle } from "@/components/theme/theme_toggle";
import { LogoGlobe } from "./logo_globe";
import { SelectionNoticeForm } from "./selection_notice_form";

export function LandingPage() {
  // Área livre abaixo do conteúdo: é nela que a calota da esfera aparece
  const stageRef = useRef<HTMLDivElement>(null);

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      {/* Esfera do logo subindo de baixo, atrás do conteúdo (que fica em z-10) */}
      <LogoGlobe stageRef={stageRef} className="absolute inset-0 size-full" />

      <header className="relative z-10 flex items-center justify-between px-4 py-6 sm:px-8">
        {/* Mesma marca do componente Logo, mas só "Lawd": aqui é a liga, não o sistema (Lawd Center) */}
        <span className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={32} height={32} className="size-8 object-contain" priority />
          <span className="text-lg leading-none font-bold tracking-tight text-primary">Lawd</span>
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button size="sm" color="secondary" iconLeading={LogIn01} href="/login">
            Entrar
          </Button>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-[clamp(1.5rem,7dvh,5rem)] text-center sm:px-8">
        <h1 className="text-display-md font-semibold text-balance text-primary sm:text-display-xl lg:text-display-2xl">
          Faça parte da LAWD
        </h1>
        <p className="mt-5 max-w-2xl text-md text-balance text-tertiary sm:text-lg">
          Aprenda tecnologia na prática, em projetos com impacto real na comunidade. Deixe seu e-mail e avisamos quando
          o processo seletivo abrir.
        </p>
        <SelectionNoticeForm className="mt-8 max-w-lg" />
      </div>

      <div ref={stageRef} aria-hidden className="min-h-56 flex-1 sm:min-h-72" />
    </main>
  );
}
