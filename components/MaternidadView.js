const MaternidadView = ({ premiumData, onBack, onHome }) => {
    const [activeModulo, setActiveModulo] = useState(0);
    const maternidad = premiumData.maternidad;

    if (!maternidad) return null;
    const modulo = maternidad.modulos[activeModulo];

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto py-8 relative z-10">
            <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
            <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-white shadow-glass overflow-hidden">
                <div className="p-8 lg:p-10 border-b border-stone-100 bg-gradient-to-r from-pink-50 to-white flex items-center gap-6">
                    <div className="p-4 bg-pink-100 text-pink-500 rounded-2xl shadow-sm"><Sprout size={40} /></div>
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800 mb-2"><span className="brush-highlight-pink">{maternidad.titulo}</span></h2>
                        <p className="text-stone-500 font-light">{maternidad.descripcion}</p>
                    </div>
                </div>
                
                <div className="flex overflow-x-auto border-b border-stone-100 bg-white/50 no-scrollbar">
                    {maternidad.modulos.map((m, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setActiveModulo(idx)} 
                            className={`px-6 py-5 font-bold whitespace-nowrap transition-colors ${activeModulo === idx ? 'text-pink-500 border-b-4 border-pink-400 bg-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            {m.titulo}
                        </button>
                    ))}
                </div>
                
                <div className="p-8 lg:p-14 space-y-12">
                    {modulo.articulos && modulo.articulos.map((articulo, i) => (
                        <div key={i} className="space-y-6">
                            {articulo.titulo !== "Introducción" && (
                                <h4 className="text-2xl font-serif font-bold text-pink-600">{articulo.titulo}</h4>
                            )}
                            <div className="space-y-4 text-stone-600 font-light leading-relaxed text-lg text-justify">
                                {articulo.parrafos.map((p, j) => {
                                    if (p.startsWith('"') && p.endsWith('"')) {
                                        return <p key={j} className="italic font-medium text-pink-500/90 text-center my-6 text-xl">"{p.replace(/"/g, '')}"</p>;
                                    }
                                    return <p key={j}>{p}</p>;
                                })}
                            </div>
                            {i < modulo.articulos.length - 1 && <hr className="border-pink-100/50 my-10" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};