import { User, Role } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role?: Role;
}

export interface LoginResponse {
  token: string;
  type: string;
  user: User;
}
