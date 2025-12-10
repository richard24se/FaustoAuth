import api from './api';
import { User, GenericResponse } from '../types';

export const userService = {
  getAll: async () => {
    // Backend likely returns List[User] or GenericResponse<List[User]>
    // Assuming backend standard: GenericResponse<List[User]>
    const response = await api.get<GenericResponse<User[]>>('/user/');
    return response.data.data; 
  },
  
  // Placeholder for CRUD
  create: async (data: Partial<User>) => await api.post('/user/', data),
  update: async (id: number, data: Partial<User>) => await api.put(`/user/${id}`, data),
  delete: async (id: number) => await api.delete(`/user/${id}`),
};
