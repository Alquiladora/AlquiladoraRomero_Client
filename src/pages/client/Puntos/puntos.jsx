/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faTrophy,
  faLock,
  faCheckCircle,
  faCamera,
  faUserCircle,
  faSync,
  faCrown,
  faMedal,
  faAward,
  faCircleDot,
  faFire,
  faGem,
} from '@fortawesome/free-solid-svg-icons';
import PuntosYNivelStats from './nivel';
import { useAuth } from '../../../hooks/ContextAuth';
import api from '../../../utils/AxiosConfig';



const allBadges = {
  bronce: [
    {
      name: 'Anfitrión de Primera',
      description: 'Completar primera renta exitosa',
      icon: faTrophy,
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      name: 'Crítico de Confianza',
      description: 'Primera reseña con fotografía',
      icon: faCamera,
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-100',
      iconColor: 'text-amber-600',
    },
  ],
  plata: [
    {
      name: 'Cliente Frecuente',
      description: 'Completar 3 rentas exitosas',
      icon: faUserCircle,
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-600',
    },
    {
      name: 'Fiestero Total',
      description: 'Renta con 3 categorías diferentes',
      icon: faFire,
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-600',
    },
  ],
  oro: [
    {
      name: 'Planificador Experto',
      description: '5 rentas en 365 días',
      icon: faCrown,
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      name: 'Cliente VIP',
      description: 'Acumular $30,000 MXN en compras',
      icon: faGem,
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-100',
      iconColor: 'text-yellow-600',
    },
  ],
};

const BadgeCard = ({ name, description, icon, isUnlocked, bgColor, borderColor, textColor, iconColor, iconBg }) => {
  return (
    <div
      className={`
        relative p-4 rounded-lg border flex flex-col items-center text-center
        transition-all duration-200 hover:shadow-sm
        ${isUnlocked
          ? `${bgColor} ${borderColor} ${textColor}`
          : 'bg-gray-5 border-gray-200 text-gray-400'
        }
      `}
    >

      <div
        className={`
          w-14 h-14 rounded-full flex items-center justify-center mb-3
          ${isUnlocked
            ? `${iconColor} ${iconBg}`
            : 'bg-gray-200 text-gray-400'
          }
        `}
      >
        <FontAwesomeIcon
          icon={icon}
          className="text-xl"
        />
      </div>

      <div className="flex-1">
        <h3
          className={`font-semibold text-sm mb-1 ${isUnlocked ? textColor : 'text-gray-500'
            }`}
        >
          {name}
        </h3>
        <p
          className={`text-xs leading-relaxed ${isUnlocked ? 'text-gray-600' : 'text-gray-400'
            }`}
        >
          {description}
        </p>
      </div>

      {isUnlocked && (
        <div className={`absolute top-2 right-2 ${iconColor}`}>
          <FontAwesomeIcon icon={faCheckCircle} className="text-sm" />
        </div>
      )}
    </div>
  );
};

const unlockedTemplates = {
  Bronce: {
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50'
  },
  Plata: {
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-800',
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-50'
  },
  Oro: {
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50'
  }
};


