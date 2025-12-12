import api from './api';
import { GenericResponse } from '../types';

export const rolePermissionService = {
  getByRoleId: async (roleId: number) => {
    const response = await api.get<GenericResponse<any[]>>(`/role_permission/?role_id=${roleId}`);
    return response.data.data;
  },
};
