// components/MaternidadView.js
// Refactor: ya no depende de `premiumData`. Fetch directo de premium_maternidad.json.
// UI: Tabs accesibles con patrón WAI-ARIA (role="tablist" + nav por teclado).

const MaternidadView = ({ onBack, onHome }) => {
    // --- Estado de datos (nuevo) ---
    const [maternidad, setMaternidad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // --- Estado UI (idéntico al original + refs para focus mgmt) ---
    const [activeModulo, setActiveModulo] = useState(0);
    const tabRefs = useRef([]);

    // --- Carga modular ---
    const cargarMaternidad = () => {
        setLoading(true);
        setError(false);
        fetch('./premium_maternidad.json')
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(data => {
                setMaternidad(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('❌ Error cargando premium_maternidad.json:', err);
                setError(true);
                setLoading(false);
            });
    };

    useEffect(() => {
        cargarMaternidad();
    }, []);

    // --- Navegación por teclado entre tabs (patrón WAI-ARIA) ---
    const handleTabKeyDown = (e, idx) => {
        if (!maternidad) return;
        const total = maternidad.modulos.length;
        let nextIdx = null;

        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % total;
        else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + total) % total;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = total - 1;

        if (nextIdx !== null) {
            e.preventDefault();
            setActiveModulo(nextIdx);
            // enfoca el nuevo tab
            setTimeout(() => tabRefs.current[nextIdx]?.focus(), 0);
        }
    };

    // ------------------------------------------------------------------
    // 1) Skeleton loader (rosa/glass, respeta el lenguaje visual actual)
    // ------------------------------------------------------------------
    if (loading) {
        return (
            <div className="animate-fadeIn max-w-4xl mx-auto py-8 relative z-10">
                <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
                <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-white shadow-glass overflow-hidden">
                    {/* Header skeleton con gradient rosa */}
                    <div className="p-8 lg:p-10 border-b border-stone-100 bg-gradient-to-r from-pink-50 to-white">
                        <div className="animate-pulse flex items-center gap-6">
                            <div className="p-4 bg-pink-100/70 rounded-2xl w-20 h-20" />
                            <div className="flex-1 space-y-3">
                                <div className="h-8 bg-pink-100/70 rounded-2xl w-2/3" />
                                <div className="h-4 bg-stone-200/70 rounded-full w-11/12" />
                            </div>
                        </div>
                    </div>
                    {/* Tabs skeleton */}
                    <div className="flex overflow-hidden border-b border-stone-100 bg-white/50 gap-2 p-2">
                        {[0, 1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="h-10 bg-stone-200/70 rounded-xl animate-pulse"
                                style={{ width: `${140 + i * 20}px`, flexShrink: 0 }}
                            />
                        ))}
                    </div>
                    {/* Contenido skeleton */}
                    <div className="p-8 lg:p-14 space-y-8 animate-pulse">
                        <div className="space-y-3">
                            <div className="h-4 bg-stone-200/70 rounded-full" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-11/12" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-10/12" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-9/12" />
                        </div>
                        <div className="h-6 bg-pink-100/70 rounded-2xl w-1/2" />
                        <div className="space-y-3">
                            <div className="h-4 bg-stone-200/70 rounded-full" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-11/12" />
                            <div className="h-4 bg-stone-200/70 rounded-full w-10/12" />
                        </div>
                        <p className="text-stone-400 font-light text-sm text-center italic pt-4">
                            Preparando Maternidad con Ciencia…
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // 2) Estado de error (con botón "Reintentar")
    // ------------------------------------------------------------------
    if (error || !maternidad) {
        return (
            <div className="animate-fadeIn max-w-4xl mx-auto py-12 relative z-10 text-center">
                <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
                <div className="bg-white/80 backdrop-blur-xl p-10 lg:p-16 rounded-[3rem] border border-white shadow-glass">
                    <Sprout size={64} className="mx-auto text-pink-300 mb-6" />
                    <h2 className="text-3xl font-serif font-bold text-stone-600 mb-4">
                        No pudimos cargar Maternidad con Ciencia
                    </h2>
                    <p className="text-lg text-stone-500 mb-3">
                        Ocurrió un problema al leer el archivo{' '}
                        <code className="bg-stone-100 px-2 py-1 rounded text-sm">premium_maternidad.json</code>.
                    </p>
                    <p className="text-stone-400 font-light text-sm italic mb-8">
                        Verifica tu conexión o que el archivo exista en la raíz del proyecto.
                    </p>
                    <button
                        onClick={cargarMaternidad}
                        className="px-8 py-4 bg-pink-500 text-white rounded-full font-bold text-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all"
                    >
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // 3) Vista principal (idéntica visualmente, ahora con ARIA completo)
    // ------------------------------------------------------------------
    const modulo = maternidad.modulos[activeModulo];

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto py-8 relative z-10">
            <BackButton onClick={onBack} text="Volver a Premium" onHome={onHome} />
            <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-white shadow-glass overflow-hidden">
                {/* Header */}
                <div className="p-8 lg:p-10 border-b border-stone-100 bg-gradient-to-r from-pink-50 to-white flex items-center gap-6">
                    <div className="p-4 bg-pink-100 text-pink-500 rounded-2xl shadow-sm">
                        <Sprout size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800 mb-2">
                            <span className="brush-highlight-pink">{maternidad.titulo}</span>
                        </h2>
                        <p className="text-stone-500 font-light">{maternidad.descripcion}</p>
                    </div>
                </div>

                {/* Tabs (WAI-ARIA compliant) */}
                <div
                    role="tablist"
                    aria-label="Módulos de Maternidad con Ciencia"
                    className="flex overflow-x-auto border-b border-stone-100 bg-white/50 no-scrollbar"
                >
                    {maternidad.modulos.map((m, idx) => {
                        const isActive = activeModulo === idx;
                        return (
                            <button
                                key={idx}
                                ref={el => (tabRefs.current[idx] = el)}
                                role="tab"
                                id={`maternidad-tab-${idx}`}
                                aria-selected={isActive}
                                aria-controls={`maternidad-panel-${idx}`}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => setActiveModulo(idx)}
                                onKeyDown={e => handleTabKeyDown(e, idx)}
                                data-testid={`maternidad-tab-${idx}`}
                                className={`px-6 py-5 font-bold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-inset ${
                                    isActive
                                        ? 'text-pink-500 border-b-4 border-pink-400 bg-white shadow-sm'
                                        : 'text-stone-400 hover:text-stone-600 border-b-4 border-transparent'
                                }`}
                            >
                                {m.titulo}
                            </button>
                        );
                    })}
                </div>

                {/* Panel del módulo activo */}
                <div
                    role="tabpanel"
                    id={`maternidad-panel-${activeModulo}`}
                    aria-labelledby={`maternidad-tab-${activeModulo}`}
                    tabIndex={0}
                    key={activeModulo /* fuerza remount → animación fadeIn al cambiar de tab */}
                    className="p-8 lg:p-14 space-y-12 animate-fadeIn focus:outline-none"
                >
                    {modulo.articulos && modulo.articulos.map((articulo, i) => (
                        <div key={i} className="space-y-6">
                            {articulo.titulo !== 'Introducción' && (
                                <h4 className="text-2xl font-serif font-bold text-pink-600">
                                    {articulo.titulo}
                                </h4>
                            )}
                            <div className="space-y-4 text-stone-600 font-light leading-relaxed text-lg text-justify">
                                {articulo.parrafos.map((p, j) => {
                                    if (p.startsWith('"') && p.endsWith('"')) {
                                        return (
                                            <p
                                                key={j}
                                                className="italic font-medium text-pink-500/90 text-center my-6 text-xl"
                                            >
                                                "{p.replace(/"/g, '')}"
                                            </p>
                                        );
                                    }
                                    return <p key={j}>{p}</p>;
                                })}
                            </div>
                            {i < modulo.articulos.length - 1 && (
                                <hr className="border-pink-100/50 my-10" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};