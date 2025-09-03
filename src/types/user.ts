export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  pictureProfile: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum Role {
  TENANT = 'TENANT',
  USER = 'USER'
}
