// utils/ApiError.ts
import { NextFunction } from "express";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    // Set the prototype explicitly to ensure proper error handling
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Utility Function to throw custom errors
export function throwError(
  status: number,
  message: string,
  next: NextFunction
): void {
  const error = new ApiError(status, message);
  next(error); // Pass error to the next middleware (error handler)
}
