/** Erro de aplicação com status HTTP — o service lança, o errorHandler traduz. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(404, `${resource} não encontrado(a)`);
  }
}
