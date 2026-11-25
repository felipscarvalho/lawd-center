import { z } from "zod";
import { maxProfileChoices } from "@/lib/administration";

// Validação de UX; a validação definitiva é a do backend (VineJS)

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

export type LoginForm = z.infer<typeof loginSchema>;

const fullName = z.string().trim().min(3, "Informe o nome completo").max(255);
const email = z.email("Informe um e-mail válido").max(254);
const password = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(72);

/** Cadastro por convite: só o e-mail; nome e senha a pessoa informa ao aceitar */
export const createUserSchema = z.object({ email });

export type CreateUserForm = z.infer<typeof createUserSchema>;

/** Aceite do convite: nome, senha e a confirmação (a confirmação fica só no front) */
export const acceptInvitationSchema = z
  .object({
    fullName,
    password,
    passwordConfirmation: z.string().min(1, "Repita a senha"),
  })
  .refine((values) => values.passwordConfirmation === values.password, {
    path: ["passwordConfirmation"],
    message: "As senhas não conferem",
  });

export type AcceptInvitationForm = z.infer<typeof acceptInvitationSchema>;

/** Senha nova definida pela gestão no detalhe do usuário (sem pedir a atual) */
export const resetPasswordSchema = z.object({ password });

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const createDirectorateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(255),
  key: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]*$/, "Use letras minúsculas, números e _ (ex.: legal_affairs)")
    .max(50),
  kind: z.enum(["core", "standard"]),
});

export type CreateDirectorateForm = z.infer<typeof createDirectorateSchema>;

export const assignMembershipSchema = z.object({
  userId: z.number({ error: "Selecione o usuário" }),
  directorateId: z.number({ error: "Selecione a diretoria" }),
  position: z.enum(["president", "vice_president", "general_secretary", "director", "member"], {
    error: "Selecione o cargo",
  }),
  /** YYYY-MM-DD; vazio = hoje */
  startsAt: z.string().optional(),
});

export type AssignMembershipForm = z.infer<typeof assignMembershipSchema>;

const optional = <T extends z.ZodTypeAny>(schema: T) => schema.nullable().optional();

export const profileSchema = z.object({
  /** YYYY-MM-DD */
  birthDate: optional(z.string()),
  registrationNumber: optional(
    z.union([z.literal(""), z.string().trim().regex(/^\d{4,20}$/, "Use só números (4 a 20 dígitos)")]),
  ),
  course: optional(z.enum(["information_systems", "computer_science", "computer_engineering", "design", "advertising", "other"])),
  universityEntryPeriod: optional(
    z.union([z.literal(""), z.string().regex(/^\d{4}\.[12]$/, "Use o formato ano.semestre (ex.: 2022.1)")]),
  ),
  weeklyAvailability: optional(z.enum(["under_6h", "from_6_to_8h", "from_9_to_12h", "over_12h"])),
  maturity: optional(z.enum(["beginner", "developing", "autonomous", "mentor"])),
  careerPaths: z
    .array(z.enum(["full_stack", "frontend", "backend", "devops", "ui_ux", "project_management", "research"]))
    .max(maxProfileChoices, `Escolha até ${maxProfileChoices} opções`),
  softSkills: z
    .array(z.enum(["communication", "teamwork", "leadership", "organization", "proactivity", "autonomy"]))
    .max(maxProfileChoices, `Escolha até ${maxProfileChoices} opções`),
  goal: optional(z.string().max(2000, "Use até 2000 caracteres")),
  technologies: z.array(z.string()).max(50, "Use até 50 tecnologias"),
  interestAreas: z.array(z.string()).max(50, "Use até 50 áreas"),
});

export type ProfileForm = z.infer<typeof profileSchema>;

/** Nota de 0 a 10 com até duas casas (vírgula ou ponto); vazio remove a nota */
export const technicalScoreSchema = z.object({
  technicalScore: z.union([
    z.literal(""),
    z.string().regex(/^(10([.,]0{1,2})?|\d([.,]\d{1,2})?)$/, "Informe uma nota de 0 a 10"),
  ]),
});

export type TechnicalScoreForm = z.infer<typeof technicalScoreSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: password,
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ["newPassword"],
    message: "A nova senha precisa ser diferente da atual",
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

/** Detalhe do usuário: dados da conta e do perfil num formulário só (cada parte vai para o seu endpoint) */
export const userEditSchema = profileSchema.extend({ fullName, email });

export type UserEditForm = z.infer<typeof userEditSchema>;

/** Detalhe de quem ainda não aceitou o convite: o nome pode ficar vazio (a pessoa informa ao aceitar) */
export const pendingUserEditSchema = profileSchema.extend({ fullName: z.union([z.literal(""), fullName]), email });
