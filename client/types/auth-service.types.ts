export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  firstName: string;
  lastName: string;
  picture: string;
  role?: 'user' | 'admin';
}

export interface CurrentUserResponse {
  firstName: string;
  lastName: string;
  picture: string;
  role?: 'user' | 'admin';
}