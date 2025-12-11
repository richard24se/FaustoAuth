import api from './api';
import { LoginCredentials, LoginResponse } from '../types';

// We'll define types in a separate file later, but for now let's keep it simple or inline them if small.
// Actually, let's create a types file next.

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Example protected call
  me: async () => {
    const response = await api.get('/auth/me'); // Assuming such endpoint exists or we use token data
    return response.data;
  },
};
