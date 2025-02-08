import React, { useState } from "react";
import { ChatAlt2Icon, XIcon, MinusIcon } from "@heroicons/react/outline";
import { motion, AnimatePresence } from "framer-motion";

const Chatbox = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSendMessage = () => {
    if (inputText.trim() !== "") {
      const userMessage = { text: inputText, sender: "user" };
      setMessages([...messages, userMessage]);
      setInputText("");

      // Simular una respuesta automática basada en el contenido del mensaje
      setTimeout(() => {
        const botResponse = generateBotResponse(inputText);
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      }, 1000);
    }
  };

  const generateBotResponse = (userMessage) => {
    const lowerCaseMessage = userMessage.toLowerCase();

    if (lowerCaseMessage.includes("hola") || lowerCaseMessage.includes("buenos días")) {
      return { text: "¡Hola! Bienvenido a Alquiladora Romero. ¿En qué puedo ayudarte hoy?", sender: "bot" };
    } else if (lowerCaseMessage.includes("rentar") || lowerCaseMessage.includes("alquilar")) {
      return { text: "Tenemos una variedad de artículos disponibles para rentar. ¿Qué tipo de artículo necesitas?", sender: "bot" };
    } else if (lowerCaseMessage.includes("precio") || lowerCaseMessage.includes("coste")) {
      return { text: "El precio varía según el artículo y el tiempo de renta. ¿Podrías especificar qué artículo te interesa?", sender: "bot" };
    } else if (lowerCaseMessage.includes("gracias") || lowerCaseMessage.includes("agradecido")) {
      return { text: "¡De nada! Estoy aquí para ayudarte. ¿Necesitas algo más?", sender: "bot" };
    } else {
      return { text: "Lo siento, no entendí tu pregunta. ¿Podrías ser más específico?", sender: "bot" };
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
      transition: { type: "spring", stiffness: 100 },
    },
    expanded: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <>
      <AnimatePresence>
        {!isMinimized ? (
          <motion.div
            initial="minimized"
            animate="expanded"
            exit="minimized"
            variants={chatboxVariants}
            className="fixed bottom-4 right-4 w-full max-w-xs sm:max-w-sm md:max-w-md h-[400px] sm:h-[450px] bg-white shadow-lg border-l border-t border-gray-200 rounded-tl-lg flex flex-col dark:bg-gray-950 dark:text-white"
          >
            {/* Header del Chatbox */}
            <div className="bg-[#fcb900] text-white p-3 sm:p-4 rounded-tl-lg flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ChatAlt2Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                <h2 className="text-sm sm:text-base font-semibold">Ayuda en línea</h2>
              </div>
              <div className="flex space-x-2">
                <button onClick={handleMinimize} className="hover:text-gray-200">
                  <MinusIcon className="w-6 h-6 sm:w-6 sm:h-6" />
                </button>
                <button onClick={onClose} className="hover:text-gray-200">
                  <XIcon className="w-6 h-6 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      message.sender === "user"
                        ? "bg-[#fcb900] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input para enviar mensajes */}
            <div className="p-3 sm:p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#fcb900] dark:bg-gray-950 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-[#fcb900] text-white p-2 rounded-lg hover:bg-yellow-500"
                >
                  Enviar
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-24 right-4 bg-[#fcb900] p-3 sm:p-4 rounded-full shadow-lg flex justify-center items-center cursor-pointer"
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