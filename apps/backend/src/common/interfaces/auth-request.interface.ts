import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    permissions: string[];
  };
}
