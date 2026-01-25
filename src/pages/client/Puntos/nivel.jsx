import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faAward,
  faCheckCircle,
  faCircleDot,
  faCoins,
  faCommentDots,
  faCrown,
  faLock,
  faMedal,
  faShoppingCart,
  faUserCircle,
  faCamera,
  faUserEdit,
  faUserPlus,
  faRocket, 
  faStar, 
  faTrophy 
} from '@fortawesome/free-solid-svg-icons';
import api from '../../../utils/AxiosConfig';
import { useAuth } from '../../../hooks/ContextAuth';
import n1 from '../../../img/Niveles/n1.png'
import n2 from '../../../img/Niveles/n2.png'
import n3 from '../../../img/Niveles/n3.png';
import n4 from '../../../img/Niveles/n4.png';
import Confetti from 'react-confetti';

const pointEarningMethods = [
    {
        action: 'Completar una renta',
        points: '1 punto por cada $10 MXN',
        icon: faShoppingCart, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        action: 'Dejar reseña (con foto)',
        points: '50 puntos',
        icon: faCamera, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        action: 'Dejar reseña (solo texto)',
        points: '20 puntos',
        icon: faCommentDots, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        action: 'Completar perfil de usuario',
        points: '50 puntos',
        icon: faUserEdit,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
    },
    {
        action: 'Subir foto de perfil',
        points: '20 puntos',
        icon: faUserPlus, 
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
    },
];

const levels = [
    {
        name: 'Invitado',
        minPoints: 0,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        icon: faUserCircle,
        reward: 'Acceso básico',
    },
    {
        name: 'Anfitrión',
        minPoints: 500,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: faMedal,
        reward: '5% de descuento',
    },
    {
        name: 'Organizador Pro',
        minPoints: 2000,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        icon: faAward,
        reward: '10% de descuento + Envío gratis',
    },
    {
        name: 'Embajador de Fiesta',
        minPoints: 5000,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        icon: faCrown,
        reward: '15% de descuento + Priority Support',
    },
];

