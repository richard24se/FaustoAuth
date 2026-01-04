import api from './api';
import { Audit, GenericResponse } from '../types';

export const auditService = {
  getAll: async () => {
    const response = await api.get<GenericResponse<Audit[]>>('/audit/');
    return response.data.data;
  },

  get: async (id: number) => {
    const response = await api.get<GenericResponse<Audit>>(`/audit/${id}`);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<GenericResponse<Audit>>(`/audit/${id}`);
    return response.data.data;
  },
};