const GamificacionPerfil = () => {
  const [insigniasData, setInsigniasData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { csrfToken } = useAuth();


  const fetchInsigniasData = async () => {
    if (!csrfToken) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('api/pedidos/insignias', {
        headers: { 'X-CSRF-TOKEN': csrfToken },
        withCredentials: true,
      });

      if (response.data.success) {
        setInsigniasData(response.data.data);
      } else {
        throw new Error(response.data.message || "No se pudieron cargar las insignias.");
      }
    } catch (err) {
      console.error("Error al obtener datos de insignias:", err);
      setError(err.message || "Error de conexión al cargar insignias.");
    } finally {
      setLoading(false);
    }
  };

  //Funcion de obtener datos de insignias
  useEffect(() => {
    fetchInsigniasData();
  }, [csrfToken]);



  const handleManualRefresh = () => {
    fetchInsigniasData();
  };


  const getUnlockedBadges = () => {
    if (!insigniasData) return [];

    const unlocked = [];
    Object.values(insigniasData.insignias).forEach(nivel => {
      nivel.forEach(insignia => {
        if (insignia.desbloqueada) {
          unlocked.push(insignia.nombre);
        }
      });
    });
    return unlocked;
  };

  const getBadgeTemplate = (badgeName, nivel, isUnlocked) => {


    const lockedTemplate = {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-400',
      iconColor: 'text-gray-400',
      iconBg: 'bg-gray-200'
    };

    if (isUnlocked) {
      const baseTemplate = unlockedTemplates[nivel] || unlockedTemplates.Bronce;


      const badgeFromAll = allBadges[nivel.toLowerCase()]?.find(badge => badge.name === badgeName);

      return {
        ...baseTemplate,
        icon: badgeFromAll?.icon || faTrophy
      };
    }


    return {
      ...lockedTemplate,
      icon: faLock
    };
  };



  const renderBadgeSection = (nivel, title) => {
    if (!insigniasData) return null;

    const insigniasDelNivel = insigniasData.insignias[nivel] || [];
    const desbloqueadasCount = insigniasDelNivel.filter(insignia => insignia.desbloqueada).length;
    const totalCount = insigniasDelNivel.length;

    return (
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-1 h-6 rounded-full ${unlockedTemplates[nivel]?.bgColor || 'bg-gray-300'}`}></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <p className="text-xs text-gray-600">
              {desbloqueadasCount} de {totalCount} desbloqueadas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insigniasDelNivel.map((insignia) => {

            const badgeTemplate = getBadgeTemplate(insignia.nombre, nivel, insignia.desbloqueada);

            return (
              <BadgeCard
                key={insignia.id}
                name={insignia.nombre}
                description={insignia.descripcion}
                icon={badgeTemplate.icon}
                isUnlocked={insignia.desbloqueada}
                bgColor={badgeTemplate.bgColor}
                borderColor={badgeTemplate.borderColor}
                textColor={badgeTemplate.textColor}
                iconColor={badgeTemplate.iconColor}
                iconBg={badgeTemplate.iconBg}
              />
            );
          })}
        </div>
      </div>
    );
  };



  if (loading) {
    return (
      <div className="min-h-screen p-2">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(item => (
                  <div key={item} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-2">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-semibold">Error al cargar insignias</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <button
              onClick={handleManualRefresh}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!insigniasData) {
    return (
      <div className="min-h-screen p-2">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500">No se encontraron datos de insignias.</p>
        </div>
      </div>
    );
  }

  const { resumen } = insigniasData;
  const unlockedBadges = getUnlockedBadges();

  return (
    <div className="min-h-screen p-2">

      <div className="max-w-6xl mx-auto mb-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Programa de Lealtad
          </h1>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
          >
            <FontAwesomeIcon
              icon={loading ? faCircleDot : faSync}
              className={loading ? "animate-spin" : ""}
            />

          </button>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Gana puntos, desbloquea insignias y disfruta de beneficios exclusivos
          </p>
        </div>

      </div>



      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-1 space-y-4">
          <PuntosYNivelStats />
        </div>


        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
              <div className="mb-3 sm:mb-0">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Tu Colección de Insignias
                </h2>

                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <span>{resumen.totalDesbloqueadas} desbloqueadas</span>
                  <span>•</span>
                  <span>{resumen.totalPorConseguir} por conseguir</span>
                </div>
              </div>

              <div className="bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
                <div className="flex items-center space-x-1.5">
                  <FontAwesomeIcon
                    icon={faTrophy}
                    className="text-blue-600 text-base"
                  />
                  <span className="font-semibold text-blue-700 text-sm">
                    {resumen.progresoTotal}%
                  </span>
                </div>
              </div>
            </div>


            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-800">Progreso Total</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-green-700">{resumen.progresoTotal}%</span>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
                </div>
              </div>

              <div className="relative">

                <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden shadow-inner">

                  <div
                    className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 h-3 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                    style={{ width: `${resumen.progresoTotal}%` }}
                  >

                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine"></div>


                    <div className="absolute top-0 right-0 w-1 h-3 bg-white/60 animate-pulse"></div>


                    <div className="absolute top-1 left-1/4 w-1 h-1 bg-white/50 rounded-full animate-bubble-1"></div>
                    <div className="absolute top-2 left-1/2 w-0.5 h-0.5 bg-white/40 rounded-full animate-bubble-2"></div>
                    <div className="absolute top-1 left-3/4 w-0.5 h-0.5 bg-white/30 rounded-full animate-bubble-3"></div>
                  </div>
                </div>


                <div
                  className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                  style={{ left: `calc(${Math.min(resumen.progresoTotal, 97)}% - 8px)` }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-white border-2 border-green-500 rounded-full shadow-lg animate-ping-slow"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>


              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-green-700 font-medium">
                  {resumen.totalDesbloqueadas} de {resumen.totalDesbloqueadas + resumen.totalPorConseguir} insignias
                </span>
                <span className="text-green-600">
                  {resumen.totalPorConseguir > 0 ? `${resumen.totalPorConseguir} restantes` : '¡Completado!'}
                </span>
              </div>
            </div>

            <style jsx>{`
  @keyframes shine {
    0% { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(200%) skewX(-15deg); }
  }
  
  @keyframes ping-slow {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
  }
  
  @keyframes bubble-1 {
    0%, 100% { transform: translateY(0px); opacity: 0.7; }
    50% { transform: translateY(-1px); opacity: 1; }
  }
  
  @keyframes bubble-2 {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
    33% { transform: translateY(-1px) translateX(1px); opacity: 0.8; }
    66% { transform: translateY(1px) translateX(-1px); opacity: 0.6; }
  }
  
  @keyframes bubble-3 {
    0%, 100% { transform: translateY(0px); opacity: 0.4; }
    50% { transform: translateY(1px); opacity: 0.7; }
  }
  
  .animate-shine {
    animation: shine 2s ease-in-out infinite;
  }
  
  .animate-ping-slow {
    animation: ping-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .animate-bubble-1 {
    animation: bubble-1 3s ease-in-out infinite;
  }
  
  .animate-bubble-2 {
    animation: bubble-2 4s ease-in-out infinite;
  }
  
  .animate-bubble-3 {
    animation: bubble-3 5s ease-in-out infinite;
  }
`}</style>


            <div className="space-y-6">
              {renderBadgeSection('Bronce', 'Insignias Bronce')}
              {renderBadgeSection('Plata', 'Insignias Plata')}
              {renderBadgeSection('Oro', 'Insignias Oro')}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-6 text-center">
        <div className="bg-white rounded-lg p-3 shadow-xs border border-gray-200">
          <p className="text-xs text-gray-600">
            Los puntos expiran después de 2 meses de inactividad •{' '}
            <a
              href="#"
              className="text-blue-600 hover:underline font-medium"
            >
              Consulta términos y condiciones
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GamificacionPerfil;