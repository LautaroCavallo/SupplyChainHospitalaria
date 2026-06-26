export type TipoDeposito = 'CENTRAL' | 'PISO';

export class Deposito {
  readonly id: string;
  nombre: string;
  tipo: TipoDeposito;
  descripcion?: string;
  activo: boolean;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    nombre: string;
    tipo?: TipoDeposito;
    descripcion?: string;
    activo?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.tipo = props.tipo ?? 'PISO';
    this.descripcion = props.descripcion;
    this.activo = props.activo ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
