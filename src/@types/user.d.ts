export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  role: Role;
  verified: boolean;
  avatar?: string;
  subtitle?: string;
  createdAt: string;
}
