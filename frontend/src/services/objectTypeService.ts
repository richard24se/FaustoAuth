import api from './api';
import { ObjectType, GenericResponse } from '../types';

export const objectTypeService = {
  getAll: async () => {
    const response = await api.get<GenericResponse<ObjectType[]>>('/object_types/');
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await api.get<GenericResponse<ObjectType>>(`/object_types/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<ObjectType>) => {
    const response = await api.post<GenericResponse<ObjectType>>('/object_types/', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<ObjectType>) => {
    const response = await api.put<GenericResponse<ObjectType>>(`/object_types/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number) => {
      const response = await api.delete<GenericResponse<ObjectType>>(`/object_types/${id}`);
      return response.data.data;
  },
};
