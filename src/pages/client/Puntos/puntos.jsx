/* eslint-disable */
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faTrophy,
  faLock,
  faCheckCircle,
  faShoppingCart,
  faCamera,
  faCommentDots,
  faUserCircle,
  faCoins,
  faArrowDown,
  faCrown,
  faMedal,
  faAward,
  faCircleDot, // Icono para Nivel Actual
} from '@fortawesome/free-solid-svg-icons';

/*
================================================================================
  DATOS DEL PROGRAMA "FIESTA ROMERO"
================================================================================
*/

// (Datos de allBadges y pointEarningMethods sin cambios, omitidos por brevedad)
// ...
const allBadges = {
  bronce: [
    {
      name: 'Anfitrión de Primera',
      description:
        'Al completar la primera renta exitosa (pedido "Finalizado").',
      icon: faTrophy,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-500',
    },
    {
      name: 'Crítico de Confianza',
      description: 'Al publicar la primera reseña que incluya una fotografía.',
      icon: faCamera,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-500',
    },
  ],
  plata: [
    {
      name: 'Cliente Frecuente',
      description: 'Al completar un total de 3 rentas.',
      icon: faTrophy,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-500',
    },
    {
      name: 'Fiestero Total',
      description:
        'Al realizar una sola renta que incluya productos de 3 categorías diferentes.',
      icon: faShoppingCart,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-500',
    },
  ],
  oro: [
    {
      name: 'Planificador Experto',
      description: 'Al completar 5 rentas en un periodo de 365 días.',
      icon: faCrown,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-500',
    },
    {
      name: 'Cliente VIP',
      description: 'Al acumular un gasto total de $30,000 MXN.',
      icon: faStar,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-500',
    },
  ],
};

const pointEarningMethods = [
  {
    action: 'Completar una renta',
    points: '1 punto por cada $10 MXN',
    icon: faShoppingCart,
    color: 'text-blue-500',
  },
  {
    action: 'Dejar reseña (con foto)',
    points: '50 puntos',
    icon: faCamera,
    color: 'text-green-500',
  },
  {
    action: 'Dejar reseña (solo texto)',
    points: '40 puntos',
    icon: faCommentDots,
    color: 'text-purple-500',
  },
  {
    action: 'Completar perfil de usuario',
    points: '50 puntos',
    icon: faUserCircle,
    color: 'text-indigo-500',
  },
];
const levels = [
  {
    name: 'Invitado',
    minPoints: 1,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    icon: faUserCircle,
  },
  {
    name: 'Anfitrión',
    minPoints: 500,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: faMedal,
  },
  {
    name: 'Organizador Pro',
    minPoints: 2000,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: faAward,
  },
  {
    name: 'Embajador de Fiesta',
    minPoints: 5000,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: faCrown,
  },
];

