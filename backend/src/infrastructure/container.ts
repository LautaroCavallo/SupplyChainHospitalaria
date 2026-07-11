import { PrismaProveedorRepository } from './database/repositories/PrismaProveedorRepository';
import { PrismaInventarioRepository } from './database/repositories/PrismaInventarioRepository';
import { PrismaLoteRepository } from './database/repositories/PrismaLoteRepository';
import { PrismaMovimientoStockRepository } from './database/repositories/PrismaMovimientoStockRepository';
import { PrismaRecepcionRepository } from './database/repositories/PrismaRecepcionRepository';
import { PrismaSolicitudCompraRepository } from './database/repositories/PrismaSolicitudCompraRepository';
import { PrismaNotificacionRepository } from './database/repositories/PrismaNotificacionRepository';
import { PrismaDepositoRepository } from './database/repositories/PrismaDepositoRepository';
import { VademecumFixtureService } from './external/fixtures/VademecumFixtureService';
import { RecetaFixtureService } from './external/fixtures/RecetaFixtureService';
import { ComprasFixtureService } from './external/fixtures/ComprasFixtureService';
import { HttpComprasService } from './external/compras/HttpComprasService';
import { CoreAuthService } from './external/core/CoreAuthService';
import { CoreClient } from './external/core/CoreClient';
import { HceRecetaService } from './external/hce/HceRecetaService';
import { KafkaEventPublisher } from './messaging/KafkaEventPublisher';
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
import { ObtenerInventarioSummary } from '../application/use-cases/inventario/ObtenerInventarioSummary';
import { AjustarStock } from '../application/use-cases/inventario/AjustarStock';
import { ObtenerMovimientos } from '../application/use-cases/inventario/ObtenerMovimientos';
import { ObtenerLotes } from '../application/use-cases/inventario/ObtenerLotes';
import { ObtenerHistorialLote } from '../application/use-cases/inventario/ObtenerHistorialLote';
import { DetectarStockCritico } from '../application/use-cases/alertas/DetectarStockCritico';
import { ListarRecepciones } from '../application/use-cases/recepciones/ListarRecepciones';
import { ObtenerRecepcion } from '../application/use-cases/recepciones/ObtenerRecepcion';
import { CrearRecepcion } from '../application/use-cases/recepciones/CrearRecepcion';
import { CrearRecepcionDesdeOrdenCompra } from '../application/use-cases/recepciones/CrearRecepcionDesdeOrdenCompra';
import { ActualizarRecepcion } from '../application/use-cases/recepciones/ActualizarRecepcion';
import { ConfirmarRecepcion } from '../application/use-cases/recepciones/ConfirmarRecepcion';
import { ProcesarRecepcion } from '../application/use-cases/recepciones/ProcesarRecepcion';
import { ListarSolicitudesCompra } from '../application/use-cases/solicitudes/ListarSolicitudesCompra';
import { CrearSolicitudCompra } from '../application/use-cases/solicitudes/CrearSolicitudCompra';
import { GenerarSolicitudAutomatica } from '../application/use-cases/solicitudes/GenerarSolicitudAutomatica';
import { ListarDepositos } from '../application/use-cases/depositos/ListarDepositos';
import { CrearDeposito } from '../application/use-cases/depositos/CrearDeposito';
import { TransferirStock } from '../application/use-cases/depositos/TransferirStock';
import { ObtenerStockPorDeposito } from '../application/use-cases/depositos/ObtenerStockPorDeposito';
import { ActualizarSolicitudCompra } from '../application/use-cases/solicitudes/ActualizarSolicitudCompra';
import { EliminarSolicitudCompra } from '../application/use-cases/solicitudes/EliminarSolicitudCompra';
import { ConfirmarBorrador } from '../application/use-cases/solicitudes/ConfirmarBorrador';
import { EnviarOrdenCompra } from '../application/use-cases/solicitudes/EnviarOrdenCompra';
import { ConfirmarAdjudicacion } from '../application/use-cases/solicitudes/ConfirmarAdjudicacion';
import { ValidarReceta } from '../application/use-cases/recetas/ValidarReceta';
import { ConsumirReceta } from '../application/use-cases/recetas/ConsumirReceta';
import { ObtenerDashboard } from '../application/use-cases/dashboard/ObtenerDashboard';
import { ObtenerActividadReciente } from '../application/use-cases/dashboard/ObtenerActividadReciente';

