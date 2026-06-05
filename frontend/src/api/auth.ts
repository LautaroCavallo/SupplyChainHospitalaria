import api from './client';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    nombre: string;
    email?: string;
    rol?: string;
    permisos?: string[];
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data;
}
