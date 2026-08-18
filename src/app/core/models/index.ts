export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  street?: string;
  apartment?: string;
  city?: string;
  zip?: string;
  country?: string;
  isAdmin: boolean;
  role?: Role;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  isDefault: boolean;
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
}

export interface ApiError {
  message: string;
  status: number;
}