const LevelUpNotification = ({ show, levelName, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); 

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <>
         
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"></div>
           
        
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={300}
                gravity={0.2}
                colors={['#FBBF24', '#F59E0B', '#D97706', '#FCD34D', '#FDE68A', '#FEF3C7']}
                style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    zIndex: 9999,
                    pointerEvents: 'none'
                }}
            />
            
            {/* Notificación mejorada con colores amarillos suaves */}
            <div className="fixed inset-0 flex items-start justify-center pt-8 z-[10000] pointer-events-none">
                <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-amber-900 p-8 rounded-3xl shadow-2xl border-4 border-amber-200/80 max-w-md w-full mx-4 transform animate-bounce-in pointer-events-auto relative overflow-hidden">
                    
                    {/* Efecto de brillo de fondo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent animate-shine-slow"></div>
                    
                    {/* Partículas decorativas */}
                    <div className="absolute top-2 right-2 text-amber-700 animate-ping">
                        <FontAwesomeIcon icon={faStar} className="text-lg" />
                    </div>
                    <div className="absolute bottom-2 left-2 text-amber-700 animate-pulse">
                        <FontAwesomeIcon icon={faTrophy} className="text-lg" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="bg-amber-100/30 p-3 rounded-full border-2 border-amber-600">
                                <FontAwesomeIcon 
                                    icon={faRocket} 
                                    className="text-amber-700 text-2xl animate-bounce" 
                                />
                            </div>
                            <h3 className="text-xl font-bold text-amber-900 drop-shadow-lg">
                                ¡Nuevo Nivel Alcanzado!
                            </h3>
                        </div>
                        
                        <div className="text-center mb-6">
                            <div className="bg-amber-100/20 rounded-2xl p-4 border border-amber-200/50 mb-4">
                                <p className="text-3xl font-bold text-amber-800 mb-2 drop-shadow-lg">
                                    {levelName}
                                </p>
                                <div className="w-16 h-1 bg-amber-700 mx-auto rounded-full mb-3"></div>
                                <p className="text-sm opacity-95 font-medium text-amber-900">
                                    ¡Felicidades! Has desbloqueado nuevos beneficios exclusivos
                                </p>
                            </div>
                            
                            {/* Beneficios del nivel */}
                            <div className="bg-amber-800/20 rounded-xl p-3 border border-amber-700/30">
                                <p className="text-xs font-semibold text-amber-800 mb-2">
                                    🎁 Beneficios desbloqueados:
                                </p>
                                <p className="text-xs opacity-90 text-amber-900 font-medium">
                                    {levelName === 'Anfitrión' && '5% de descuento en todas tus rentas'}
                                    {levelName === 'Organizador Pro' && '10% de descuento + Prioridad en entregas'}
                                    {levelName === 'Embajador de Fiesta' && '15% de descuento + Envío gratis + Soporte prioritario'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-1">
                                <span className="text-amber-700 text-lg">🎉</span>
                                <span className="text-xs opacity-90 font-medium text-amber-900">
                                    ¡Sigue así!
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-amber-100/30 hover:bg-amber-100/50 text-amber-900 text-sm px-4 py-2 rounded-full transition-all duration-300 border border-amber-300 hover:border-amber-400 font-medium hover:scale-105 active:scale-95"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-in {
                    0% { 
                        transform: scale(0.3) translateY(-50px); 
                        opacity: 0; 
                    }
                    50% { 
                        transform: scale(1.05) translateY(10px); 
                    }
                    70% { 
                        transform: scale(0.98) translateY(-5px); 
                    }
                    100% { 
                        transform: scale(1) translateY(0); 
                        opacity: 1; 
                    }
                }
                
                @keyframes shine-slow {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                }
                
                .animate-bounce-in {
                    animation: bounce-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                
                .animate-shine-slow {
                    animation: shine-slow 3s ease-in-out infinite;
                }
            `}</style>
        </>
    );
};


export const LevelProgress = ({ levelPoints, currentLevelName, currentLevelBenefit, onLevelUp }) => {
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

    const getLevelImage = (levelName) => {
        switch(levelName) {
            case 'Invitado':
                return n1;
            case 'Anfitrión':
                return n2;
            case 'Organizador Pro':
                return n3;
            case 'Embajador de Fiesta':
                return n4;
            default:
                return n1; 
        }
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
           
            <div className="text-center mb-5">
                <div className={`inline-flex items-center justify-center w-20 h-20 ${currentLevel.bgColor} ${currentLevel.borderColor} border-2 rounded-full mb-3 overflow-hidden`}>
                 
                    <img 
                        src={getLevelImage(currentLevelName)}
                        alt={`Nivel ${currentLevelName}`}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                            
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                 
                    <div className="hidden items-center justify-center w-full h-full">
                        <FontAwesomeIcon
                            icon={currentLevel.icon}
                            className={`${currentLevel.color} text-2xl`} 
                        />
                    </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {currentLevelName}
                </h3>
                <p className="text-xs text-gray-600">
                   Gracias por ser familia alquiladora romero
                </p>
            </div>

            <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>{currentLevel.minPoints} pts</span>
                    {nextLevel && <span>{nextLevel.minPoints} pts</span>}
                </div>

                <div className="relative mb-2">
                  
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${progressPercent}%` }}
                        >
                        
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                        </div>
                    </div>
                    
              
                    <div 
                        className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                        style={{ left: `${Math.min(progressPercent, 95)}%` }}
                    >
                        <div className="relative">
                            <div className="w-4 h-4 bg-white border-2 border-green-500 rounded-full shadow-md"></div>
                            <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                    </div>
                </div>

                {nextLevel ? (
                    <p className="text-center text-xs text-gray-600 mt-2">
                        <span className="font-semibold text-gray-900">
                            {nextLevel.minPoints - levelPoints}
                        </span>{' '}
                        puntos para <span className="font-semibold">{nextLevel.name}</span>
                    </p>
                ) : (
                    <p className="text-center text-xs font-semibold text-green-600 mt-2">
                        ¡Nivel máximo alcanzado!
                    </p>
                )}
            </div>

           
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900 text-center mb-3">
                    Progreso de Niveles
                </h4>
                {levels.map((level) => {
                    const isUnlocked = levelPoints >= level.minPoints;
                    const isCurrent = level.name === currentLevel.name;

                    return (
                        <div
                            key={level.name}
                            className={`relative flex items-center p-2 rounded-md text-xs transition-colors group ${
                                isCurrent
                                    ? `${level.bgColor} ${level.borderColor} border`
                                    : isUnlocked
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50 border border-gray-200'
                            }`}
                        >
                            
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden mr-3 ${
                                !isUnlocked ? 'relative' : ''
                            }`}>
                                {isUnlocked ? (
                                  
                                    <>
                                        <img 
                                            src={getLevelImage(level.name)}
                                            alt={`Nivel ${level.name}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                       
                                        <div className="hidden items-center justify-center w-full h-full">
                                            {isCurrent ? (
                                                <FontAwesomeIcon
                                                    icon={faCircleDot}
                                                    className="text-blue-500 text-xs"
                                                />
                                            ) : (
                                                <FontAwesomeIcon
                                                    icon={faCheckCircle}
                                                    className="text-green-500 text-xs"
                                                />
                                            )}
                                        </div>
                                    </>
                                ) : (
                                   
                                    <div className="relative w-full h-full">
                                        <img 
                                            src={getLevelImage(level.name)}
                                            alt={`Nivel ${level.name} - Bloqueado`}
                                            className="w-full h-full object-cover filter grayscale opacity-50"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                            <FontAwesomeIcon
                                                icon={faLock}
                                                className="text-white text-xs drop-shadow-md"
                                            />
                                        </div>
                                        
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-0.5 bg-red-500 transform rotate-45 opacity-70"></div>
                                        </div>
                                       
                                        <div className="hidden items-center justify-center w-full h-full relative">
                                            <FontAwesomeIcon
                                                icon={faLock}
                                                className="text-gray-400 text-xs"
                                            />
                                            <div className="absolute w-full h-0.5 bg-red-500 transform rotate-45 opacity-70"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                         
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`font-medium ${
                                            isCurrent
                                                ? level.color
                                                : isUnlocked
                                                ? 'text-green-700'
                                                : 'text-gray-400' 
                                        }`}
                                    >
                                        {level.name}
                                    </span>
                                    <span className={`font-semibold ${
                                        isUnlocked ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                        {level.minPoints}
                                    </span>
                                </div>
                            </div>

                          
                            {isUnlocked && (
                                <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-10 w-48">
                                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                                        <div className="font-semibold mb-1">Beneficio:</div>
                                        <div className="text-gray-200">
                                            {level.name === 'Invitado' && 'Acceso al programa de Puntos y Logros'}
                                            {level.name === 'Anfitrión' && '5% de descuento en todas tus rentas'}
                                            {level.name === 'Organizador Pro' && '10% de descuento + Prioridad en las rutas de entrega'}
                                            {level.name === 'Embajador de Fiesta' && '12% de descuento en todas las rentas + Prioridad en las rutas de entrega + Envío gratuito sin mínimo de compra'}
                                        </div>
                                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

         
            <style jsx>{`
                @keyframes shine {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shine {
                    animation: shine 2s infinite;
                }
            `}</style>
        </div>
    );
};


export const PointsSection = ({ currentPoints, spentPoints }) => {
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-5 text-center">
                Tus Puntos Fiesta
            </h3>
            <div className="relative mb-5">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium opacity-90">Puntos Disponibles</p>
                        <FontAwesomeIcon
                            icon={faCoins}
                            className="text-yellow-300 text-base"
                        />
                    </div>
                    <p className="text-2xl font-bold mb-1">{currentPoints}</p>
                    <p className="text-xs opacity-80">Listos para canjear</p>
                </div>
            </div>

           
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                    <FontAwesomeIcon icon={faArrowDown} className="text-green-600 mb-1 text-sm" />
                    <p className="text-base font-bold text-gray-900">{currentPoints + spentPoints}</p>
                    <p className="text-xs text-gray-600">Total Ganados</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-gray-600 mb-1 text-sm" />
                    <p className="text-base font-bold text-gray-900">{spentPoints}</p>
                    <p className="text-xs text-gray-600">Canjeados</p>
                </div>
            </div>

          
            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 text-center">
                    Cómo ganar puntos
                </h4>
                <div className="space-y-2">
                    {pointEarningMethods.map((method) => (
                        <div
                            key={method.action}
                            className="flex items-center p-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <div
                                className={`w-9 h-9 rounded-md ${method.bgColor} flex items-center justify-center mr-3`}
                            >
                                <FontAwesomeIcon
                                    icon={method.icon}
                                    className={`${method.color} text-sm`}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800 text-xs">
                                    {method.action}
                                </p>
                                <p className="text-xs text-gray-600">
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

const StatsSkeleton = () => (
    <div className="lg:col-span-1 space-y-4 animate-pulse">
        {/* Skeleton de LevelProgress */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
            <div className="mb-5">
                <div className="w-full bg-gray-200 rounded-full h-1.5"></div>
            </div>
            <div className="space-y-2">
                <div className="h-9 bg-gray-200 rounded-md"></div>
                <div className="h-9 bg-gray-200 rounded-md"></div>
            </div>
        </div>
       
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-5"></div>
            <div className="bg-gray-200 rounded-lg p-4 h-24 mb-5"></div>
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-200 rounded-lg p-3 h-20"></div>
                <div className="bg-gray-200 rounded-lg p-3 h-20"></div>
            </div>
        </div>
    </div>
);



const PuntosYNivelStats = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevelName, setNewLevelName] = useState('');
    const { csrfToken } = useAuth();

    const previousLevelRef = useRef(null);

    const getPreviousLevel = () => {
        try {
            const stored = sessionStorage.getItem('previousLevel');
            if (!stored) return null;
            
            const data = JSON.parse(stored);
            if (Date.now() - data.timestamp > 600 * 60 * 1000) {
                sessionStorage.removeItem('previousLevel');
                return null;
            }
            
            return data;
        } catch {
            return null;
        }
    };

    const setPreviousLevel = (levelData) => {
        try {
            const minimalData = {
                currentLevelName: levelData.currentLevelName,
                timestamp: Date.now()
            };
            sessionStorage.setItem('previousLevel', JSON.stringify(minimalData));
        } catch (error) {
            console.error("Error guardando nivel anterior:", error);
        }
    };

    useEffect(() => {

        if (!csrfToken) return;

        const fetchGamificacionData = async () => {
            setLoading(true);
            setError(null);
            try {
               
                const response = await api.get('/api/pedidos/Nivelesypuntos', {
                    headers: { 'X-CSRF-Token': csrfToken },
                    withCredentials: true,
                });

               if (response.data.success) {
                    const newData = response.data.data;
                    const previousLevelData = getPreviousLevel();
                    
                    console.log("🔍 COMPARANDO NIVELES:");
                    console.log("Nivel anterior (sessionStorage):", previousLevelData?.currentLevelName);
                    console.log("Nivel nuevo (API):", newData.currentLevelName);
                    
                     if (previousLevelData && 
                        previousLevelData.currentLevelName !== newData.currentLevelName) {
                        console.log("🎉 ¡CAMBIO DE NIVEL DETECTADO!");
                        setNewLevelName(newData.currentLevelName);
                        setShowLevelUp(true);
                    }
                    
                    
                    console.log("💾 Guardando nuevo nivel para próxima comparación:", newData.currentLevelName);
                    setPreviousLevel({
                        currentLevelName: newData.currentLevelName
                    });
                    
                    setData(newData);

                } else {
                    throw new Error(response.data.message || "No se pudieron cargar los datos.");
                }

            } catch (err) {
                console.error("Error al obtener datos de gamificación:", err);
                setError(err.message || "Error de conexión al cargar puntos.");
            } finally {
                setLoading(false);
            }
        };

        fetchGamificacionData();
    }, [csrfToken]);


      useEffect(() => {
        if (data) {
            previousLevelRef.current = {
                currentLevelName: data.currentLevelName,
                levelPoints: data.levelPoints
            };
        }
    }, [data]);

    const handleCloseNotification = () => {
        setShowLevelUp(false);
    };




    if (loading) {
        return <StatsSkeleton />;
    }

    if (error) {
        return (
            <div className="lg:col-span-1 space-y-4 text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-semibold">Error al cargar puntos</p>
                <p className="text-sm text-red-500">{error}</p>
            </div>
        );
    }

    if (data) {
        return (
            <>
             <LevelUpNotification 
                    show={showLevelUp}
                    levelName={newLevelName}
                    onClose={handleCloseNotification}
                />
            <div className="lg:col-span-1 space-y-4">
              
               <LevelProgress 
                    levelPoints={data.levelPoints} 
                    currentLevelName={data.currentLevelName} 
                    currentLevelBenefit={data.currentLevelBenefit} 
                />
                <PointsSection
                    currentPoints={data.currentPoints}
                    spentPoints={data.spentPoints}
                />
            </div>
            </>
        );
    }
    return null;


   
}

export default PuntosYNivelStats;