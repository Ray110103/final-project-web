export interface User {
  id: number;
  name: string;
  email: string;
  pictureProfile: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  accessToken?: string; // Menambahkan accessToken

  provider?: string;
  providerId?: string;
  avatar?: string;
  isVerified?: boolean;

  pendingEmail?: string;
  emailVerificationToken?: string;
  emailTokenExpiry?: Date;
}
