# Eventual Frontend

Frontend de la aplicación Eventual - Gestión de eventos.

## 🚀 Tecnologías

- **React 18** - Framework frontend
- **React Router** - Navegación SPA
- **Tailwind CSS** - Estilos
- **Leaflet** - Mapas interactivos
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## 🔧 Variables de entorno

Crear archivo `.env.local`:

```bash
REACT_APP_API_URL=https://eventual-backend.onrender.com/api
```

## 📦 Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start

# Build para producción
npm run build
```

## 🌐 Despliegue en Vercel

1. Conectar repositorio a Vercel
2. Configurar variable de entorno:
   - `REACT_APP_API_URL`: URL del backend en Render
3. Desplegar automáticamente

## 🔗 Backend

El backend se encuentra en: https://github.com/maxiprados/eventual-backend