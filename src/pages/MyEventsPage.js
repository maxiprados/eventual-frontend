import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { eventService } from '../services/api';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Mensaje de éxito desde navegación
  const [successMessage, setSuccessMessage] = useState(location.state?.message);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadMyEvents();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getMyEvents();
      console.log('Mis eventos response:', response.data); // Debug
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading my events:', error);
      setError('Error cargando tus eventos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    navigate(`/edit/${event.id || event._id}`);
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${event.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeleting(event.id || event._id);
      await eventService.deleteEvent(event.id || event._id);
      
      // Actualizar la lista eliminando el evento
      setEvents(prevEvents => 
        prevEvents.filter(e => (e.id || e._id) !== (event.id || event._id))
      );
      
      setSuccessMessage('Evento eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Error eliminando el evento. Inténtalo de nuevo.');
    } finally {
      setDeleting(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <LoadingSpinner text="Verificando autenticación..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-blue-600" />
              Mis Eventos
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona los eventos que has creado
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => navigate('/create')}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Evento
            </button>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <Alert type="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Error */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Información del usuario */}
        <div className="card mb-8">
          <div className="flex items-center space-x-3">
            {user?.picture && (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="h-12 w-12 rounded-full"
              />
            )}
            <div>
              <h2 className="text-lg font-medium text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            <p className="text-gray-600">Eventos totales</p>
          </div>
          <div className="card text-center">
            <AlertCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {events.filter(e => new Date(e.timestamp) > new Date()).length}
            </p>
            <p className="text-gray-600">Eventos próximos</p>
          </div>
          <div className="card text-center">
            <Edit className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {events.filter(e => new Date(e.timestamp) <= new Date()).length}
            </p>
            <p className="text-gray-600">Eventos pasados</p>
          </div>
        </div>

        {/* Lista de eventos */}
        <div>
          {loading ? (
            <LoadingSpinner text="Cargando tus eventos..." />
          ) : events.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tus Eventos ({events.length})
                </h2>
              </div>
              
              <div className="events-grid">
                {events.map((event) => (
                  <div key={event.id || event._id} className="relative">
                    {deleting === (event.id || event._id) && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
                        <LoadingSpinner size="small" text="Eliminando..." />
                      </div>
                    )}
                    <EventCard
                      event={event}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      showActions={true}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No tienes eventos creados
              </h3>
              <p className="text-gray-600 mb-6">
                ¡Crea tu primer evento y compártelo con la comunidad!
              </p>
              <button
                onClick={() => navigate('/create')}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear mi primer evento
              </button>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {events.length > 0 && (
          <div className="mt-12 card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información importante
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Solo tú puedes editar o eliminar tus eventos</p>
              <p>• Los eventos se muestran públicamente una vez creados</p>
              <p>• Las imágenes se almacenan de forma segura en Cloudinary</p>
              <p>• Los eventos pasados siguen siendo visibles para referencia</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;