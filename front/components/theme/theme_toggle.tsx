"use client";

import { useSyncExternalStore } from "react";
import { Moon01, Sun } from "@untitledui/icons";
import { useTheme } from "next-themes";
import { ButtonUtility } from "@/components/base/buttons/button-utility";

// O tema só é conhecido no cliente; até lá o botão não é renderizado para evitar divergência de hidratação
const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) return <div className="size-9" />;

  const isDark = resolvedTheme === "dark";

  return (
    <ButtonUtility
      size="sm"
      color="secondary"
      className={className}
      icon={isDark ? Sun : Moon01}
      tooltip={isDark ? "Modo claro" : "Modo escuro"}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    />
  );
};
