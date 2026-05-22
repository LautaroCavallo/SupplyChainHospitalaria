export interface MedicamentoVademecum {
  id: string;
  nombre: string;
  principioActivo: string;
  presentacion: string;
  laboratorio: string;
  precio?: number;
  ean?: string;
  troquel?: string;
}

export interface IVademecumService {
  buscarMedicamentos(query: string): Promise<MedicamentoVademecum[]>;
  obtenerMedicamento(id: string): Promise<MedicamentoVademecum | null>;
}
