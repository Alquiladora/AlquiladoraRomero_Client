import RelevantesProducts from "./RelevantProduts";
import Testimonios from "./Testimonio";

const Seccion4=()=>{

    return(
        <>
          <div className="flex flex-col md:flex-row justify-between p-1 md:p-10 gap-10">
           <RelevantesProducts/>
           <Testimonios/>
          </div>
        
        
        </>
    )
}

export default Seccion4;