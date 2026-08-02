const RutasBienestar = ({ premiumData, onBack, onHome }) => {
    const [activeRuta, setActiveRuta] = useState(null);
    const [activeModulo, setActiveModulo] = useState(0);

    if (!activeRuta) {
        return (
            <div className="animate-fadeIn max-w-6xl mx-auto py-12 relative z-10">
                <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
                <div className="text-center mb-16">
                    <Compass size={64} className="mx-auto text-brand-green mb-6" />
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800 mb-4"><span className="brush-highlight-green">Mis Rutas de Bienestar</span></h2>
                    <p className="text-xl text-stone-600 font-light">Explora los programas guiados para acompañar tu proceso emocional.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                    {premiumData.rutas.map((ruta, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => {setActiveRuta(ruta); setActiveModulo(0);}} 
                            className="text-left bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-glass hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col h-full group premium-card-border"
                        >
                            <div className="mb-4 text-brand-green group-hover:scale-110 transition-transform"><Leaf size={32} /></div>
                            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-3">{ruta.titulo}</h3>
                            <p className="text-stone-500 font-light line-clamp-3 leading-relaxed">{ruta.descripcion}</p>
                            <div className="mt-6 text-brand-green font-bold text-sm uppercase tracking-widest">Ingresar &rarr;</div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const modulo = activeRuta.modulos[activeModulo];

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto py-8 relative z-10">
            <BackButton onClick={() => setActiveRuta(null)} text="Volver a Rutas" onHome={onHome} />
            <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-white shadow-glass overflow-hidden">
                <div className="p-8 lg:p-10 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
                    <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800 mb-2">{activeRuta.titulo}</h2>
                </div>
                
                <div className="flex overflow-x-auto border-b border-stone-100 bg-white/50 no-scrollbar">
                    {activeRuta.modulos.map((m, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setActiveModulo(idx)} 
                            className={`px-8 py-5 font-bold whitespace-nowrap transition-colors ${activeModulo === idx ? 'text-brand-purple border-b-4 border-brand-purple bg-stone-50/50' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            Módulo {idx + 1}
                        </button>
                    ))}
                </div>
                
                <div className="p-8 lg:p-14 space-y-12">
                    <h3 className="text-3xl font-serif font-bold text-stone-800 mb-8">{modulo.titulo}</h3>
                    
                    {modulo.psicoeducacion && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-brand-purple font-bold uppercase tracking-widest text-sm">
                                <Brain size={20} /> Psicoeducación
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-800">{modulo.psicoeducacion.titulo}</h4>
                            <div className="space-y-4 text-stone-600 font-light leading-relaxed text-lg text-justify">
                                {modulo.psicoeducacion.parrafos.map((p, i) => <p key={i}>{p}</p>)}
                            </div>
                        </div>
                    )}

                    {modulo.te_ha_pasado && modulo.te_ha_pasado.length > 0 && (
                        <div className="bg-brand-purple/5 p-8 rounded-3xl border border-brand-purple/10">
                            <div className="flex items-center gap-3 text-brand-purple font-bold uppercase tracking-widest text-sm mb-6">
                                <MessageCircle size={20} /> ¿Te ha pasado que...?
                            </div>
                            <ul className="space-y-4">
                                {modulo.te_ha_pasado.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-stone-700 font-light text-lg">
                                        <span className="text-brand-purple mt-1">•</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {modulo.ejercicio && (
                        <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
                            <div className="flex items-center gap-3 text-stone-500 font-bold uppercase tracking-widest text-sm mb-6">
                                <PenTool size={20} /> Ejercicio NeuroBloom
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-800 mb-4">{modulo.ejercicio.titulo}</h4>
                            <p className="text-stone-600 font-light mb-6 text-lg">{modulo.ejercicio.instrucciones}</p>
                            <div className="space-y-4">
                                {modulo.ejercicio.pasos.map((paso, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 text-stone-700 font-light">{paso}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {modulo.audio && (
                        <div className="bg-gradient-to-r from-brand-lilac/20 to-brand-purple/20 p-8 rounded-3xl border border-brand-purple/20 flex flex-col gap-4 shadow-sm">
                            <div className="flex items-center gap-3 text-brand-purple font-bold uppercase tracking-widest text-sm">
                                {modulo.audio.youtube_id ? <PlayCircle size={20} /> : <Headphones size={20} />} 
                                {modulo.audio.duracion || "Contenido de Audio / Video"}
                            </div>
                            <h4 className="text-xl font-serif font-bold text-stone-800">{modulo.audio.titulo}</h4>
                            
                            {modulo.audio.youtube_id ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md mt-2">
                                    <iframe 
                                        className="absolute top-0 left-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${modulo.audio.youtube_id}`} 
                                        title="YouTube video player" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen>
                                    </iframe>
                                </div>
                            ) : modulo.audio.url ? (
                                <div className="mt-2 bg-white/80 p-4 rounded-2xl border border-brand-purple/20 shadow-inner">
                                    <audio controls className="w-full outline-none">
                                        <source src={modulo.audio.url} type="audio/mpeg" />
                                        Tu navegador no soporta el elemento de audio.
                                    </audio>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-stone-500 italic text-sm mt-2">
                                    <PlayCircle size={24} className="text-brand-purple" />
                                    <span>El archivo estará disponible muy pronto.</span>
                                </div>
                            )}
                        </div>
                    )}

                    {modulo.hoja_trabajo && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-actionBlue font-bold uppercase tracking-widest text-sm">
                                <FileText size={20} /> Hoja de Trabajo
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-800">{modulo.hoja_trabajo.titulo}</h4>
                            <div className="bg-white border-2 border-dashed border-stone-200 p-8 rounded-3xl space-y-4 text-stone-600 font-light text-lg">
                                {modulo.hoja_trabajo.contenido.map((c, i) => <p key={i}>{c}</p>)}
                            </div>
                        </div>
                    )}

                    {modulo.reto && (
                        <div className="bg-brand-green/10 p-8 rounded-3xl border border-brand-green/20">
                            <div className="flex items-center gap-3 text-brand-green font-bold uppercase tracking-widest text-sm mb-6">
                                <Leaf size={20} /> Práctica de la Semana
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-800">{modulo.reto.titulo}</h4>
                            <div className="space-y-4 text-stone-700 font-light text-lg">
                                {modulo.reto.contenido.map((c, i) => <p key={i}>{c}</p>)}
                            </div>
                        </div>
                    )}

                    {modulo.cierre && modulo.cierre.length > 0 && (
                        <div className="border-t border-stone-100 pt-12 space-y-6 text-center">
                            <HeartHandshake size={48} className="mx-auto text-brand-lilac mb-6" />
                            <div className="space-y-4 text-stone-600 font-light text-lg max-w-2xl mx-auto">
                                {modulo.cierre.map((c, i) => <p key={i}>{c}</p>)}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};