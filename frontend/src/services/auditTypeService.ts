import api from './api';
import { AuditType, GenericResponse } from '../types';

export const auditTypeService = {
  getAll: async () => {
    const response = await api.get<GenericResponse<AuditType[]>>('/audit_type/');
    return response.data.data;
  },

  get: async (id: number) => {
    const response = await api.get<GenericResponse<AuditType>>(`/audit_type/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<AuditType>) => {
    const response = await api.post<GenericResponse<AuditType>>('/audit_type/', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<AuditType>) => {
    const response = await api.put<GenericResponse<AuditType>>(`/audit_type/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<GenericResponse<AuditType>>(`/audit_type/${id}`);
    return response.data.data;
  },
};
