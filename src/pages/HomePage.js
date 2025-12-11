import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import EventCard from '../components/EventCard';
import EventMap from '../components/EventMap';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { eventService } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [filters, setFilters] = useState({
    categoria: '',
    fechaInicio: '',
    fechaFin: '',
    precioMax: ''
  });
  const [showMap, setShowMap] = useState(true);

  // Cargar todos los eventos al montar el componente
  useEffect(() => {
    loadAllEvents();
  }, []);

  // Filtrar eventos cuando cambien los filtros
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadAllEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Error cargando eventos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const searchEvents = async () => {
    if (!searchAddress.trim()) {
      await loadAllEvents();
      setMapCenter(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Primero obtener coordenadas de la dirección
      const geocodeResponse = await eventService.geocodeAddress(searchAddress);
      const { lat, lon } = geocodeResponse;
      
      setMapCenter([lat, lon]);
      
      // Buscar eventos cerca de esas coordenadas
      const eventsResponse = await eventService.getEvents({ lat, lon });
      setEvents(eventsResponse.events || []);
      
      if (eventsResponse.events.length === 0) {
        setError('No se encontraron eventos cercanos a esa ubicación.');
      }
    } catch (error) {
      console.error('Error searching events:', error);
      setError(error.response?.data?.details || 'Error buscando eventos. Verifica la dirección e inténtalo de nuevo.');
      setMapCenter(null);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...events];

    // Filtro por categoría
    if (filters.categoria) {
      filtered = filtered.filter(event => event.categoria === filters.categoria);
    }

    // Filtro por fecha de inicio
    if (filters.fechaInicio) {
      const fechaInicio = new Date(filters.fechaInicio);
      filtered = filtered.filter(event => new Date(event.timestamp) >= fechaInicio);
    }

    // Filtro por fecha de fin
    if (filters.fechaFin) {
      const fechaFin = new Date(filters.fechaFin);
      fechaFin.setHours(23, 59, 59, 999); // Final del día
      filtered = filtered.filter(event => new Date(event.timestamp) <= fechaFin);
    }

    // Filtro por precio máximo
    if (filters.precioMax) {
      const precioMax = parseFloat(filters.precioMax);
      filtered = filtered.filter(event => event.precio <= precioMax);
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      categoria: '',
      fechaInicio: '',
      fechaFin: '',
      precioMax: ''
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchEvents();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Descubre Eventos Increíbles
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra eventos culturales, deportivos, musicales y más cerca de ti
          </p>
        </div>

        {/* Búsqueda */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Introduce una dirección para buscar eventos cercanos..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={searchEvents}
                disabled={loading}
                className="btn-primary px-6"
              >
                {loading ? (
                  <div className="loading-spinner w-5 h-5" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className="btn-secondary px-4"
              >
                {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="form-label">Categoría</label>
              <select
                value={filters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                className="form-input"
              >
                <option value="">Todas las categorías</option>
                <option value="cultural">Cultural</option>
                <option value="deportivo">Deportivo</option>
                <option value="musical">Musical</option>
                <option value="educativo">Educativo</option>
                <option value="gastronómico">Gastronómico</option>
                <option value="tecnológico">Tecnológico</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="form-label">Fecha desde</label>
              <input
                type="date"
                value={filters.fechaInicio}
                onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Fecha hasta</label>
              <input
                type="date"
                value={filters.fechaFin}
                onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Precio máximo (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.precioMax}
                onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                placeholder="Sin límite"
                className="form-input"
              />
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="btn-secondary text-sm"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Error */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Mapa */}
        {showMap && (
          <div className="mb-8">
            <div className="card p-0">
              <EventMap
                center={mapCenter}
                events={filteredEvents}
                onEventClick={(event) => navigate(`/event/${event.id || event._id}`)}
                className="h-96 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Lista de eventos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-blue-600" />
              Eventos {searchAddress && 'Cercanos'}
              <span className="text-gray-500 text-lg font-normal ml-2">
                ({filteredEvents.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <LoadingSpinner text="Buscando eventos..." />
          ) : filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id || event._id}
                  event={event}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No hay eventos disponibles
              </h3>
              <p className="text-gray-600">
                {searchAddress
                  ? 'Intenta con otra dirección o modifica los filtros'
                  : 'Actualmente no hay eventos registrados'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;