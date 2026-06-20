export interface CreateNotificacionData {
  tipo: string;
  titulo: string;
  descripcion: string;
  referencia?: string;
  usuarioId?: string;
}

export interface NotificacionEntity {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  leida: boolean;
  referencia?: string | null;
  usuarioId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificacionRepository {
  findAll(): Promise<NotificacionEntity[]>;
  create(data: CreateNotificacionData): Promise<NotificacionEntity>;
  marcarTodasLeidas(): Promise<void>;
  crearSiNoExiste(data: CreateNotificacionData & { referencia: string }): Promise<void>;
}
