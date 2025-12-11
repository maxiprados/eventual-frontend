import axios from 'axios';

// Detectar si estamos en producción o desarrollo
const isProduction = process.env.NODE_ENV === 'production';

// URL base de la API
const API_BASE_URL = isProduction 
  ? process.env.REACT_APP_API_URL || 'https://eventual-backend-r8yc.onrender.com/api'  // En producción, usar backend en Render
  : process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // En desarrollo, usar localhost

console.log('🌍 Entorno:', process.env.NODE_ENV);
console.log('📡 API URL:', API_BASE_URL);

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Aumentar timeout para Vercel
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Importante para las cookies de sesión
});

// Interceptor para agregar token de autorización
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', error);
    
    // Si el token expiró o es inválido, limpiar el localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir al login solo si no estamos ya en una página pública
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/auth/callback'];
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

// Servicios de eventos
export const eventService = {
  // Obtener todos los eventos o filtrados
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo eventos:', error);
      throw error;
    }
  },

  // Obtener un evento por ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo evento:', error);
      throw error;
    }
  },

  // Obtener eventos del usuario autenticado
  getMyEvents: async () => {
    try {
      const response = await api.get('/events/user/my-events');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mis eventos:', error);
      throw error;
    }
  },

  // Crear nuevo evento
  createEvent: async (eventData) => {
    try {
      const formData = new FormData();
      
      // Agregar todos los campos del evento
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key]);
        }
      });

      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creando evento:', error);
      throw error;
    }
  },

  // Actualizar evento
  updateEvent: async (id, eventData) => {
    try {
      const formData = new FormData();
      
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key]);
        }
      });

      const response = await api.put(`/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error actualizando evento:', error);
      throw error;
    }
  },

  // Eliminar evento
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando evento:', error);
      throw error;
    }
  },

  // Geocodificar dirección
  geocodeAddress: async (address) => {
    try {
      const response = await api.post('/events/geocode', { address });
      return response.data;
    } catch (error) {
      console.error('Error en geocoding:', error);
      throw error;
    }
  }
};

// Servicios de autenticación
export const authService = {
  // Verificar estado de autenticación
  verifyAuth: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      throw error;
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar localStorage aunque falle la request
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Obtener URL de login con Google
  getGoogleLoginUrl: () => {
    return `${API_BASE_URL}/auth/google`;
  }
};

// Servicios de logs
export const logService = {
  // Obtener logs de autenticación
  getLogs: async (params = {}) => {
    try {
      const response = await api.get('/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      throw error;
    }
  },

  // Obtener estadísticas de logs
  getLogStats: async () => {
    try {
      const response = await api.get('/logs/stats');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // Exportar logs a CSV
  exportLogs: async (params = {}) => {
    try {
      const response = await api.get('/logs/export', {
        params,
        responseType: 'blob'
      });
      
      // Crear URL de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exportando logs:', error);
      throw error;
    }
  }
};

// Utilidades
export const utils = {
  // Formatear fecha para mostrar
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Formatear fecha relativa (hace X tiempo)
  formatRelativeDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES');
  },

  // Capitalizar primera letra
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Formatear precio
  formatPrice: (price) => {
    if (!price || price === 0) return 'Gratis';
    return `${price}€`;
  },

  // Obtener color por categoría
  getCategoryColor: (category) => {
    const colors = {
      'cultural': 'bg-purple-100 text-purple-800',
      'deportivo': 'bg-green-100 text-green-800',
      'musical': 'bg-pink-100 text-pink-800',
      'educativo': 'bg-blue-100 text-blue-800',
      'gastronómico': 'bg-orange-100 text-orange-800',
      'tecnológico': 'bg-indigo-100 text-indigo-800',
      'otro': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['otro'];
  },

  // Validar email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Truncar texto
  truncateText: (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
};

export default api;