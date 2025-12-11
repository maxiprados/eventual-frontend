import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, User, Calendar, Server } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { logService, utils } from '../services/api';

const LogsPage = () => {
  const { isAuthenticated } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    usuario: '',
    provider: '',
    loginType: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [currentPage]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await logService.getLogs({
        page: currentPage,
        limit: 50
      });
      
      setLogs(response.data.logs || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading logs:', error);
      setError('Error cargando los logs. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await logService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      
      const searchParams = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          searchParams[key] = filters[key];
        }
      });
      
      const response = await logService.searchLogs({
        ...searchParams,
        limit: 50
      });
      
      setLogs(response.data.logs || []);
      setTotalPages(1); // Para búsquedas, solo mostramos una página
    } catch (error) {
      console.error('Error searching logs:', error);
      setError('Error en la búsqueda. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      usuario: '',
      provider: '',
      loginType: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
    loadLogs();
  };

  const handleExport = async () => {
    try {
      const response = await logService.getLogs({ limit: 1000 });
      const logsData = response.data.logs;
      
      // Convertir a CSV
      const headers = ['Fecha', 'Usuario', 'Proveedor', 'Tipo', 'Caducidad', 'IP', 'User Agent'];
      const csvContent = [
        headers.join(','),
        ...logsData.map(log => [
          new Date(log.timestamp).toLocaleString('es-ES'),
          log.usuario,
          log.provider,
          log.loginType,
          new Date(log.caducidad).toLocaleString('es-ES'),
          log.ipAddress || '',
          `"${log.userAgent || ''}"`
        ].join(','))
      ].join('\n');
      
      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
      setError('Error exportando logs.');
    }
  };

  const formatLogType = (type) => {
    const types = {
      login: 'Inicio de sesión',
      logout: 'Cierre de sesión',
      refresh: 'Renovación de token'
    };
    return types[type] || type;
  };

  const getLogTypeColor = (type) => {
    const colors = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-red-100 text-red-800',
      refresh: 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Alert type="info" title="Acceso restringido">
          Debes iniciar sesión para ver los logs del sistema.
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 mr-3 text-blue-600" />
            Logs del Sistema
          </h1>
          <p className="text-gray-600 mt-2">
            Registro de actividad de autenticación de usuarios
          </p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <Server className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-gray-600">Total de logs</p>
            </div>
            <div className="card text-center">
              <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
              <p className="text-gray-600">Usuarios únicos</p>
            </div>
            <div className="card text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.logsLastWeek}</p>
              <p className="text-gray-600">Última semana</p>
            </div>
            <div className="card text-center">
              <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {stats.breakdown?.byProvider?.google || 0}
              </p>
              <p className="text-gray-600">Logins Google</p>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </button>
              <button
                onClick={handleExport}
                className="btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              Total: {logs.length} logs
            </p>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="form-label">Usuario (email)</label>
                  <input
                    type="email"
                    value={filters.usuario}
                    onChange={(e) => setFilters(prev => ({ ...prev, usuario: e.target.value }))}
                    placeholder="usuario@ejemplo.com"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Proveedor</label>
                  <select
                    value={filters.provider}
                    onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Todos</option>
                    <option value="google">Google</option>
                    <option value="facebook">Facebook</option>
                    <option value="local">Local</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Tipo de acción</label>
                  <select
                    value={filters.loginType}
                    onChange={(e) => setFilters(prev => ({ ...prev, loginType: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Todas</option>
                    <option value="login">Inicio de sesión</option>
                    <option value="logout">Cierre de sesión</option>
                    <option value="refresh">Renovación</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Fecha desde</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Fecha hasta</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSearch}
                  className="btn-primary"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </button>
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabla de logs */}
        <div className="card p-0">
          {loading ? (
            <LoadingSpinner text="Cargando logs..." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Caducidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log, index) => (
                      <tr key={log.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {utils.formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.usuario}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLogTypeColor(log.loginType)}`}>
                            {formatLogType(log.loginType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="capitalize">{log.provider}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {utils.formatDate(log.caducidad)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {logs.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No hay logs disponibles
                  </h3>
                  <p className="text-gray-600">
                    No se encontraron logs que coincidan con los filtros aplicados.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;