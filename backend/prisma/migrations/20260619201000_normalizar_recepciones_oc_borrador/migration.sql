UPDATE recepciones
SET estado = 'BORRADOR'
WHERE estado = 'PROCESADA'
  AND solicitudCompraId IS NOT NULL
  AND observaciones LIKE 'Generada desde orden de compra%';

UPDATE solicitudes_compra
SET estado = 'EN_RECEPCION'
WHERE id IN (
  SELECT solicitudCompraId
  FROM recepciones
  WHERE solicitudCompraId IS NOT NULL
);
