import api from './api';
import { Tenant, GenericResponse } from '../types';

export const tenantService = {
  getAll: async () => {
    // API returns { message: "Found", data: [...] }
    const response = await api.get<GenericResponse<Tenant[]>>('/tenant/');
    return response.data.data;
  },

  get: async (id: number) => {
    const response = await api.get<GenericResponse<Tenant>>(`/tenant/${id}`);
    return response.data.data;
  },

  create: async (data: any) => {
    const response = await api.post<GenericResponse<Tenant>>('/tenant/', data);
    return response.data.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put<GenericResponse<Tenant>>(`/tenant/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<GenericResponse<Tenant>>(`/tenant/${id}`);
    return response.data.data;
  },
};
