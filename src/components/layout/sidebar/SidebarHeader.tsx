import { RxCross2 } from "react-icons/rx";

// definimos las propiedades de nuestro elemento Header
interface SidebarHeaderProps {
  title?: string;
  onClose: () => void;
}

// Le damos valor a las propiedades
export default function SidebarHeader({
    title = "Panel Administrativo",
    onClose,

}: SidebarHeaderProps){/*Aqui definimos el contenido del Header */

    return(
        <div className=" flex items-center justify-between px-3 py-2 mb-6">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            {title}
      </span>

      <button
        onClick={onClose}
        className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Cerrar menú">
            <RxCross2 className="w-5 h-5" />
        </button>
        </div>
    )
}


