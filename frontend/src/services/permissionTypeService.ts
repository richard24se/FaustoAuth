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
};
