import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { utils } from '../services/api';

const EventCard = ({ event, onEdit, onDelete, showActions = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwner = user && user.email === event.organizador;

  const handleViewDetails = () => {
    navigate(`/event/${event.id || event._id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(event);
    } else {
      navigate(`/edit/${event.id || event._id}`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(event);
    }
  };

  return (
    <div className="card-hover cursor-pointer transition-all duration-200 hover:scale-[1.02]">
      <div onClick={handleViewDetails}>
        {/* Imagen del evento */}
        {event.imagen && (
          <div className="mb-4 -mt-6 -mx-6">
            <img
              src={event.imagen}
              alt={event.nombre}
              className="w-full h-48 object-cover rounded-t-xl"
            />
          </div>
        )}

        {/* Categoría */}
        {event.categoria && (
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${utils.getCategoryColor(event.categoria)}`}>
              {event.categoria}
            </span>
          </div>
        )}

        {/* Título */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {event.nombre}
        </h3>

        {/* Descripción */}
        {event.descripcion && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {utils.truncateText(event.descripcion, 120)}
          </p>
        )}

        {/* Información del evento */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            <span>{utils.formatDate(event.timestamp)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-red-500" />
            <span className="line-clamp-1">{event.lugar}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 text-green-500" />
            <span className="line-clamp-1">{event.organizador}</span>
          </div>
        </div>

        {/* Información adicional */}
        {(event.precio > 0 || event.capacidad) && (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            {event.precio > 0 && (
              <span className="font-medium text-green-600">
                €{event.precio.toFixed(2)}
              </span>
            )}
            {event.capacidad && (
              <span className="text-gray-500">
                Capacidad: {event.capacidad}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={handleViewDetails}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          <Eye className="h-4 w-4" />
          <span>Ver detalles</span>
        </button>

        {(showActions && isOwner) && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-700 transition-colors"
              title="Editar evento"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
              title="Eliminar evento"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;