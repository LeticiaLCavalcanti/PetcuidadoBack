/**
 * Erro com status HTTP associado, para os controllers responderem o código
 * certo (404 para "não encontrado", 403 para "não é seu") em vez de cair
 * sempre no 400 genérico.
 */
export default class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export const notFound = (message) => new AppError(message, 404);
export const forbidden = (message) => new AppError(message, 403);
export const badRequest = (message) => new AppError(message, 400);