export function createContainer() {
  let currentAuthToken: string | undefined;
  const proveedorRepo = new PrismaProveedorRepository();
  const inventarioRepo = new PrismaInventarioRepository();
  const loteRepo = new PrismaLoteRepository();
  const movimientoRepo = new PrismaMovimientoStockRepository();
  const recepcionRepo = new PrismaRecepcionRepository();
  const solicitudCompraRepo = new PrismaSolicitudCompraRepository();
  const notificacionRepo = new PrismaNotificacionRepository();
  const depositoRepo = new PrismaDepositoRepository();

  const vademecumService = new VademecumFixtureService();
  const coreAuthService = new CoreAuthService();
  // Cliente de servicio a Core (token para autenticar llamadas REST a otros módulos).
  const coreClient = new CoreClient();
  const hceRecetaService = new HceRecetaService(() => currentAuthToken, coreClient);
  const recetaService = config.integrations.recetaMode === 'hce' && hceRecetaService.enabled
    ? hceRecetaService
    : new RecetaFixtureService();

  // Módulo 7 (Compras) exige JWT de Core → HttpComprasService usa el token de servicio de CoreClient.
  const comprasService = config.integrations.comprasApiUrl
    ? new HttpComprasService(config.integrations.comprasApiUrl, (force) => coreClient.getServiceToken(force))
    : new ComprasFixtureService();

  // Publisher de eventos (Kafka). Lo usa la API para encolar el envío a Compras;
  // el worker lo reutiliza para publicar en el Dead Letter Topic.
  const eventPublisher = new KafkaEventPublisher();

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
  const obtenerInventarioSummary = new ObtenerInventarioSummary(inventarioRepo);
  const generarSolicitudAutomatica = new GenerarSolicitudAutomatica(inventarioRepo, solicitudCompraRepo, notificacionRepo);
  const ajustarStock = new AjustarStock(inventarioRepo, movimientoRepo, loteRepo, generarSolicitudAutomatica);
  const obtenerMovimientos = new ObtenerMovimientos(movimientoRepo);
  const obtenerLotes = new ObtenerLotes(loteRepo);
  const obtenerHistorialLote = new ObtenerHistorialLote(movimientoRepo);

  const detectarStockCritico = new DetectarStockCritico(inventarioRepo);

  const listarRecepciones = new ListarRecepciones(recepcionRepo);
  const obtenerRecepcion = new ObtenerRecepcion(recepcionRepo);
  const crearRecepcion = new CrearRecepcion(recepcionRepo, proveedorRepo, notificacionRepo);
  const crearRecepcionDesdeOrdenCompra = new CrearRecepcionDesdeOrdenCompra(recepcionRepo, solicitudCompraRepo, proveedorRepo);
  const actualizarRecepcion = new ActualizarRecepcion(recepcionRepo, proveedorRepo);
  const confirmarRecepcion = new ConfirmarRecepcion(recepcionRepo);
  const procesarRecepcion = new ProcesarRecepcion(recepcionRepo);

  const listarSolicitudesCompra = new ListarSolicitudesCompra(solicitudCompraRepo);
  const crearSolicitudCompra = new CrearSolicitudCompra(solicitudCompraRepo, inventarioRepo);
  const actualizarSolicitudCompra = new ActualizarSolicitudCompra(solicitudCompraRepo, inventarioRepo);
  const eliminarSolicitudCompra = new EliminarSolicitudCompra(solicitudCompraRepo);
  const confirmarBorrador = new ConfirmarBorrador(solicitudCompraRepo);
  const enviarOrdenCompra = new EnviarOrdenCompra(solicitudCompraRepo, eventPublisher);
  const confirmarAdjudicacion = new ConfirmarAdjudicacion(solicitudCompraRepo);

  const validarReceta = new ValidarReceta(recetaService, movimientoRepo, inventarioRepo);
  const consumirReceta = new ConsumirReceta(recetaService, inventarioRepo, movimientoRepo, notificacionRepo, generarSolicitudAutomatica);
  const obtenerDashboard = new ObtenerDashboard(inventarioRepo, movimientoRepo);
  const obtenerActividadReciente = new ObtenerActividadReciente(movimientoRepo);

  const listarDepositos = new ListarDepositos(depositoRepo);
  const crearDeposito = new CrearDeposito(depositoRepo);
  const transferirStock = new TransferirStock(depositoRepo);
  const obtenerStockPorDeposito = new ObtenerStockPorDeposito(depositoRepo);

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
    obtenerInventarioSummary,
    ajustarStock,
    obtenerMovimientos,
    obtenerLotes,
    obtenerHistorialLote,
    detectarStockCritico,
    listarRecepciones,
    obtenerRecepcion,
    crearRecepcion,
    crearRecepcionDesdeOrdenCompra,
    actualizarRecepcion,
    confirmarRecepcion,
    procesarRecepcion,
    listarSolicitudesCompra,
    crearSolicitudCompra,
    actualizarSolicitudCompra,
    eliminarSolicitudCompra,
    confirmarBorrador,
    enviarOrdenCompra,
    confirmarAdjudicacion,
    solicitudCompraRepository: solicitudCompraRepo,
    validarReceta,
    consumirReceta,
    obtenerDashboard,
    obtenerActividadReciente,
    listarDepositos,
    crearDeposito,
    transferirStock,
    obtenerStockPorDeposito,
    coreAuthService,
    coreClient,
    comprasService,
    eventPublisher,
    inventarioRepository: inventarioRepo,
    loteRepository: loteRepo,
    notificacionRepository: notificacionRepo,
    setCurrentAuthToken: (token?: string) => {
      currentAuthToken = token;
    },
  };
}

export type Container = ReturnType<typeof createContainer>;
