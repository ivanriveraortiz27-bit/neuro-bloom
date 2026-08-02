const PerfilEmocional = ({ premiumData, onBack, onHome }) => {
    const perfil = premiumData?.perfil_emocional;
    const [dimActual, setDimActual] = useState(-1);
    const [respuestas, setRespuestas] = useState({});

    if (!perfil) {
        return (
            <div className="animate-fadeIn max-w-4xl mx-auto py-12 relative z-10 text-center">
                <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
                <div className="bg-white/80 backdrop-blur-xl p-10 lg:p-16 rounded-[3rem] border border-white shadow-glass">
                    <Activity size={64} className="mx-auto text-stone-300 mb-6" />
                    <h2 className="text-3xl font-serif font-bold text-stone-600 mb-4">Sección en Construcción</h2>
                    <p className="text-lg text-stone-500 mb-4">Los datos de tu "Perfil Emocional" no se encontraron en tu archivo premium.</p>
                    <p className="text-stone-400 font-light text-sm italic">Verifica que tu premium_data.json tenga la propiedad "perfil_emocional".</p>
                </div>
            </div>
        );
    }

    const iniciarTest = () => { setDimActual(0); setRespuestas({}); };
    const handleRespuesta = (dimId, qIdx, valor) => {
        setRespuestas(prev => ({ ...prev, [dimId]: { ...prev[dimId], [qIdx]: valor } }));
    };
    const avanzarDimension = () => {
        setDimActual(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const calcularResultadosFinales = () => {
        let resultados = [];
        perfil.dimensiones.forEach(dim => {
            let puntaje = 0;
            dim.preguntas.forEach((q, idx) => {
                let valor = respuestas[dim.id]?.[idx] || 0;
                if (q.invertida) valor = 4 - valor;
                puntaje += valor;
            });
            const nivelObj = dim.resultados.find(r => puntaje >= r.rango[0] && puntaje <= r.rango[1]);
            resultados.push({ titulo: dim.titulo, descripcion: dim.descripcion, puntaje, ...nivelObj });
        });
        return resultados;
    };

    if (dimActual === -1) {
        return (
            <div className="animate-fadeIn max-w-4xl mx-auto py-12 relative z-10">
                <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
                <div className="bg-white/80 backdrop-blur-xl p-10 lg:p-16 rounded-[3rem] border border-white shadow-glass text-center">
                    <Brain size={80} className="mx-auto text-brand-purple mb-8 animate-pulse" />
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800 mb-8"><span className="brush-highlight">Conoce tu Perfil Emocional</span></h2>
                    <p className="text-xl text-stone-600 mb-10 leading-relaxed max-w-2xl mx-auto font-light">{perfil.intro}</p>
                    <button onClick={iniciarTest} className="px-10 py-5 bg-brand-purple text-white rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                        🌸 Comenzar evaluación
                    </button>
                </div>
            </div>
        );
    }

    if (dimActual >= 0 && dimActual < perfil.dimensiones.length) {
        const dim = perfil.dimensiones[dimActual];
        const numPreguntas = dim.preguntas.length;
        const respondidas = Object.keys(respuestas[dim.id] || {}).length;
        const progreso = ((dimActual) / perfil.dimensiones.length) * 100;

        return (
            <div className="animate-fadeIn max-w-4xl mx-auto py-8 relative z-10">
                <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
                <div className="w-full bg-white/50 rounded-full h-3 mb-8 shadow-inner overflow-hidden border border-white">
                    <div className="bg-brand-purple h-3 rounded-full transition-all duration-500" style={{ width: `${progreso}%` }}></div>
                </div>
                <div className="bg-white/90 backdrop-blur-xl p-8 lg:p-14 rounded-[2.5rem] border border-white shadow-glass">
                    <div className="mb-10 text-center border-b border-stone-100 pb-8">
                        <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-purple mb-4">{dim.titulo}</h2>
                        <p className="text-lg text-stone-500 font-light max-w-2xl mx-auto">{dim.descripcion}</p>
                    </div>
                    <div className="space-y-8">
                        {dim.preguntas.map((q, idx) => (
                            <div key={idx} className="bg-stone-50/50 p-6 lg:p-8 rounded-3xl border border-white hover:shadow-md transition-shadow">
                                <p className="font-bold text-stone-800 mb-6 text-lg lg:text-xl">{q.texto}</p>
                                <div className="flex flex-wrap gap-3 lg:gap-4">
                                    {perfil.escala.map((opc, oIdx) => {
                                        const isSelected = respuestas[dim.id]?.[idx] === opc.v;
                                        return (
                                            <button key={oIdx} onClick={() => handleRespuesta(dim.id, idx, opc.v)} className={`flex-grow sm:flex-grow-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${isSelected ? 'bg-brand-purple text-white shadow-lg border-brand-purple scale-105' : 'bg-white border-stone-200 text-stone-500 hover:border-brand-purple hover:text-brand-purple'}`}>
                                                {opc.l}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 pt-8 border-t border-stone-100 flex items-center justify-between">
                        <p className="text-stone-400 font-bold">{respondidas} de {numPreguntas} respondidas</p>
                        <button onClick={avanzarDimension} disabled={respondidas < numPreguntas} className="px-8 py-4 bg-brand-purple text-white rounded-full font-bold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transition-transform flex items-center gap-2">
                            {dimActual === perfil.dimensiones.length - 1 ? 'Ver Resultados' : 'Siguiente Dimensión'} &rarr;
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (dimActual === perfil.dimensiones.length) {
        const resultados = calcularResultadosFinales();
        return (
            <div className="animate-fadeIn max-w-5xl mx-auto py-12 relative z-10">
                <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
                <div className="text-center mb-16">
                    <CheckCircle size={64} className="mx-auto text-brand-green mb-6 animate-bounce" style={{animationDuration: '2s'}}/>
                    <h2 className="text-5xl font-serif font-bold text-stone-800 mb-4"><span className="brush-highlight">Tu Perfil Emocional</span></h2>
                    <p className="text-xl text-stone-600 font-light">Este es el análisis de tus 7 dimensiones y nuestras rutas sugeridas para ti.</p>
                </div>
                <div className="space-y-10">
                    {resultados.map((res, idx) => (
                        <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-glass overflow-hidden">
                            <div className={`p-8 border-b border-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${res.bg}`}>
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-stone-800">{res.titulo}</h3>
                                    <p className="text-stone-600 font-light mt-1">{res.descripcion}</p>
                                </div>
                                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-white text-center min-w-[120px]">
                                    <p className={`text-xl font-black ${res.color}`}>{res.nivel}</p>
                                </div>
                            </div>
                            <div className="p-8 lg:p-10">
                                <div className="mb-8">
                                    <h4 className="font-bold text-brand-purple uppercase tracking-wider mb-3 text-sm">¿Qué significa tu resultado?</h4>
                                    <p className="text-stone-700 leading-relaxed">{res.desc}</p>
                                </div>
                                <div className="mb-8">
                                    <h4 className="font-bold text-stone-800 uppercase tracking-wider mb-3 text-sm">Esto podría reflejarse en tu día a día:</h4>
                                    <p className="text-stone-600 italic border-l-4 border-stone-200 pl-4 py-1">{res.reflejo}</p>
                                </div>
                                <div className="bg-stone-50/80 p-6 rounded-2xl border border-stone-100">
                                    <h4 className="font-bold text-brand-green uppercase tracking-wider mb-4 text-sm flex items-center gap-2">
                                        <Sprout size={16} /> Rutas Sugeridas
                                    </h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3"><span className="text-brand-purple font-black">•</span><span><strong className="text-stone-700">Ruta principal:</strong> <span className="text-stone-600">{res.ruta_prin}</span></span></li>
                                        <li className="flex items-start gap-3"><span className="text-brand-lilac font-black">•</span><span><strong className="text-stone-700">Ruta complementaria:</strong> <span className="text-stone-600">{res.ruta_comp}</span></span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-16 text-center">
                    <button onClick={onBack} className="px-10 py-5 bg-stone-800 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                        Ir a Mis Rutas
                    </button>
                </div>
            </div>
        );
    }
    return null;
};