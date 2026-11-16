import Link from "next/link";
import { Avatar, type AvatarProps } from "@/components/base/avatar/avatar";
import { getInitials } from "@/lib/administration";
import { cx } from "@/utils/cx";

interface Person {
  fullName: string;
  photoUrl?: string | null;
}

/** Props de avatar de uma pessoa: foto quando houver, senão as iniciais (também para AvatarLabelGroup) */
export const avatarProps = (person?: Person) => ({
  src: person?.photoUrl,
  alt: person?.fullName,
  initials: getInitials(person?.fullName ?? ""),
});

/** Avatar de uma pessoa, com foto ou iniciais */
export function UserAvatar({ person, ...props }: { person?: Person } & Omit<AvatarProps, "src" | "alt" | "initials">) {
  return <Avatar {...props} {...avatarProps(person)} />;
}

interface PersonLinkProps {
  userId: number;
  /** Pessoa do vínculo (vem junto do vínculo; ausente só se não foi carregada) */
  person?: Person;
  /** Linha abaixo do nome (ex.: cargo ou e-mail) */
  subtitle?: string;
  size?: "sm" | "md";
  className?: string;
}

/** Avatar e nome de uma pessoa, levando ao detalhe do usuário */
export function PersonLink({ userId, person, subtitle, size = "sm", className }: PersonLinkProps) {
  return (
    <Link
      href={`/users/${userId}`}
      className={cx(
        "flex min-w-0 items-center gap-2.5 rounded-lg outline-focus-ring transition-opacity hover:opacity-80 focus-visible:outline-2",
        size === "md" && "gap-3",
        className,
      )}
    >
      <UserAvatar person={person} size={size} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-primary">{person?.fullName}</span>
        {subtitle && (
          <span className={cx("truncate text-tertiary", size === "md" ? "text-sm" : "text-xs")}>{subtitle}</span>
        )}
      </span>
    </Link>
  );
}