/*
================================================================================
  Sub-Componente: Tarjeta de Insignia (NUEVO DISEÑO COMPACTO)
================================================================================
*/
const BadgeCard = ({ name, description, icon, isUnlocked, color }) => {
  return (
    <div
      className={`
        relative p-4 rounded-xl flex items-center space-x-4
        transition-all duration-300 transform 
        ${
          isUnlocked
            ? `bg-gradient-to-r ${color} shadow-lg hover:shadow-xl hover:-translate-y-1`
            : 'bg-gray-100 dark:bg-gray-800 opacity-70'
        }
        border border-gray-200 dark:border-gray-700
      `}
    >
      {/* Icono */}
      <div
        className={`
          flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
          ${
            isUnlocked
              ? 'bg-white/20 backdrop-blur-sm text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
          }
          shadow-md
        `}
      >
        <FontAwesomeIcon
          icon={isUnlocked ? icon : faLock}
          className="text-xl"
        />
      </div>

      {/* Detalles */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-bold truncate ${isUnlocked ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
        >
          {name}
        </p>
        <p
          className={`text-sm ${isUnlocked ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}
        >
          {description}
        </p>
      </div>

      {/* Marca de desbloqueo */}
      {isUnlocked && (
        <div className="absolute top-2 right-2 text-white" title="Desbloqueado">
          <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
        </div>
      )}
    </div>
  );
};

/*
================================================================================
  Sub-Componente: Nivel y Progreso (CON HISTORIAL DE NIVELES)
================================================================================
*/
const LevelProgress = ({ levelPoints }) => {
  const { currentLevel, nextLevel, progressPercent } = useMemo(() => {
    let currentLevel = levels[0];
    let nextLevel = levels[1];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (levelPoints >= levels[i].minPoints) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || null;
        break;
      }
    }

    let progressPercent = 0;
    if (nextLevel) {
      const pointsInThisLevel = nextLevel.minPoints - currentLevel.minPoints;
      const pointsEarnedInThisLevel = levelPoints - currentLevel.minPoints;
      progressPercent = Math.min(
        100,
        (pointsEarnedInThisLevel / pointsInThisLevel) * 100
      );
    } else {
      progressPercent = 100;
    }

    return { currentLevel, nextLevel, progressPercent };
  }, [levelPoints]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* --- SECCIÓN NIVEL ACTUAL --- */}
      <div className={`${currentLevel.bgColor} p-4 rounded-xl mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nivel Actual
          </h3>
          <FontAwesomeIcon
            icon={currentLevel.icon}
            className={`text-xl ${currentLevel.color}`}
          />
        </div>

        <p className={`text-2xl font-bold ${currentLevel.color} mb-3`}>
          {currentLevel.name}
        </p>

        {/* Barra de Progreso */}
        {nextLevel ? (
          <>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span className="font-bold text-gray-900 dark:text-white">
                {nextLevel.minPoints - levelPoints}
              </span>{' '}
              puntos para <span className="font-bold">{nextLevel.name}</span>
            </p>
          </>
        ) : (
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            ¡Nivel máximo alcanzado! 🎉
          </p>
        )}
      </div>

      {/* --- NUEVO: HISTORIAL DE NIVELES --- */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Historial de Niveles
        </h4>
        <div className="space-y-3">
          {levels.map((level) => {
            const isUnlocked = levelPoints >= level.minPoints;
            const isCurrent = level.name === currentLevel.name;

            return (
              <div key={level.name} className="flex items-center space-x-3">
                {/* Icono de Estado */}
                <div className="flex-shrink-0">
                  {isCurrent ? (
                    <FontAwesomeIcon
                      icon={faCircleDot}
                      className={`text-blue-500 animate-pulse`}
                    />
                  ) : isUnlocked ? (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  )}
                </div>

                {/* Nombre y Puntos */}
                <div className={`flex-1 ${!isUnlocked && 'opacity-50'}`}>
                  <p
                    className={`font-medium ${isUnlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {level.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {level.minPoints} Puntos de Nivel
                  </p>
                </div>

                {/* Icono del Nivel */}
                <FontAwesomeIcon
                  icon={level.icon}
                  className={`text-lg ${isUnlocked ? level.color : 'text-gray-400'}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/*
================================================================================
  Sub-Componente: Puntos (Sin cambios)
================================================================================
*/
const PointsSection = ({ currentPoints, spentPoints }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Puntos Fiesta
      </h3>

      <div className="space-y-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <FontAwesomeIcon
              icon={faCoins}
              className="text-yellow-300 text-xl"
            />
            <span className="text-sm font-medium opacity-90">Disponibles</span>
          </div>
          <p className="text-4xl font-bold">{currentPoints}</p>
          <p className="text-xs opacity-80 mt-1">Listos para gastar</p>
        </div>

        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faArrowDown} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gastados
            </span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {spentPoints}
          </span>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Cómo ganar puntos
        </h4>
        <div className="space-y-3">
          {pointEarningMethods.map((method) => (
            <div
              key={method.action}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div
                className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-600 ${method.color}`}
              >
                <FontAwesomeIcon icon={method.icon} className="text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                  {method.action}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {method.points}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/*
================================================================================
  COMPONENTE PRINCIPAL (Grid de Insignias Ajustado)
================================================================================
*/

const GamificacionPerfil = ({
  currentPoints,
  spentPoints,
  unlockedBadges = [],
}) => {
  const levelPoints = useMemo(
    () => currentPoints + spentPoints,
    [currentPoints, spentPoints]
  );

  const renderBadgeSection = (title, badges) => (
    <div className="mb-8">
      {/* Título de la Sección */}
      <div className="flex items-center space-x-3 mb-6">
        <div
          className={`w-1.5 h-7 rounded-full ${badges[0].bgColor} shadow-lg`}
        ></div>
        <h3
          className={`text-2xl font-bold ${badges[0].color.split(' ')[0]} dark:text-white`}
        >
          {title}
        </h3>
      </div>

      {/* --- NUEVO GRID DE INSIGNIAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <BadgeCard
            key={badge.name}
            name={badge.name}
            description={badge.description}
            icon={badge.icon}
            isUnlocked={unlockedBadges.includes(badge.name)}
            color={badge.color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">
          Programa de Lealtad
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
          Gana puntos, desbloquea insignias y disfruta de beneficios exclusivos
        </p>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Sidebar - Stats y Nivel */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
          <LevelProgress levelPoints={levelPoints} />
          <PointsSection
            currentPoints={currentPoints}
            spentPoints={spentPoints}
          />
        </div>

        {/* Main Content - Insignias */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            {/* Header de Insignias */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Mis Insignias
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {unlockedBadges.length} de{' '}
                  {Object.values(allBadges).flat().length} desbloqueadas
                </p>
              </div>
              <div className="hidden md:block p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FontAwesomeIcon
                  icon={faTrophy}
                  className="text-indigo-600 dark:text-indigo-400 text-2xl"
                />
              </div>
            </div>

            {/* Progreso de Insignias */}
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progreso total</span>
                <span>
                  {Math.round(
                    (unlockedBadges.length /
                      Object.values(allBadges).flat().length) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(unlockedBadges.length / Object.values(allBadges).flat().length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Secciones de Insignias */}
            <div className="space-y-8">
              {renderBadgeSection('Bronce', allBadges.bronce)}
              {renderBadgeSection('Plata', allBadges.plata)}
              {renderBadgeSection('Oro', allBadges.oro)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Informativo */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Los puntos expiran después de 12 meses de inactividad • Consulta los{' '}
          <a
            href="#"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            términos y condiciones
          </a>
        </p>
      </div>
    </div>
  );
};

export default GamificacionPerfil;
