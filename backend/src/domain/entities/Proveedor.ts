export class Proveedor {
  readonly id: string;
  razonSocial: string;
  cuit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  activo: boolean;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    razonSocial: string;
    cuit: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    contacto?: string;
    activo?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.razonSocial = props.razonSocial;
    this.cuit = props.cuit;
    this.direccion = props.direccion;
    this.telefono = props.telefono;
    this.email = props.email;
    this.contacto = props.contacto;
    this.activo = props.activo ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  validarCuit(): boolean {
    const cuitLimpio = this.cuit.replace(/[-\s]/g, '');
    if (!/^\d{11}$/.test(cuitLimpio)) return false;

    const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 10; i++) {
      suma += parseInt(cuitLimpio[i], 10) * multiplicadores[i];
    }
    const resto = suma % 11;
    const digitoVerificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;

    return digitoVerificador === parseInt(cuitLimpio[10], 10);
  }

  validarEmail(): boolean {
    if (!this.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  validar(): string[] {
    const errores: string[] = [];

    if (!this.razonSocial || this.razonSocial.trim().length === 0) {
      errores.push('La razón social es requerida');
    }

    if (!this.cuit || this.cuit.trim().length === 0) {
      errores.push('El CUIT es requerido');
    } else if (!this.validarCuit()) {
      errores.push('El CUIT no es válido');
    }

    if (!this.validarEmail()) {
      errores.push('El email no es válido');
    }

    return errores;
  }

  desactivar(): void {
    this.activo = false;
    this.updatedAt = new Date();
  }

  activar(): void {
    this.activo = true;
    this.updatedAt = new Date();
  }
}
