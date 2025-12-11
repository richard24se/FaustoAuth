export interface Tenant {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  names?: string;
  surnames?: string;
  role?: Role;
  id_role?: number;
  tenant_id: number;
}

export interface Role {
  id: number;
  name: string;
  display_name?: string;
  tenant_id: number;
}

export interface Permission {
  id: number;
  name: string;
  id_object: number;
  tenant_id: number;
}

export interface AuthObject {
  id: number;
  name: string;
  display_name?: string;
  id_object_type: number;
  tenant_id: number;
}

// Generic response wrapper used by backend
export interface GenericResponse<T> {
  data: T;
  message?: string;
  error?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Backend wraps success in "data" usually?
// Based on test scripts: login_response.json()["data"]
export interface TokenResponseData {
  access_token: string;
  refresh_token?: string;
  id: number;
  username: string;
  names?: string;
  surnames?: string;
  id_role: number;
  tenant_id: number;
}

export interface LoginResponse {
  data: TokenResponseData;
  message?: string;
  error?: boolean;
}
