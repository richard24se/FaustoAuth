import api from './api';
import { GenericResponse } from '../types';

export interface PermissionType {
  id: number;
  name: string;
}

export const permissionTypeService = {
  getAll: async () => {
    const response = await api.get<GenericResponse<PermissionType[]>>('/permission_types/');
    return response.data.data;
  },

  create: async (data: Partial<PermissionType>) => {
    const response = await api.post<GenericResponse<PermissionType>>('/permission_types/', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<PermissionType>) => {
    const response = await api.put<GenericResponse<PermissionType>>(`/permission_types/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<GenericResponse<void>>(`/permission_types/${id}`);
    return response.data;
  }
};
