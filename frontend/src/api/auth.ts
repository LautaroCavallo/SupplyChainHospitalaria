import api from './client';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    nombre: string;
    email?: string;
    rol?: string;
    cargo?: string;
    permisos?: string[];
  };
}

interface SsoCallbackResponse extends LoginResponse {
  redirect: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nombre: string;
  cargo?: string;
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const res = await api.post('/auth/register', payload);
  return res.data.data;
}

/**
 * Canjea el ticket SSO a través del backend (servidor-a-servidor con el Core).
 * Devuelve el JWT, los datos del usuario y la ruta interna de redirección.
 */
export async function exchangeSSOTicket(ticket: string): Promise<SsoCallbackResponse> {
  const res = await api.get('/auth/sso', { params: { ticket } });
  return res.data.data;
}
