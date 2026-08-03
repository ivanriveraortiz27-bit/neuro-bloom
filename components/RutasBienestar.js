// components/RutasBienestar.js
// Refactor: lazy loading por ruta.
//  - Grilla de 7 rutas: renderizada desde RUTAS_INDEX (0 fetch).
//  - Click en ruta -> fetch(`./premium_ruta_${numero}.json`).
//  - Volver a la lista -> se descarta la ruta anterior (no hay caché).
//  - Módulos dentro de la ruta: tabs accesibles (WAI-ARIA).

// ------------------------------------------------------------------
// Índice ligero para la grilla. NO trae `modulos`: solo lo que se
// muestra en la tarjeta antes de hacer clic.
// ------------------------------------------------------------------
const RUTAS_INDEX = [
    {
        id: 'ruta1',
        numero: 1,
        titulo: 'Ruta 1. Regular mi sistema nervioso',
        descripcion:
            'Aprende a comprender las respuestas de tu cuerpo al estrés y desarrolla herramientas para recuperar la calma.'
    },
    {
        id: 'ruta2',
        numero: 2,
        titulo: 'Ruta 2. Fortalecer mi autoestima',
        descripcion:
            'Construye una relación más amable contigo, reconoce tu valor y fortalece tu confianza.'
    },
    {
        id: 'ruta3',
        numero: 3,
        titulo: 'Ruta 3. Gestionar la ansiedad',
        descripcion:
            'Comprende por qué aparece la ansiedad, aprende a distinguir hechos de pensamientos y desarrolla una relación más serena con la incertidumbre.'
    },
    {
        id: 'ruta4',
        numero: 4,
        titulo: 'Ruta 4. Recuperar mi energía y aprender a descansar',
        descripcion:
            'Recupera tu energía, aprende a descansar sin culpa y construye un equilibrio sostenible en tu día a día.'
    },
    {
        id: 'ruta5',
        numero: 5,
        titulo: 'Ruta 5. Reconectar con mis emociones y recuperar la esperanza',
        descripcion:
            'Reconecta con lo que sientes, sana la desconexión emocional y vuelve a encontrar sentido y esperanza.'
    },
    {
        id: 'ruta6',
        numero: 6,
        titulo: 'Ruta 6. Relacionarme con los demás sin dejar de ser yo',
        descripcion:
            'Fortalece tus vínculos, aprende a poner límites saludables y expresa lo que necesitas sin dejar de ser tú.'
    },
    {
        id: 'ruta7',
        numero: 7,
        titulo: 'Ruta 7. Construir una vida con propósito y bienestar',
        descripcion:
            'Descubre tus valores, cultiva hábitos con sentido y construye una vida coherente con lo que verdaderamente importa.'
    }
];

