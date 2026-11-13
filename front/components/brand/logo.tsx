import Image from "next/image";
import { cx } from "@/utils/cx";

// Logo da LAWD (mesmo do SimMAP) com o nome da aplicação
export const Logo = ({ className }: { className?: string }) => (
  <span className={cx("flex items-center gap-2.5", className)}>
    <Image src="/logo.png" alt="" width={32} height={32} className="size-8 object-contain" priority />
    <span className="text-lg leading-none font-bold tracking-tight text-primary">Lawd Center</span>
  </span>
);
