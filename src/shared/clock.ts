/** Abstrai "agora" para que os testes possam congelar o tempo. */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };
