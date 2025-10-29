import React, { useState, useRef, useEffect } from 'react';
import {
  ChatAlt2Icon,
  XIcon,
  MinusIcon,
  PhoneIcon,
  ChatIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/outline';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Chatbox = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPhoneMenuOpen, setIsPhoneMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const nodeRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const genAI = new GoogleGenerativeAI(
    'AIzaSyBB9oSHIU3ajlWDPJQN3RaTWIIPA8eHyFo'
  );
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const encargadaPhoneNumber = '+525659722146';

  // Scroll automático al final de los mensajes
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const fetchEmpresaInfo = async () => {
    try {
      const response = await fetch('https://localhost:4000/api/getEmpresa');
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const data = await response.json();
      console.log('Datos de la empresa:', data);
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('Error al obtener información de la empresa:', error);
      return null;
    }
  };

  // Enviar mensaje y obtener respuesta del bot
  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const userMessage = { text: inputText, sender: 'user', timestamp };
    setMessages([...messages, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      let botResponseText = '';
      const lowerCaseInput = inputText.toLowerCase();
      const empresaInfo = await fetchEmpresaInfo();

      if (empresaInfo) {
        if (
          lowerCaseInput.includes('nombre') ||
          lowerCaseInput.includes('como se llama')
        ) {
          botResponseText = `El nombre de la empresa es: ${empresaInfo.nombre}.`;
        } else if (
          lowerCaseInput.includes('quienes son') ||
          lowerCaseInput.includes('acerca de') ||
          lowerCaseInput.includes('farmamedic')
        ) {
          botResponseText = `${empresaInfo.nosotros}.`;
        } else if (lowerCaseInput.includes('mision')) {
          botResponseText = `${empresaInfo.mision}.`;
        } else if (lowerCaseInput.includes('vision')) {
          botResponseText = `Visión: ${empresaInfo.vision}.`;
        } else if (lowerCaseInput.includes('valores')) {
          botResponseText = `Nuestros valores son: ${empresaInfo.valores}.`;
        } else if (lowerCaseInput.includes('servicios')) {
          botResponseText = `Ofrecemos los siguientes servicios: ${empresaInfo.servicios}.`;
        } else {
          // Si no coincide con ninguna condición, usar Gemini API
          const result = await model.generateContent(inputText);
          botResponseText = result.response.text();
        }
      } else {
        botResponseText =
          'Lo siento, no pude obtener información sobre la empresa en este momento.';
      }

      const botResponse = { text: botResponseText, sender: 'bot', timestamp };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      const errorMessage = {
        text: 'Lo siento, ocurrió un error al procesar tu mensaje.',
        sender: 'bot',
        timestamp,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const chatboxVariants = {
    minimized: {
      scale: 0.8,
      opacity: 0,
      y: 100,
      transition: { type: 'spring', stiffness: 100 },
    },
    expanded: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const phoneMenuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <>
      <AnimatePresence>
        {!isMinimized ? (
          <Draggable
            nodeRef={nodeRef}
            defaultPosition={{ x: 0, y: 0 }}
            bounds="parent"
          >
            <motion.div
              ref={nodeRef}
              initial="minimized"
              animate="expanded"
              exit="minimized"
              variants={chatboxVariants}
              className="fixed bottom-10 right-7 w-full max-w-xs sm:max-w-sm md:max-w-md h-[450px] sm:h-[500px] bg-white shadow-2xl border-l border-t border-gray-200 rounded-tl-lg flex flex-col dark:bg-gray-900 dark:text-white z-50 cursor-move"
            >
              {/* Header del Chatbox */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-tl-lg flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <ChatAlt2Icon className="w-7 h-7" />
                  <h2 className="text-base sm:text-lg font-semibold">
                    Ayuda en línea
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="relative"
                    onMouseEnter={() => setIsPhoneMenuOpen(true)}
                    onMouseLeave={() => setIsPhoneMenuOpen(false)}
                  >
                    <PhoneIcon className="w-6 h-6 hover:text-gray-200 transition-colors cursor-pointer" />
                    <AnimatePresence>
                      {isPhoneMenuOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={phoneMenuVariants}
                          className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50"
                        >
                          <a
                            href={`tel:${encargadaPhoneNumber}`}
                            className="flex items-center p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <PhoneIcon className="w-5 h-5 mr-2" />
                            Llamar
                          </a>
                          <a
                            href={`https://wa.me/${encargadaPhoneNumber.replace('+', '')}?text=Hola,%20necesito%20ayuda%20con%20Alquiladora%20Romero`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <ChatIcon className="w-5 h-5 mr-2" />
                            WhatsApp
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    onClick={handleMinimize}
                    className="hover:text-gray-200 transition-colors"
                  >
                    <MinusIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={onClose}
                    className="hover:text-gray-200 transition-colors"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Área de mensajes */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto bg-gray-100 dark:bg-gray-800 space-y-4"
              >
                {messages.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center mt-4">
                    ¡Escribe un mensaje para comenzar!
                  </p>
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-yellow-500 text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[75%] p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                      <p className="text-sm italic">Escribiendo...</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input para enviar mensajes */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-yellow-500 text-white p-3 rounded-full hover:bg-yellow-600 transition-colors disabled:bg-gray-400"
                    disabled={isLoading}
                  >
                    <PaperAirplaneIcon className="w-5 h-5 transform rotate-45" />
                  </button>
                </div>
              </div>
            </motion.div>
          </Draggable>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-11 right-4 bg-yellow-500 p-4 rounded-full shadow-lg flex justify-center items-center cursor-pointer hover:bg-yellow-600 transition-colors z-50"
            onClick={handleMinimize}
          >
            <ChatAlt2Icon className="w-8 h-8 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbox;
