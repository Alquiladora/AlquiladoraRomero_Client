/* eslint-disable */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import {
  faInfoCircle,
  faUserShield,
  faGavel,
  faFileContract,
  faQuestionCircle,
  faShareAlt,
  faBuilding,
  faIndustry,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faWhatsapp,
  faLinkedin,
  faYoutube,
  faPinterest,
  faSnapchatGhost,
  faTiktok,
  faDiscord,
  faTelegramPlane,
} from '@fortawesome/free-brands-svg-icons';
import api from '../../utils/AxiosConfig';
import { useAuth } from '../../hooks/ContextAuth';

export const FooterDatos = () => {
  const { csrfToken, user } = useAuth();

  const [empresaData, setEmpresaData] = useState({
    nombreEmpresa: '',
    slogan: '',
    redesSociales: {},
  });

  const fetchEmpresaData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/empresa/redesociales', {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      setEmpresaData({
        ...response.data,
        redesSociales: JSON.parse(response.data.redesSociales || '{}'),
      });
    } catch (error) {
      console.error('Error al obtener datos de la empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (csrfToken) {
      fetchEmpresaData();
    }
  }, [fetchEmpresaData, csrfToken]);

  const getSocialIcon = (url = '') => {
    if (!url || typeof url !== 'string') return faShareAlt;
    if (url.includes('facebook.com')) return faFacebook;
    if (url.includes('instagram.com')) return faInstagram;
    if (url.includes('twitter.com') || url.includes('x.com')) return faTwitter;
    if (url.includes('whatsapp.com')) return faWhatsapp;
    if (url.includes('linkedin.com')) return faLinkedin;
    if (url.includes('youtube.com')) return faYoutube;
    if (url.includes('pinterest.com')) return faPinterest;
    if (url.includes('snapchat.com')) return faSnapchatGhost;
    if (url.includes('tiktok.com')) return faTiktok;
    if (url.includes('discord.com')) return faDiscord;
    if (url.includes('telegram.org') || url.includes('t.me'))
      return faTelegramPlane;
    return faShareAlt;
  };

  if (loading) {
    return (
      <p className="text-white text-center mt-4">
        Cargando datos de la empresa...
      </p>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col mb-6 md:mb-0">
            <h4 className="text-xl font-bold text-white mb-3 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              Información
            </h4>

            <Link
              to={
                user && user.rol === 'cliente'
                  ? `/cliente/politicas-privacidad`
                  : `/politicas-privacidad`
              }
              className="flex items-center text-sm text-white transition-colors mb-1 hover:text-gray-400"
            >
              <FontAwesomeIcon icon={faUserShield} className="mr-2" />
              Política de Privacidad
            </Link>
            <Link
              to={
                user && user.rol === 'cliente'
                  ? `/cliente/deslin-legal`
                  : `/deslin-legal`
              }
              className="flex items-center text-sm text-white transition-colors mb-1 hover:text-gray-400"
            >
              <FontAwesomeIcon icon={faGavel} className="mr-2" />
              Deskin legal
            </Link>
            <Link
              to={
                user && user.rol === 'cliente'
                  ? `/cliente/terminos-condiciones`
                  : `/terminos-condiciones`
              }
              className="flex items-center text-sm text-white transition-colors mb-1 hover:text-gray-400"
            >
              <FontAwesomeIcon icon={faFileContract} className="mr-2" />
              Términos y Condiciones
            </Link>
            <Link
              to="/sobre-nosotros"
              className="flex items-center text-sm text-white transition-colors mb-1 hover:text-gray-400"
            >
              <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
              Sobre nosotros
            </Link>
          </div>

          <div className="flex flex-col items-center mb-6 md:mb-0">
            <h4 className="text-xl font-bold text-white mb-3 flex items-center">
              <FontAwesomeIcon icon={faShareAlt} className="mr-2" />
              Redes Sociales
            </h4>

            <div className="flex flex-wrap justify-center space-x-6">
              {Object.entries(empresaData.redesSociales).length > 0 ? (
                Object.entries(empresaData.redesSociales).map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-400 text-3xl transition-all duration-300"
                  >
                    <FontAwesomeIcon icon={getSocialIcon(url)} />
                  </a>
                ))
              ) : (
                <p className="text-white text-sm">No hay redes sociales</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="text-xl font-bold text-white mb-3 flex items-center">
              <FontAwesomeIcon icon={faBuilding} className="mr-2" />
              Otras Compañías
            </h4>
            <a
              href="#"
              className="flex items-center text-sm text-white transition-colors mb-1 hover:text-gray-400"
            >
              <FontAwesomeIcon icon={faIndustry} className="mr-2" />
              Compañía 1
            </a>
            <a
              href="#"
              className="flex items-center text-sm text-white transition-colors mb-1 hover:text-gray-400"
            >
              <FontAwesomeIcon icon={faIndustry} className="mr-2" />
              Compañía 2
            </a>
            <a
              href="#"
              className="flex items-center text-sm text-white transition-colors mb-1 hover:text-gray-400"
            >
              <FontAwesomeIcon icon={faIndustry} className="mr-2" />
              Compañía 3
            </a>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden border-t border-b border-white py-4">
        <div className="absolute inset-0"></div>
        <div className="relative text-center text-white">
          {/* Texto secundario (derechos reservados) */}
          <p className="text-sm mt-1">
            © 2025 Alquiladora Romero. Todos los derechos reservados.
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <a
          href="#"
          className="inline-flex items-center text-sm text-white bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-md"
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Descarga nuestra App
        </a>
      </div>
    </>
  );
};
