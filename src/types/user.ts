export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  pictureProfile?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Role {
  TENANT = 'TENANT',
  USER = 'USER'
}
