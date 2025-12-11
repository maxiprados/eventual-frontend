import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Auth callback processing...', window.location.href);
        console.log('🔍 Search params:', Object.fromEntries(searchParams));
        
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        
        console.log('Token:', token ? `present (${token.substring(0, 20)}...)` : 'missing');
        console.log('User param:', userParam ? 'present' : 'missing');
        
        if (token && userParam) {
          console.log('📝 Raw user param:', userParam);
          const user = JSON.parse(decodeURIComponent(userParam));
          console.log('✅ Parsed user:', user);
          
          console.log('🔑 Attempting login...');
          const result = await login(token, user);
          console.log('📊 Login result:', result);
          
          if (result?.success !== false) {
            console.log('✅ Login successful, navigating to home...');
            setIsProcessing(false);
            navigate('/', { replace: true });
          } else {
            console.log('❌ Login failed');
            setIsProcessing(false);
            setError(result?.error || 'Error en el login');
          }
        } else {
          console.log('❌ Missing auth data');
          setIsProcessing(false);
          setError('Datos de autenticación faltantes. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('❌ Error in auth callback:', error);
        setIsProcessing(false);
        setError(`Error procesando autenticación: ${error.message}`);
      }
    };

    // Timeout de seguridad - si no procesa en 10 segundos, mostrar error
    const timeout = setTimeout(() => {
      if (isProcessing) {
        console.log('⏰ Auth callback timeout');
        setIsProcessing(false);
        setError('Tiempo de espera agotado procesando autenticación');
      }
    }, 10000);

    handleAuthCallback();

    return () => clearTimeout(timeout);
  }, [searchParams, login, navigate, isProcessing]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <Alert type="error" title="Error de Autenticación">
            {error}
          </Alert>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" text="Completando autenticación..." />
          <p className="text-gray-600 mt-4">Procesando datos de Google OAuth...</p>
        </div>
      </div>
    );
  }

  // Este estado no debería alcanzarse, pero por seguridad
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
};

export default AuthCallback;