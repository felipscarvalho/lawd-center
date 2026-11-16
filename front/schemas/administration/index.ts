import { z } from "zod";

// Validação de UX; a validação definitiva é a do backend (VineJS)

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

export type LoginForm = z.infer<typeof loginSchema>;

const fullName = z.string().trim().min(3, "Informe o nome completo").max(255);
const email = z.email("Informe um e-mail válido").max(254);
const password = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(72);

export const createUserSchema = z.object({ fullName, email, password });

export type CreateUserForm = z.infer<typeof createUserSchema>;

// Na edição a senha é opcional: vazio mantém a atual
export const updateUserSchema = z.object({
  fullName,
  email,
  password: z.union([z.literal(""), password]),
});

export type UpdateUserForm = z.infer<typeof updateUserSchema>;

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

export const updateDirectorateSchema = createDirectorateSchema.pick({ name: true });

export type UpdateDirectorateForm = z.infer<typeof updateDirectorateSchema>;

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
