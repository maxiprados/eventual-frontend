import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en React
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventMap = ({ center, events, onEventClick, className = '' }) => {
  const defaultCenter = center || [36.8381, -2.4597]; // Almería por defecto
  const defaultZoom = center ? 13 : 10;

  // Crear icono personalizado para eventos
  const eventIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Crear icono para ubicación de búsqueda
  const searchIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Marcador de ubicación de búsqueda */}
        {center && (
          <Marker position={center} icon={searchIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-medium text-blue-600">Ubicación de búsqueda</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de eventos */}
        {events && events.map((event) => (
          <Marker 
            key={event.id || event._id} 
            position={[event.lat, event.lon]} 
            icon={eventIcon}
          >
            <Popup>
              <div className="max-w-xs">
                <div className="mb-2">
                  {event.imagen && (
                    <img 
                      src={event.imagen} 
                      alt={event.nombre}
                      className="w-full h-20 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {event.nombre}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    📅 {formatDate(event.timestamp)}
                  </p>
                  <p className="text-xs text-gray-600">
                    📍 {event.lugar}
                  </p>
                  <p className="text-xs text-gray-600">
                    👤 {event.organizador}
                  </p>
                  {event.categoria && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(event.categoria)}`}>
                      {event.categoria}
                    </span>
                  )}
                </div>
                {onEventClick && (
                  <button
                    onClick={() => onEventClick(event)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
                  >
                    Ver detalles
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Función helper para obtener colores de categoría
const getCategoryColor = (category) => {
  const colors = {
    'cultural': 'bg-purple-100 text-purple-800',
    'deportivo': 'bg-green-100 text-green-800',
    'musical': 'bg-pink-100 text-pink-800',
    'educativo': 'bg-blue-100 text-blue-800',
    'gastronómico': 'bg-orange-100 text-orange-800',
    'tecnológico': 'bg-gray-100 text-gray-800',
    'otro': 'bg-yellow-100 text-yellow-800'
  };
  return colors[category] || colors['otro'];
};

export default EventMap;