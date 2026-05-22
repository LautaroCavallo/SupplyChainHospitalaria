import { IVademecumService, MedicamentoVademecum } from '../../../domain/services/IVademecumService';

const MEDICAMENTOS: MedicamentoVademecum[] = [
  {
    id: 'vad-001',
    nombre: 'Amoxicilina 500mg',
    principioActivo: 'Amoxicilina',
    presentacion: 'Cápsulas x 21',
    laboratorio: 'Bagó',
    ean: '7790742000011',
    troquel: '2540001',
  },
  {
    id: 'vad-002',
    nombre: 'Ibuprofeno 400mg',
    principioActivo: 'Ibuprofeno',
    presentacion: 'Comprimidos recubiertos x 20',
    laboratorio: 'Roemmers',
    ean: '7790742000028',
    troquel: '2540002',
  },
  {
    id: 'vad-003',
    nombre: 'Insulina Glargina 100 UI/ml',
    principioActivo: 'Insulina Glargina',
    presentacion: 'Solución inyectable - Cartucho 3ml',
    laboratorio: 'Sanofi-Aventis',
    ean: '7790742000035',
    troquel: '2540003',
  },
  {
    id: 'vad-004',
    nombre: 'Dexametasona 4mg',
    principioActivo: 'Dexametasona',
    presentacion: 'Ampollas x 3',
    laboratorio: 'Sidus',
    ean: '7790742000042',
    troquel: '2540004',
  },
  {
    id: 'vad-005',
    nombre: 'Propofol 1% 20ml',
    principioActivo: 'Propofol',
    presentacion: 'Emulsión inyectable - Ampolla 20ml',
    laboratorio: 'Fresenius Kabi',
    ean: '7790742000059',
    troquel: '2540005',
  },
  {
    id: 'vad-006',
    nombre: 'Omeprazol 20mg',
    principioActivo: 'Omeprazol',
    presentacion: 'Cápsulas gastrorresistentes x 28',
    laboratorio: 'Raffo',
    ean: '7790742000066',
    troquel: '2540006',
  },
  {
    id: 'vad-007',
    nombre: 'Paracetamol 500mg',
    principioActivo: 'Paracetamol',
    presentacion: 'Comprimidos x 16',
    laboratorio: 'GlaxoSmithKline',
    ean: '7790742000073',
    troquel: '2540007',
  },
  {
    id: 'vad-008',
    nombre: 'Diclofenac 75mg',
    principioActivo: 'Diclofenac sódico',
    presentacion: 'Comprimidos de liberación prolongada x 20',
    laboratorio: 'Gador',
    ean: '7790742000080',
    troquel: '2540008',
  },
  {
    id: 'vad-009',
    nombre: 'Metformina 850mg',
    principioActivo: 'Metformina clorhidrato',
    presentacion: 'Comprimidos recubiertos x 30',
    laboratorio: 'Montpellier',
    ean: '7790742000097',
    troquel: '2540009',
  },
  {
    id: 'vad-010',
    nombre: 'Enalapril 10mg',
    principioActivo: 'Enalapril maleato',
    presentacion: 'Comprimidos x 30',
    laboratorio: 'Roemmers',
    ean: '7790742000103',
    troquel: '2540010',
  },
  {
    id: 'vad-011',
    nombre: 'Losartán 50mg',
    principioActivo: 'Losartán potásico',
    presentacion: 'Comprimidos recubiertos x 30',
    laboratorio: 'Casasco',
    ean: '7790742000110',
    troquel: '2540011',
  },
  {
    id: 'vad-012',
    nombre: 'Atorvastatina 20mg',
    principioActivo: 'Atorvastatina cálcica',
    presentacion: 'Comprimidos recubiertos x 30',
    laboratorio: 'Pfizer',
    ean: '7790742000127',
    troquel: '2540012',
  },
  {
    id: 'vad-013',
    nombre: 'Clonazepam 2mg',
    principioActivo: 'Clonazepam',
    presentacion: 'Comprimidos x 30',
    laboratorio: 'Roche',
    ean: '7790742000134',
    troquel: '2540013',
  },
  {
    id: 'vad-014',
    nombre: 'Ranitidina 150mg',
    principioActivo: 'Ranitidina clorhidrato',
    presentacion: 'Comprimidos recubiertos x 20',
    laboratorio: 'Bagó',
    ean: '7790742000141',
    troquel: '2540014',
  },
  {
    id: 'vad-015',
    nombre: 'Azitromicina 500mg',
    principioActivo: 'Azitromicina dihidrato',
    presentacion: 'Comprimidos recubiertos x 3',
    laboratorio: 'Roemmers',
    ean: '7790742000158',
    troquel: '2540015',
  },
  {
    id: 'vad-016',
    nombre: 'Ciprofloxacina 500mg',
    principioActivo: 'Ciprofloxacina clorhidrato',
    presentacion: 'Comprimidos recubiertos x 10',
    laboratorio: 'Bayer',
    ean: '7790742000165',
    troquel: '2540016',
  },
  {
    id: 'vad-017',
    nombre: 'Metoclopramida 10mg',
    principioActivo: 'Metoclopramida clorhidrato',
    presentacion: 'Comprimidos x 20',
    laboratorio: 'Andrómaco',
    ean: '7790742000172',
    troquel: '2540017',
  },
  {
    id: 'vad-018',
    nombre: 'Dipirona 500mg',
    principioActivo: 'Metamizol sódico',
    presentacion: 'Comprimidos x 10',
    laboratorio: 'Sanofi-Aventis',
    ean: '7790742000189',
    troquel: '2540018',
  },
  {
    id: 'vad-019',
    nombre: 'Cefalexina 500mg',
    principioActivo: 'Cefalexina monohidrato',
    presentacion: 'Cápsulas x 12',
    laboratorio: 'Bagó',
    ean: '7790742000196',
    troquel: '2540019',
  },
  {
    id: 'vad-020',
    nombre: 'Salbutamol 100mcg',
    principioActivo: 'Salbutamol sulfato',
    presentacion: 'Aerosol - Inhalador 200 dosis',
    laboratorio: 'GlaxoSmithKline',
    ean: '7790742000202',
    troquel: '2540020',
  },
];

export class MockVademecumService implements IVademecumService {
  async buscarMedicamentos(query: string): Promise<MedicamentoVademecum[]> {
    if (!query || query.trim().length === 0) {
      return MEDICAMENTOS;
    }
    const q = query.toLowerCase();
    return MEDICAMENTOS.filter(
      (m) =>
        m.nombre.toLowerCase().includes(q) ||
        m.principioActivo.toLowerCase().includes(q),
    );
  }

  async obtenerMedicamento(id: string): Promise<MedicamentoVademecum | null> {
    return MEDICAMENTOS.find((m) => m.id === id) || null;
  }
}
