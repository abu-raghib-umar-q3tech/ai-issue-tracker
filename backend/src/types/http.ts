export interface AppError extends Error {
  statusCode?: number;
}

export interface MessageResponse {
  message: string;
}
