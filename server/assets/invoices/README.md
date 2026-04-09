Plantillas de factura para Exploradores del Rey

Modo de render por defecto:
- Vectorial (nítido, sin pixelado). No requiere plantilla de fondo.

Archivos esperados para modo plantilla:
- factura-exploradores.png : plantilla base del comprobante/factura (opcional)
- firma-contadora.png : firma de la contadora (opcional)

Variables de entorno opcionales:
- INVOICE_RENDER_MODE : vector (default) | template
- INVOICE_TEMPLATE_PATH : ruta absoluta a la plantilla
- ACCOUNTANT_SIGNATURE_PATH : ruta absoluta a la firma
- ACCOUNTANT_NAME : nombre de la contadora para texto/firma fallback
- INVOICE_CITY : ciudad mostrada en la factura (default: Sincelejo)

Si no existe firma-contadora.png, el sistema dibuja una linea de firma y el nombre de la contadora en texto.