const RutasBienestar = ({ onBack, onHome }) => {
    // Datos de la ruta activa (JSON completo)
    const [activeRuta, setActiveRuta] = useState(null);
    const [loadingRuta, setLoadingRuta] = useState(false);
    const [errorRuta, setErrorRuta] = useState(false);
    const [pendingNumero, setPendingNumero] = useState(null);

    // UI local
    const [activeModulo, setActiveModulo] = useState(0);
    const tabRefs = useRef([]);

    // ---- Cargar ruta on demand ----
    const cargarRuta = numero => {
        setPendingNumero(numero);
        setLoadingRuta(true);
        setErrorRuta(false);
        setActiveRuta(null);
        setActiveModulo(0);

        fetch(`./premium_ruta_${numero}.json`)
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(data => {
                setActiveRuta(data);
                setLoadingRuta(false);
            })
            .catch(err => {
                console.error(`❌ Error cargando premium_ruta_${numero}.json:`, err);
                setErrorRuta(true);
                setLoadingRuta(false);
            });
    };

    // ---- Volver a la lista: descarta la ruta anterior ----
    const volverAListaRutas = () => {
        setActiveRuta(null);
        setLoadingRuta(false);
        setErrorRuta(false);
        setPendingNumero(null);
        setActiveModulo(0);
    };

    // ---- Navegación por teclado entre tabs de módulos ----
    const handleTabKeyDown = (e, idx) => {
        if (!activeRuta) return;
        const total = activeRuta.modulos.length;
        let nextIdx = null;

        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % total;
        else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + total) % total;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = total - 1;

        if (nextIdx !== null) {
            e.preventDefault();
            setActiveModulo(nextIdx);
            setTimeout(() => tabRefs.current[nextIdx]?.focus(), 0);
        }
    };

    // ==================================================================
    // A) GRILLA DE RUTAS (sin ruta activa ni cargando)
    // ==================================================================
    if (!activeRuta && !loadingRuta && !errorRuta) {
        return (
            <div className="animate-fadeIn max-w-6xl mx-auto py-12 relative z-10">
                <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
                <div className="text-center mb-16">
                    <Compass size={64} className="mx-auto text-brand-green mb-6" />
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800 mb-4">
                        <span className="brush-highlight-green">Mis Rutas de Bienestar</span>
                    </h2>
                    <p className="text-xl text-stone-600 font-light">
                        Explora los programas guiados para acompañar tu proceso emocional.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                    {RUTAS_INDEX.map(ruta => (
                        <button
                            key={ruta.id}
                            onClick={() => cargarRuta(ruta.numero)}
                            data-testid={`ruta-card-${ruta.numero}`}
                            className="text-left bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-glass hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col h-full group premium-card-border focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-green/30"
                        >
                            <div className="mb-4 text-brand-green group-hover:scale-110 transition-transform">
                                <Leaf size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-3">
                                {ruta.titulo}
                            </h3>
                            <p className="text-stone-500 font-light line-clamp-3 leading-relaxed">
                                {ruta.descripcion}
                            </p>
                            <div className="mt-6 text-brand-green font-bold text-sm uppercase tracking-widest">
                                Ingresar &rarr;
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // ==================================================================
    // B) SKELETON: mientras carga una ruta específica
    // ==================================================================
    if (loadingRuta) {
        const rutaMeta = RUTAS_INDEX.find(r => r.numero === pendingNumero);
        return (
            <div className="animate-fadeIn max-w-4xl mx-auto py-8 relative z-10">
                <BackButton onClick={volverAListaRutas} text="Volver a Rutas" onHome={onHome} />
                <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-white shadow-glass overflow-hidden">
                    {/* Header: mostramos el título real desde el índice para dar contexto */}
                    <div className="p-8 lg:p-10 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
                        <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800 mb-2">
                            {rutaMeta ? rutaMeta.titulo : 'Cargando ruta…'}
                        </h2>
                        <p className="text-stone-400 font-light text-sm italic">
                            Preparando el contenido…
                        </p>
                    </div>
                    {/* Tabs skeleton */}
                    <div className="flex border-b border-stone-100 bg-white/50 gap-3 p-3">
                        {[0, 1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="h-10 w-28 bg-stone-200/70 rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                    {/* Contenido skeleton (psicoeducación + ejercicio) */}
                    <div className="p-8 lg:p-14 space-y-12 animate-pulse">
                        <div className="h-8 bg-stone-200/70 rounded-2xl w-2/3" />
                        <div className="space-y-3">
                            <div className="h-4 bg-stone-200/70 rounded-full" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-11/12" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-10/12" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-9/12" />
                        </div>
                        <div className="bg-brand-purple/5 p-8 rounded-3xl border border-brand-purple/10 space-y-4">
                            <div className="h-5 bg-brand-purple/20 rounded-full w-1/3" />
                            <div className="h-4 bg-stone-200/70 rounded-full" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-11/12" />
                        </div>
                        <div className="bg-brand-green/10 p-8 rounded-3xl border border-brand-green/20 space-y-4">
                            <div className="h-5 bg-brand-green/30 rounded-full w-1/3" />
                            <div className="h-4 bg-stone-200/70 rounded-full" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-10/12" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==================================================================
    // C) ERROR: fallo al cargar la ruta
    // ==================================================================
    if (errorRuta) {
        return (
            <div className="animate-fadeIn max-w-4xl mx-auto py-12 relative z-10 text-center">
                <BackButton onClick={volverAListaRutas} text="Volver a Rutas" onHome={onHome} />
                <div className="bg-white/80 backdrop-blur-xl p-10 lg:p-16 rounded-[3rem] border border-white shadow-glass">
                    <Leaf size={64} className="mx-auto text-brand-green/40 mb-6" />
                    <h2 className="text-3xl font-serif font-bold text-stone-600 mb-4">
                        No pudimos cargar esta ruta
                    </h2>
                    <p className="text-lg text-stone-500 mb-3">
                        Ocurrió un problema al leer el archivo{' '}
                        <code className="bg-stone-100 px-2 py-1 rounded text-sm">
                            premium_ruta_{pendingNumero}.json
                        </code>
                        .
                    </p>
                    <p className="text-stone-400 font-light text-sm italic mb-8">
                        Verifica tu conexión o que el archivo exista en la raíz del proyecto.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => cargarRuta(pendingNumero)}
                            className="px-8 py-4 bg-brand-green text-white rounded-full font-bold text-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all"
                        >
                            🔄 Reintentar
                        </button>
                        <button
                            onClick={volverAListaRutas}
                            className="px-8 py-4 bg-white border border-stone-200 text-stone-600 rounded-full font-bold text-lg hover:bg-stone-50 transition-all"
                        >
                            Ver todas las rutas
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==================================================================
    // D) VISTA DE RUTA CARGADA (contenido completo)
    // ==================================================================
    const modulo = activeRuta.modulos[activeModulo];

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto py-8 relative z-10">
            <BackButton onClick={volverAListaRutas} text="Volver a Rutas" onHome={onHome} />
            <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-white shadow-glass overflow-hidden">
                {/* Header */}
                <div className="p-8 lg:p-10 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
                    <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800 mb-2">
                        {activeRuta.titulo}
                    </h2>
                    {activeRuta.descripcion && (
                        <p className="text-stone-500 font-light">{activeRuta.descripcion}</p>
                    )}
                </div>

                {/* Tabs de módulos (WAI-ARIA) */}
                <div
                    role="tablist"
                    aria-label={`Módulos de ${activeRuta.titulo}`}
                    className="flex overflow-x-auto border-b border-stone-100 bg-white/50 no-scrollbar"
                >
                    {activeRuta.modulos.map((m, idx) => {
                        const isActive = activeModulo === idx;
                        return (
                            <button
                                key={idx}
                                ref={el => (tabRefs.current[idx] = el)}
                                role="tab"
                                id={`ruta-tab-${idx}`}
                                aria-selected={isActive}
                                aria-controls={`ruta-panel-${idx}`}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => setActiveModulo(idx)}
                                onKeyDown={e => handleTabKeyDown(e, idx)}
                                data-testid={`ruta-modulo-tab-${idx}`}
                                className={`px-8 py-5 font-bold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:ring-inset border-b-4 ${
                                    isActive
                                        ? 'text-brand-purple border-brand-purple bg-stone-50/50'
                                        : 'text-stone-400 hover:text-stone-600 border-transparent'
                                }`}
                            >
                                Módulo {idx + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Panel del módulo activo */}
                <div
                    role="tabpanel"
                    id={`ruta-panel-${activeModulo}`}
                    aria-labelledby={`ruta-tab-${activeModulo}`}
                    tabIndex={0}
                    key={activeModulo /* remount -> fadeIn */}
                    className="p-8 lg:p-14 space-y-12 animate-fadeIn focus:outline-none"
                >
                    <h3 className="text-3xl font-serif font-bold text-stone-800 mb-8">
                        {modulo.titulo}
                    </h3>

                    {/* Psicoeducación */}
                    {modulo.psicoeducacion && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-brand-purple font-bold uppercase tracking-widest text-sm">
                                <Brain size={20} /> Psicoeducación
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-800">
                                {modulo.psicoeducacion.titulo}
                            </h4>
                            <div className="space-y-4 text-stone-600 font-light leading-relaxed text-lg text-justify">
                                {modulo.psicoeducacion.parrafos.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Te ha pasado que...? */}
                    {modulo.te_ha_pasado && modulo.te_ha_pasado.length > 0 && (
                        <div className="bg-brand-purple/5 p-8 rounded-3xl border border-brand-purple/10">
                            <div className="flex items-center gap-3 text-brand-purple font-bold uppercase tracking-widest text-sm mb-6">
                                <MessageCircle size={20} /> ¿Te ha pasado que...?
                            </div>
                            <ul className="space-y-4">
                                {modulo.te_ha_pasado.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex gap-3 text-stone-700 font-light text-lg"
                                    >
                                        <span className="text-brand-purple mt-1">•</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Ejercicio NeuroBloom */}
                    {modulo.ejercicio && (
                        <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
                            <div className="flex items-center gap-3 text-stone-500 font-bold uppercase tracking-widest text-sm mb-6">
                                <PenTool size={20} /> Ejercicio NeuroBloom
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-800 mb-4">
                                {modulo.ejercicio.titulo}
                            </h4>
                            <p className="text-stone-600 font-light mb-6 text-lg">
                                {modulo.ejercicio.instrucciones}
                            </p>
                            <div className="space-y-4">
                                {modulo.ejercicio.pasos.map((paso, i) => (
                                    <div
                                        key={i}
                                        className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 text-stone-700 font-light"
                                    >
                                        {paso}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Audio / Video */}
                    {modulo.audio && (
                        <div className="bg-gradient-to-r from-brand-lilac/20 to-brand-purple/20 p-8 rounded-3xl border border-brand-purple/20 flex flex-col gap-4 shadow-sm">
                            <div className="flex items-center gap-3 text-brand-purple font-bold uppercase tracking-widest text-sm">
                                {modulo.audio.youtube_id ? (
                                    <PlayCircle size={20} />
                                ) : (
                                    <Headphones size={20} />
                                )}
                                {modulo.audio.duracion || 'Contenido de Audio / Video'}
                            </div>
                            <h4 className="text-xl font-serif font-bold text-stone-800">
                                {modulo.audio.titulo}
                            </h4>

                            {modulo.audio.youtube_id ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md mt-2">
                                    <iframe
                                        className="absolute top-0 left-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${modulo.audio.youtube_id}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
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

                    {/* Hoja de trabajo */}
                    {modulo.hoja_trabajo && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-actionBlue font-bold uppercase tracking-widest text-sm">
                                <FileText size={20} /> Hoja de Trabajo
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-800">
                                {modulo.hoja_trabajo.titulo}
                            </h4>
                            <div className="bg-white border-2 border-dashed border-stone-200 p-8 rounded-3xl space-y-4 text-stone-600 font-light text-lg">
                                {modulo.hoja_trabajo.contenido.map((c, i) => (
                                    <p key={i}>{c}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reto / Práctica de la Semana */}
                    {modulo.reto && (
                        <div className="bg-brand-green/10 p-8 rounded-3xl border border-brand-green/20">
                            <div className="flex items-center gap-3 text-brand-green font-bold uppercase tracking-widest text-sm mb-6">
                                <Leaf size={20} /> Práctica de la Semana
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-800">
                                {modulo.reto.titulo}
                            </h4>
                            <div className="space-y-4 text-stone-700 font-light text-lg">
                                {modulo.reto.contenido.map((c, i) => (
                                    <p key={i}>{c}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cierre */}
                    {modulo.cierre && modulo.cierre.length > 0 && (
                        <div className="border-t border-stone-100 pt-12 space-y-6 text-center">
                            <HeartHandshake
                                size={48}
                                className="mx-auto text-brand-lilac mb-6"
                            />
                            <div className="space-y-4 text-stone-600 font-light text-lg max-w-2xl mx-auto">
                                {modulo.cierre.map((c, i) => (
                                    <p key={i}>{c}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};