import { z } from "zod";

// Validação de UX; a validação definitiva é a do backend (VineJS)

const optionalDate = z.string().nullable().optional();

export const projectSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome").max(255),
    description: z.string().max(5000).nullable().optional(),
    status: z.enum(["not_started", "in_progress", "suspended", "finished"]),
    /** "none" = sem prioridade (enviado como null) */
    priority: z.enum(["high", "medium", "low", "none"]).nullable().optional(),
    directorateId: z.number({ error: "Selecione a diretoria" }),
    /** YYYY-MM-DD */
    startsAt: optionalDate,
    expectedEndAt: optionalDate,
    endedAt: optionalDate,
  })
  .refine((values) => !values.startsAt || !values.expectedEndAt || values.expectedEndAt >= values.startsAt, {
    path: ["expectedEndAt"],
    message: "A previsão não pode ser antes do início",
  })
  .refine((values) => !values.startsAt || !values.endedAt || values.endedAt >= values.startsAt, {
    path: ["endedAt"],
    message: "O término não pode ser antes do início",
  });

export type ProjectForm = z.infer<typeof projectSchema>;

export const addProjectMemberSchema = z.object({
  projectId: z.number({ error: "Selecione o projeto" }),
  userId: z.number({ error: "Selecione a pessoa" }),
  role: z.enum(["coordinator", "member"], { error: "Selecione o papel" }),
  /** YYYY-MM-DD; vazio = hoje */
  startsAt: z.string().optional(),
});

export type AddProjectMemberForm = z.infer<typeof addProjectMemberSchema>;
