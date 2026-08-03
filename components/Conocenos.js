// components/Conocenos.js

const Conocenos = ({ onBack, onHome }) => {
    return (
        <div className="animate-fadeIn max-w-6xl mx-auto py-12 relative z-10">
            <BackButton onClick={onBack} text="Volver al Inicio" onHome={onHome} />
            
            <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-brand-lilac/30 to-brand-purple/30 rounded-full shadow-md mb-6">
                    <HeartHandshake size={48} className="text-brand-purple" />
                </div>
                <h2 className="text-5xl font-serif font-bold mb-6 text-stone-800">
                    <span className="brush-highlight">Conócenos</span>
                </h2>
                <p className="text-stone-600 max-w-2xl mx-auto text-xl font-light leading-relaxed">
                    Detrás de Neuro Bloom hay mentes creativas y corazones apasionados por el bienestar emocional. Te invitamos a conocer a quienes hacen posible este espacio.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-stretch">
                
                {/* --- Tarjeta: Creadora (Tania Grajeda) --- */}
                <div className="bg-white/80 backdrop-blur-xl p-8 lg:p-12 rounded-[3rem] shadow-glass border border-white flex flex-col items-center text-center transform transition-all hover:-translate-y-2 hover:shadow-xl group">
                    <div className="w-48 h-48 mb-8 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                        <Thumbnail 
                            src="./tania_grajeda.jpeg" 
                            alt="Tania Grajeda" 
                            className="w-full h-full object-cover"
                            fallback={<div className="w-full h-full bg-pink-100 flex items-center justify-center text-pink-400"><UserCircle size={64}/></div>}
                        />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-stone-800 mb-2">Tania Grajeda</h3>
                    <p className="text-brand-purple font-bold tracking-widest uppercase text-sm mb-6">Creadora & Fundadora</p>
                    
                    <p className="text-stone-600 font-light leading-relaxed mb-8 flex-grow">
                        Apasionada por el desarrollo humano y la psicología. Su visión dio vida a Neuro Bloom con el firme propósito de crear un espacio seguro donde el bienestar emocional, la validación y el autoconocimiento sean accesibles para todos. A través de sus historias y recursos, busca acompañar a cada persona en su propio proceso de florecimiento.
                    </p>
                    
                    <a 
                        href="https://www.tiktok.com/@taniagrajeda.neuro_bloom?_r=1&_t=ZS-98Odi3pWHUf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors shadow-md"
                    >
                        <PlayCircle size={18} /> Sígueme en TikTok
                    </a>
                </div>

                {/* --- Tarjeta: Desarrollador (Rodrigo Ortiz) --- */}
                <div className="bg-white/80 backdrop-blur-xl p-8 lg:p-12 rounded-[3rem] shadow-glass border border-white flex flex-col items-center text-center transform transition-all hover:-translate-y-2 hover:shadow-xl group">
                    <div className="w-48 h-48 mb-8 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500 bg-stone-100 flex items-center justify-center">
                        {/* Como no hay foto aún, usamos un icono elegante. Si después agregas una, usa el componente Thumbnail como en la tarjeta de Tania */}
                        <Activity size={80} className="text-stone-300" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-stone-800 mb-2">Rodrigo Ortiz</h3>
                    <p className="text-brand-green font-bold tracking-widest uppercase text-sm mb-6">Desarrollador de Software</p>
                    
                    <p className="text-stone-600 font-light leading-relaxed mb-8 flex-grow">
                        Ingeniero en Mecatrónica y desarrollador apasionado por crear arquitecturas modulares, limpias y funcionales. Con un enfoque en el diseño intuitivo y la integración tecnológica, Rodrigo es el arquitecto digital que traduce las ideas de Neuro Bloom en la plataforma interactiva y segura que tienes en tus manos. Cuando no está programando, probablemente lo encuentres tocando la guitarra o modelando proyectos en 3D.
                    </p>
                    
                    <a 
                        href="https://www.instagram.com/royitodejamonconqueso2?igsh=cG1hMjJmcHZ3Mnk0" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors shadow-md"
                    >
                        <Heart size={18} /> Sígueme en Instagram
                    </a>
                </div>

            </div>
        </div>
    );
};