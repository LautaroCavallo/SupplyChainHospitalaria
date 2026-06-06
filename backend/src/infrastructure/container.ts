import { PrismaProveedorRepository } from './database/repositories/PrismaProveedorRepository';
import { PrismaInventarioRepository } from './database/repositories/PrismaInventarioRepository';
import { PrismaLoteRepository } from './database/repositories/PrismaLoteRepository';
import { PrismaMovimientoStockRepository } from './database/repositories/PrismaMovimientoStockRepository';
import { PrismaRecepcionRepository } from './database/repositories/PrismaRecepcionRepository';
import { PrismaSolicitudCompraRepository } from './database/repositories/PrismaSolicitudCompraRepository';
import { VademecumFixtureService } from './external/fixtures/VademecumFixtureService';
import { RecetaFixtureService } from './external/fixtures/RecetaFixtureService';
import { ComprasFixtureService } from './external/fixtures/ComprasFixtureService';
import { CoreAuthService } from './external/core/CoreAuthService';
import { HceRecetaService } from './external/hce/HceRecetaService';
import { config } from '../config';

import { BuscarMedicamentos } from '../application/use-cases/vademecum/BuscarMedicamentos';
import { ObtenerMedicamento } from '../application/use-cases/vademecum/ObtenerMedicamento';
import { ListarProveedores } from '../application/use-cases/proveedores/ListarProveedores';
import { ObtenerProveedor } from '../application/use-cases/proveedores/ObtenerProveedor';
import { CrearProveedor } from '../application/use-cases/proveedores/CrearProveedor';
import { ActualizarProveedor } from '../application/use-cases/proveedores/ActualizarProveedor';
import { EliminarProveedor } from '../application/use-cases/proveedores/EliminarProveedor';
import { ListarInventario } from '../application/use-cases/inventario/ListarInventario';
import { ObtenerProductoInventario } from '../application/use-cases/inventario/ObtenerProductoInventario';
import { ObtenerProductoPorEan } from '../application/use-cases/inventario/ObtenerProductoPorEan';
import { AjustarStock } from '../application/use-cases/inventario/AjustarStock';
import { ObtenerMovimientos } from '../application/use-cases/inventario/ObtenerMovimientos';
import { ObtenerLotes } from '../application/use-cases/inventario/ObtenerLotes';
import { DetectarStockCritico } from '../application/use-cases/alertas/DetectarStockCritico';
import { ListarRecepciones } from '../application/use-cases/recepciones/ListarRecepciones';
import { ObtenerRecepcion } from '../application/use-cases/recepciones/ObtenerRecepcion';
import { CrearRecepcion } from '../application/use-cases/recepciones/CrearRecepcion';
import { ActualizarRecepcion } from '../application/use-cases/recepciones/ActualizarRecepcion';
import { ConfirmarRecepcion } from '../application/use-cases/recepciones/ConfirmarRecepcion';
import { ProcesarRecepcion } from '../application/use-cases/recepciones/ProcesarRecepcion';
import { ListarSolicitudesCompra } from '../application/use-cases/solicitudes/ListarSolicitudesCompra';
import { CrearSolicitudCompra } from '../application/use-cases/solicitudes/CrearSolicitudCompra';
import { ValidarReceta } from '../application/use-cases/recetas/ValidarReceta';
import { ConsumirReceta } from '../application/use-cases/recetas/ConsumirReceta';

export function createContainer() {
  let currentAuthToken: string | undefined;
  const proveedorRepo = new PrismaProveedorRepository();
  const inventarioRepo = new PrismaInventarioRepository();
  const loteRepo = new PrismaLoteRepository();
  const movimientoRepo = new PrismaMovimientoStockRepository();
  const recepcionRepo = new PrismaRecepcionRepository();
  const solicitudCompraRepo = new PrismaSolicitudCompraRepository();

  const vademecumService = new VademecumFixtureService();
  const coreAuthService = new CoreAuthService();
  const hceRecetaService = new HceRecetaService(() => currentAuthToken);
  const recetaService = config.integrations.recetaMode === 'hce' && hceRecetaService.enabled
    ? hceRecetaService
    : new RecetaFixtureService();
  const _comprasService = new ComprasFixtureService();

  const buscarMedicamentos = new BuscarMedicamentos(vademecumService);
  const obtenerMedicamento = new ObtenerMedicamento(vademecumService);

  const listarProveedores = new ListarProveedores(proveedorRepo);
  const obtenerProveedor = new ObtenerProveedor(proveedorRepo);
  const crearProveedor = new CrearProveedor(proveedorRepo);
  const actualizarProveedor = new ActualizarProveedor(proveedorRepo);
  const eliminarProveedor = new EliminarProveedor(proveedorRepo);

  const listarInventario = new ListarInventario(inventarioRepo);
  const obtenerProductoInventario = new ObtenerProductoInventario(inventarioRepo);
  const obtenerProductoPorEan = new ObtenerProductoPorEan(inventarioRepo);
  const ajustarStock = new AjustarStock(inventarioRepo, movimientoRepo, loteRepo);
  const obtenerMovimientos = new ObtenerMovimientos(movimientoRepo);
  const obtenerLotes = new ObtenerLotes(loteRepo);

  const detectarStockCritico = new DetectarStockCritico(inventarioRepo);

  const listarRecepciones = new ListarRecepciones(recepcionRepo);
  const obtenerRecepcion = new ObtenerRecepcion(recepcionRepo);
  const crearRecepcion = new CrearRecepcion(recepcionRepo, proveedorRepo);
  const actualizarRecepcion = new ActualizarRecepcion(recepcionRepo, proveedorRepo);
  const confirmarRecepcion = new ConfirmarRecepcion(recepcionRepo);
  const procesarRecepcion = new ProcesarRecepcion(recepcionRepo, inventarioRepo, loteRepo, movimientoRepo);

  const listarSolicitudesCompra = new ListarSolicitudesCompra(solicitudCompraRepo);
  const crearSolicitudCompra = new CrearSolicitudCompra(solicitudCompraRepo, inventarioRepo);

  const validarReceta = new ValidarReceta(recetaService, movimientoRepo);
  const consumirReceta = new ConsumirReceta(recetaService, inventarioRepo, movimientoRepo);

  return {
    buscarMedicamentos,
    obtenerMedicamento,
    listarProveedores,
    obtenerProveedor,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor,
    listarInventario,
    obtenerProductoInventario,
    obtenerProductoPorEan,
    ajustarStock,
    obtenerMovimientos,
    obtenerLotes,
    detectarStockCritico,
    listarRecepciones,
    obtenerRecepcion,
    crearRecepcion,
    actualizarRecepcion,
    confirmarRecepcion,
    procesarRecepcion,
    listarSolicitudesCompra,
    crearSolicitudCompra,
    validarReceta,
    consumirReceta,
    coreAuthService,
    setCurrentAuthToken: (token?: string) => {
      currentAuthToken = token;
    },
  };
}

export type Container = ReturnType<typeof createContainer>;
