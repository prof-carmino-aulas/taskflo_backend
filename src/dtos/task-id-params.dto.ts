import { z } from "zod";

/** Parâmetro :id das rotas — precisa ser um UUID. */
export const taskIdParamsSchema = z.object({
  id: z.uuid("id deve ser um UUID válido"),
});

export type TaskIdParamsDto = z.infer<typeof taskIdParamsSchema>;
