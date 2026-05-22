import { Router } from 'express';
import { Container } from '../../../infrastructure/container';
import { vademecumRoutes } from './vademecum.routes';
import { proveedorRoutes } from './proveedor.routes';
import { inventarioRoutes } from './inventario.routes';
import { recepcionRoutes } from './recepcion.routes';
import { alertaRoutes } from './alerta.routes';
import { solicitudCompraRoutes } from './solicitud-compra.routes';
import { recetaRoutes } from './receta.routes';

export function createRoutes(container: Container): Router {
  const router = Router();

  router.use('/vademecum', vademecumRoutes(container));
  router.use('/proveedores', proveedorRoutes(container));
  router.use('/inventario', inventarioRoutes(container));
  router.use('/recepciones', recepcionRoutes(container));
  router.use('/alertas', alertaRoutes(container));
  router.use('/solicitudes-compra', solicitudCompraRoutes(container));
  router.use('/recetas', recetaRoutes(container));

  return router;
}
