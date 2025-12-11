import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, Edit, Trash2, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EventMap from '../components/EventMap';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { eventService, utils } from '../services/api';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEventById(id);
      setEvent(response);
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Error cargando el evento. Puede que no exista o haya sido eliminado.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleting(true);
      await eventService.deleteEvent(id);
      navigate('/my-events', { 
        state: { message: 'Evento eliminado exitosamente' } 
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Error eliminando el evento. Inténtalo de nuevo.');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user && event && user.email === event.organizador;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Cargando evento..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert type="error">
            {error || 'Evento no encontrado'}
          </Alert>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header con botón de volver */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Imagen y título */}
            <div className="card">
              {event.imagen && (
                <div className="mb-6 -mt-6 -mx-6">
                  <img
                    src={event.imagen}
                    alt={event.nombre}
                    className="w-full h-64 object-cover rounded-t-xl"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {event.categoria && (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${utils.getCategoryColor(event.categoria)}`}>
                      {event.categoria}
                    </span>
                  )}
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {event.nombre}
                  </h1>
                </div>
                
                {/* Acciones del propietario */}
                {isAuthenticated && isOwner && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-700 transition-colors font-medium"
                      title="Editar evento"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors font-medium"
                      title="Eliminar evento"
                    >
                      {deleting ? (
                        <div className="loading-spinner w-4 h-4" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">
                        {deleting ? 'Eliminando...' : 'Eliminar'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Descripción */}
              {event.descripcion && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Descripción
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {event.descripcion}
                  </p>
                </div>
              )}
            </div>

            {/* Mapa */}
            <div className="card p-0">
              <div className="p-6 pb-0">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Ubicación
                </h2>
              </div>
              <EventMap
                center={[event.lat, event.lon]}
                events={[event]}
                className="h-64 rounded-b-xl"
              />
            </div>
          </div>

          {/* Sidebar con información */}
          <div className="space-y-6">
            
            {/* Información del evento */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Evento
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Fecha y hora</p>
                    <p className="text-gray-600">{utils.formatDate(event.timestamp)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Ubicación</p>
                    <p className="text-gray-600">{event.lugar}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center mt-1"
                    >
                      Ver en Google Maps
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Organizador</p>
                    <p className="text-gray-600">{event.organizador}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles adicionales */}
            {(event.precio > 0 || event.capacidad) && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Detalles Adicionales
                </h2>
                
                <div className="space-y-3">
                  {event.precio > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Precio</span>
                      <span className="font-semibold text-green-600">
                        €{event.precio.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {event.capacidad && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Capacidad máxima</span>
                      <span className="font-semibold text-gray-900">
                        {event.capacidad} personas
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información de creación */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Publicación
              </h2>
              
              <div className="space-y-2 text-sm text-gray-600">
                {event.createdAt && (
                  <p>
                    <span className="font-medium">Publicado:</span>{' '}
                    {utils.formatDate(event.createdAt)}
                  </p>
                )}
                {event.updatedAt && event.updatedAt !== event.createdAt && (
                  <p>
                    <span className="font-medium">Actualizado:</span>{' '}
                    {utils.formatDate(event.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;