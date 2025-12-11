import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Upload, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { eventService } from '../services/api';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalEvent, setOriginalEvent] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    timestamp: '',
    lugar: '',
    descripcion: '',
    categoria: 'otro',
    precio: '',
    capacidad: '',
    imagen: null
  });

  const [errors, setErrors] = useState({});

  // Cargar evento existente
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadEvent();
  }, [id, isAuthenticated, navigate]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEvent(id);
      const event = response.data;
      
      // Verificar que el usuario es el organizador
      if (event.organizador !== user?.email) {
        setError('No tienes permisos para editar este evento');
        return;
      }

      setOriginalEvent(event);
      
      // Formatear fecha para input datetime-local
      const eventDate = new Date(event.timestamp);
      const formattedDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16);
      
      setFormData({
        nombre: event.nombre,
        timestamp: formattedDate,
        lugar: event.lugar,
        descripcion: event.descripcion || '',
        categoria: event.categoria || 'otro',
        precio: event.precio || '',
        capacidad: event.capacidad || '',
        imagen: null
      });

      if (event.imagen) {
        setImagePreview(event.imagen);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Error cargando el evento. Puede que no exista o no tengas permisos para editarlo.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del evento es obligatorio';
    }

    if (!formData.timestamp) {
      newErrors.timestamp = 'La fecha y hora del evento es obligatoria';
    } else {
      const eventDate = new Date(formData.timestamp);
      if (eventDate <= new Date()) {
        newErrors.timestamp = 'La fecha del evento debe ser futura';
      }
    }

    if (!formData.lugar.trim()) {
      newErrors.lugar = 'La dirección del evento es obligatoria';
    }

    if (formData.precio && parseFloat(formData.precio) < 0) {
      newErrors.precio = 'El precio no puede ser negativo';
    }

    if (formData.capacidad && parseInt(formData.capacidad) < 1) {
      newErrors.capacidad = 'La capacidad debe ser al menos 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('La imagen no puede superar los 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagen: file
      }));

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imagen: null
    }));
    // Mantener imagen original si no se selecciona nueva
    setImagePreview(originalEvent?.imagen || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await eventService.updateEvent(id, formData);
      setSuccess(true);
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/my-events');
      }, 2000);
    } catch (error) {
      console.error('Error updating event:', error);
      setError(
        error.response?.data?.error || 
        error.response?.data?.details?.join(', ') ||
        'Error actualizando el evento'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <LoadingSpinner text="Verificando autenticación..." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Cargando evento..." />
      </div>
    );
  }

  if (error && !originalEvent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert type="error">
            {error}
          </Alert>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/my-events')}
              className="btn-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a mis eventos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <Alert type="success" title="¡Evento actualizado exitosamente!">
            Los cambios se han guardado correctamente.
          </Alert>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/my-events')}
              className="btn-primary"
            >
              Ver mis eventos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/my-events')}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a mis eventos
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Edit className="h-8 w-8 mr-3 text-blue-600" />
            Editar Evento
          </h1>
          <p className="text-gray-600 mt-2">
            Actualiza la información de tu evento
          </p>
        </div>

        {/* Error */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="card">
          
          {/* Información básica */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="form-label">
                  Nombre del evento *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`form-input ${errors.nombre ? 'border-red-500' : ''}`}
                  placeholder="Ej: Concierto de Jazz en el Parque"
                />
                {errors.nombre && <p className="form-error">{errors.nombre}</p>}
              </div>

              <div>
                <label className="form-label">
                  Fecha y hora *
                </label>
                <input
                  type="datetime-local"
                  name="timestamp"
                  value={formData.timestamp}
                  onChange={handleInputChange}
                  className={`form-input ${errors.timestamp ? 'border-red-500' : ''}`}
                />
                {errors.timestamp && <p className="form-error">{errors.timestamp}</p>}
              </div>

              <div>
                <label className="form-label">
                  Dirección del evento *
                </label>
                <input
                  type="text"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleInputChange}
                  className={`form-input ${errors.lugar ? 'border-red-500' : ''}`}
                  placeholder="Ej: Calle Mayor 123, Almería"
                />
                {errors.lugar && <p className="form-error">{errors.lugar}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  La dirección se usará para obtener las coordenadas del evento automáticamente
                </p>
              </div>

              <div>
                <label className="form-label">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-input"
                  placeholder="Describe tu evento, qué incluye, qué pueden esperar los asistentes..."
                />
              </div>
            </div>
          </div>

          {/* Detalles adicionales */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Detalles Adicionales
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="form-input"
                >
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
                <label className="form-label">
                  Precio (€)
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`form-input ${errors.precio ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.precio && <p className="form-error">{errors.precio}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Deja en blanco si es gratuito
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">
                  Capacidad máxima
                </label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleInputChange}
                  min="1"
                  className={`form-input ${errors.capacidad ? 'border-red-500' : ''}`}
                  placeholder="Número máximo de asistentes"
                />
                {errors.capacidad && <p className="form-error">{errors.capacidad}</p>}
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Imagen del Evento
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Haz clic para cambiar</span> la imagen
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Organizador */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Organizador</h3>
            <p className="text-gray-600">{user?.name} ({user?.email})</p>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/my-events')}
              className="btn-secondary"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <div className="loading-spinner w-5 h-5" />
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Actualizar Evento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;