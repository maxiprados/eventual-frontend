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

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Auth callback processing...', window.location.href);
        
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        
        console.log('Token:', token ? 'present' : 'missing');
        console.log('User param:', userParam ? 'present' : 'missing');
        
        if (token && userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          console.log('✅ Parsed user:', user);
          await login(token, user);
          navigate('/', { replace: true });
        } else {
          console.log('❌ Missing auth data');
          setError('Datos de autenticación faltantes. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('❌ Error in auth callback:', error);
        setError('Error procesando autenticación. Inténtalo de nuevo.');
      }
    };

    handleAuthCallback();
  }, [searchParams, login, navigate]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="large" text="Completando autenticación..." />
    </div>
  );
};

export default AuthCallback;