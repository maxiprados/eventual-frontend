import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

// Estados de autenticación
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer para manejar acciones de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          dispatch({ type: 'AUTH_START' });
          
          // Verificar que el token sigue siendo válido
          const response = await authService.verifyToken();
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: JSON.parse(userData),
              token: token,
            },
          });
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Sesión expirada',
          });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    verifyToken();
  }, []);

  // Función para hacer login (manejar callback de OAuth)
  const login = async (token, userData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Guardar en localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: userData,
          token: token,
        },
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Error en el login',
      });
      return { success: false, error: error.message };
    }
  };

  // Función para hacer logout
  const logout = async () => {
    try {
      if (state.isAuthenticated) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar localStorage independientemente del resultado de la API
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Función para renovar token
  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      const newToken = response.data.token;

      localStorage.setItem('authToken', newToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: state.user,
          token: newToken,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return { success: false, error: error.message };
    }
  };

  // Función para obtener la URL de login de Google
  const getGoogleAuthUrl = () => {
    return authService.getGoogleAuthUrl();
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Función para obtener perfil actualizado
  const getProfile = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.data.user;

      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: userData,
          token: state.token,
        },
      });

      return { success: true, user: userData };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    login,
    logout,
    refreshToken,
    getGoogleAuthUrl,
    clearError,
    getProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;