import React from "react";
import { useLocation } from 'react-router-dom';
import Header from '../header/Header'
import Footer from '../footer/Footer'

const LayoutHeader=({children})=>{
  const location= useLocation();
  let encabezado;
  let piePagina;

  if(location.pathname.startsWith('/admin')){
      encabezado=<Header admin={true}/>;
      piePagina=<Footer admin={true}/>;

      
  }else if(location.pathname.startsWith('/cliente')){
      encabezado=<Header cliente={true}/>;
      piePagina=<Footer cliente={true}/>;
  }else{
      encabezado=<Header/>
      piePagina=<Footer/>
  }

  return(
      <>
      {encabezado}
      <div>
          {children}
          {piePagina}
      </div>
      
      </>
  )
}

export  default LayoutHeader;