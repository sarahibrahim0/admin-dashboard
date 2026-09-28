export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneDialCode?: string;
  street?: string;
  apartment?: string;
  city?: string;
  zip?: string;
  country?: string;
  image?: { url: string; publicId?: string };
  isAdmin: boolean;
  role?: Role;
  twoFactorEnabled?: boolean;
  isVerified?: boolean;
  wishlist?: string[];
}

export interface Role {
  _id: string;
  id: string;
  name: string;
  permissions: string[];
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: string;
  token: string;
  refreshToken: string;
  userId: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  phoneDialCode?: string;
  street?: string;
}

export interface ApiError {
  message: string;
  status: number;
}
