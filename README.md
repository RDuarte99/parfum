# Parfum - E-commerce de Cosmética y Perfumería

Aplicación web orientada a la comercialización de productos de cosmética y perfumería con base de datos en PostgreSQL.

## Funcionalidades implementadas

- Página inicial con **carrusel de 6 imágenes** promocionales.
- Catálogo de productos con filtros por:
  - Precio mínimo y máximo
  - Marca
  - Grupo
- Flujo de compra con botón de pago que **redirige a WhatsApp** para enviar el comprobante.
- Persistencia de productos en **PostgreSQL** (con carga inicial automática de productos de ejemplo).

## Requisitos

- Node.js 18+
- PostgreSQL 13+

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Copia variables de entorno:

```bash
cp .env.example .env
```

3. Configura `DATABASE_URL` y `WHATSAPP_NUMBER` en `.env`.

Ejemplo:

```env
PORT=3000
DATABASE_URL=postgresql://localhost:5432/parfum
DATABASE_SSL=false
WHATSAPP_NUMBER=51999999999
```

## Ejecución

```bash
npm run dev
```

La aplicación estará disponible en:

- `http://localhost:3000/`
- `http://localhost:3000/products`

## Endpoints principales

- `GET /` → Inicio con carrusel y destacados
- `GET /products` → Catálogo con filtros (`minPrice`, `maxPrice`, `brand`, `group`)
- `POST /checkout/whatsapp` → Redirección a WhatsApp con el resumen del pedido
