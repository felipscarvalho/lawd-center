"use client";

import { Tool02 } from "@untitledui/icons";
import { Logo } from "@/components/brand/logo";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { ThemeToggle } from "@/components/theme/theme_toggle";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

export function UnderDevelopment() {
  return (
    <main className="flex min-h-dvh flex-col px-4 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <section className="flex flex-1 items-center justify-center py-12">
        <div className="glass flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl p-8 text-center ring-1 ring-secondary sm:p-10">
          <FeaturedIcon icon={Tool02} color="brand" theme="light" size="xl" />

          <div className="flex flex-col items-center gap-3">
            <BadgeWithDot color="brand" size="md">
              Em breve
            </BadgeWithDot>
            <h1 className="text-display-xs font-semibold text-primary sm:text-display-sm">Em desenvolvimento</h1>
            <p className="text-md text-tertiary">
              O Lawd Center está sendo construído. Em breve esta página estará disponível.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
