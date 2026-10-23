import { randomUUID } from "node:crypto";

/** Abstrai a geração de ids para que os testes tenham ids previsíveis. */
export interface IdGenerator {
  next(): string;
}

export const uuidGenerator: IdGenerator = { next: () => randomUUID() };
