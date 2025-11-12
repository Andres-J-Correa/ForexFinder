export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  firstName: string;
  lastName: string;
  picture: string;
}

export interface CurrentUserResponse {
  firstName: string;
  lastName: string;
  picture: string;
}