import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const AuthCallback = () => {
  console.log('🚀 AuthCallback component loaded');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(true);
  
  console.log('📍 Component state:', { error, isProcessing });

  useEffect(() => {
    console.log('🔄 useEffect started');
    
    // Función simplificada
    const processAuth = async () => {
      try {
        console.log('🔍 Current URL:', window.location.href);
        
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        
        console.log('📊 Extracted params:', { 
          hasToken: !!token, 
          hasUser: !!userParam,
          tokenPreview: token ? token.substring(0, 30) + '...' : 'none'
        });
        
        if (!token || !userParam) {
          console.log('❌ Missing required params');
          setError('Datos de autenticación faltantes');
          setIsProcessing(false);
          return;
        }
        
        // Parse user data
        console.log('🔍 Raw user param:', userParam.substring(0, 100) + '...');
        const user = JSON.parse(decodeURIComponent(userParam));
        console.log('✅ Parsed user:', user);
        
        // Attempt login
        console.log('🔑 Starting login process...');
        await login(token, user);
        console.log('✅ Login completed, redirecting...');
        
        // Navigate to home
        navigate('/', { replace: true });
        
      } catch (error) {
        console.error('💥 Auth error:', error);
        setError(`Error: ${error.message}`);
        setIsProcessing(false);
      }
    };
    
    processAuth();
  }, []);

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