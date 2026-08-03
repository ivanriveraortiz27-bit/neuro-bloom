// components/UltimaPagina.js
// Experiencia final inmersiva. Fetch de premium_ultima_pagina.json,
// escenas navegables con Continuar/Anterior, respuestas guardadas en
// localStorage y descarga final en .txt.
//
// Icono requerido en 00-base.js: X  (de lucide). Todos los demás son emojis/texto.

const ULTIMA_STORAGE_KEY = 'neuroBloom_ultimaPagina_v1';
const FADE_MS = 1000;

const UltimaPagina = ({ onBack, onHome }) => {
    // ---- Datos ----
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // ---- Flujo ----
    const [sceneIdx, setSceneIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    const [transitioning, setTransitioning] = useState(false);

    // ---- Respuestas ----
    const [respuesta1, setRespuesta1] = useState('');
    const [respuesta2, setRespuesta2] = useState('');

    // ---- Fetch ----
    const cargarUltima = () => {
        setLoading(true);
        setError(false);
        fetch('./premium_ultima_pagina.json')
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error('❌ Error cargando premium_ultima_pagina.json:', err);
                setError(true);
                setLoading(false);
            });
    };

    // ---- Restore respuestas + carga inicial ----
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(ULTIMA_STORAGE_KEY) || '{}');
            if (typeof saved.r1 === 'string') setRespuesta1(saved.r1);
            if (typeof saved.r2 === 'string') setRespuesta2(saved.r2);
        } catch (e) {
            /* ignore */
        }
        cargarUltima();
    }, []);

    // ---- Autosave ----
    useEffect(() => {
        try {
            localStorage.setItem(
                ULTIMA_STORAGE_KEY,
                JSON.stringify({
                    r1: respuesta1,
                    r2: respuesta2,
                    updatedAt: new Date().toISOString()
                })
            );
        } catch (e) {
            /* ignore */
        }
    }, [respuesta1, respuesta2]);

    // ---- Scroll top al cambiar de escena ----
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [sceneIdx]);

    // ---- Navegación ----
    const goToScene = nextIdx => {
        if (transitioning) return;
        setTransitioning(true);
        setVisible(false);
        setTimeout(() => {
            setSceneIdx(nextIdx);
            setVisible(true);
            setTimeout(() => setTransitioning(false), 60);
        }, FADE_MS);
    };
    const handleContinuar = () => goToScene(sceneIdx + 1);
    const handleAnterior = () => sceneIdx > 0 && goToScene(sceneIdx - 1);

    // ---- Descarga en .txt ----
    const descargarRespuestas = () => {
        if (!data) return;
        const fecha = new Date().toLocaleDateString('es', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const content = `Mi Última Página — Neuro Bloom
${fecha}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pregunta 1
${data.pregunta_1}

Mi respuesta:
${respuesta1.trim() || '(reflexioné en silencio)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pregunta 2
${data.pregunta_2}

Mi respuesta:
${respuesta2.trim() || '(reflexioné en silencio)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"La mayoría de las personas creen que el cambio ocurre cuando encuentran respuestas.
Nosotros creemos que comienza cuando, por primera vez, se atreven a formular la pregunta correcta."

— Neuro Bloom
`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mi-ultima-pagina.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ---- Estilos base ----
    const pastelBg =
        'linear-gradient(135deg, #FFF7F4 0%, #FDF4FA 45%, #F4F0FF 100%)';
    const softFont =
        '"Figtree", "Fredoka", ui-sans-serif, system-ui, sans-serif';

    // =============================================================
    // Skeleton
    // =============================================================
    if (loading) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-6"
                style={{ background: pastelBg, fontFamily: softFont }}
            >
                <div className="w-full max-w-2xl animate-pulse space-y-6 text-center">
                    <div className="mx-auto w-20 h-20 bg-white/60 rounded-full" />
                    <div className="h-10 bg-white/60 rounded-2xl mx-auto max-w-md" />
                    <div className="space-y-3 max-w-lg mx-auto">
                        <div className="h-3 bg-white/60 rounded-full" />
                        <div className="h-3 bg-white/60 rounded-full w-11/12 mx-auto" />
                        <div className="h-3 bg-white/60 rounded-full w-10/12 mx-auto" />
                    </div>
                    <p className="text-stone-500 italic pt-4 font-light">
                        Preparando La Última Página…
                    </p>
                </div>
            </div>
        );
    }

    // =============================================================
    // Error
    // =============================================================
    if (error || !data) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-6"
                style={{ background: pastelBg, fontFamily: softFont }}
            >
                <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl text-center space-y-6">
                    <p className="text-5xl">🌸</p>
                    <h2 className="text-2xl font-medium text-stone-700">
                        No pudimos abrir La Última Página
                    </h2>
                    <p className="text-stone-500 font-light">
                        Ocurrió un problema al leer el archivo{' '}
                        <code className="bg-stone-100 px-2 py-1 rounded text-sm">
                            premium_ultima_pagina.json
                        </code>
                        .
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <button
                            onClick={cargarUltima}
                            className="px-8 py-3 bg-brand-purple text-white rounded-full font-medium shadow-md hover:shadow-xl transition-all"
                        >
                            🔄 Reintentar
                        </button>
                        <button
                            onClick={onBack}
                            className="px-8 py-3 bg-white border border-stone-200 text-stone-600 rounded-full font-medium hover:bg-stone-50 transition-all"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =============================================================
    // Escenas
    // =============================================================
    const scenes = [
        { key: 'portal' },
        { key: 'lines', lines: data.intro_previa },
        { key: 'lines', lines: data.mensaje_1 },
        {
            key: 'pregunta',
            question: data.pregunta_1,
            value: respuesta1,
            setValue: setRespuesta1,
            hint: 'Escribe con calma, sin filtros. Esto es solo para ti.'
        },
        { key: 'lines', lines: data.observacion_1 },
        { key: 'lines', lines: data.mensaje_2 },
        {
            key: 'pregunta',
            question: data.pregunta_2,
            value: respuesta2,
            setValue: setRespuesta2,
            hint:
                'Toma tu tiempo. Puede ser una edad, una escena, una emoción. Solo escribe lo que llegue.'
        },
        { key: 'lines', lines: data.cierre },
        { key: 'despedida', block: data.despedida },
        { key: 'teaser', block: data.teaser },
        { key: 'resumen' }
    ];

    const totalScenes = scenes.length;
    const scene = scenes[sceneIdx];
    const isFirstScene = sceneIdx === 0;

    // ---- Renderer de cada escena ----
    const renderScene = () => {
        switch (scene.key) {
            case 'portal':
                return (
                    <div className="text-center space-y-8">
                        <p className="text-5xl">🌸</p>
                        <h1
                            className="text-5xl sm:text-6xl text-stone-800 tracking-tight leading-tight"
                            style={{ fontFamily: softFont, fontWeight: 500 }}
                        >
                            {data.titulo}
                        </h1>
                        <p className="text-lg text-stone-500 max-w-lg mx-auto font-light leading-relaxed">
                            Una experiencia final para reflexionar sobre tu recorrido.
                            Necesitarás unos 10 minutos y un espacio tranquilo.
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={handleContinuar}
                                data-testid="ultima-comenzar-btn"
                                className="px-10 py-4 bg-stone-800 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                            >
                                Estoy listo(a)
                            </button>
                        </div>
                        <p className="text-xs text-stone-400 pt-2 font-light">
                            Puedes pausar en cualquier momento. Tus respuestas se guardan
                            automáticamente.
                        </p>
                    </div>
                );

            case 'lines':
                return (
                    <div className="space-y-5">
                        {scene.lines.map((line, i) => (
                            <p
                                key={i}
                                className="text-stone-700 leading-relaxed"
                                style={{
                                    fontSize: line.length < 40 ? '1.5rem' : '1.2rem',
                                    fontWeight: 300,
                                    letterSpacing: '0.01em'
                                }}
                            >
                                {line}
                            </p>
                        ))}
                    </div>
                );

            case 'pregunta':
                return (
                    <div className="space-y-8">
                        <p className="text-sm uppercase tracking-widest text-brand-purple/70 font-medium">
                            Una pregunta
                        </p>
                        <h2
                            className="text-3xl sm:text-4xl text-stone-800 leading-snug"
                            style={{ fontFamily: softFont, fontWeight: 400 }}
                        >
                            {scene.question}
                        </h2>
                        <div className="pt-2">
                            <textarea
                                value={scene.value}
                                onChange={e => scene.setValue(e.target.value)}
                                placeholder={scene.hint}
                                rows={6}
                                data-testid="ultima-pregunta-input"
                                className="w-full bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 text-lg text-stone-700 font-light placeholder-stone-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-purple/30 resize-none"
                                style={{ fontFamily: softFont }}
                            />
                            <p className="text-xs text-stone-400 mt-2 pl-2 font-light">
                                Se guarda automáticamente. Puedes dejarlo en blanco si
                                prefieres reflexionar en silencio.
                            </p>
                        </div>
                    </div>
                );

            case 'despedida':
                return (
                    <div className="space-y-6">
                        <h2
                            className="text-3xl sm:text-4xl text-stone-800 mb-4"
                            style={{ fontFamily: softFont, fontWeight: 500 }}
                        >
                            {scene.block.titulo}
                        </h2>
                        <div className="space-y-4">
                            {scene.block.parrafos.map((p, i) => (
                                <p
                                    key={i}
                                    className="text-stone-700 leading-relaxed"
                                    style={{
                                        fontSize: p.length < 40 ? '1.3rem' : '1.15rem',
                                        fontWeight: 300
                                    }}
                                >
                                    {p}
                                </p>
                            ))}
                        </div>
                    </div>
                );

            case 'teaser':
                return (
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 border border-white shadow-lg space-y-5">
                        <h2
                            className="text-2xl sm:text-3xl text-stone-800"
                            style={{ fontFamily: softFont, fontWeight: 500 }}
                        >
                            {scene.block.titulo}
                        </h2>
                        <div className="space-y-3">
                            {scene.block.parrafos.map((p, i) => (
                                <p
                                    key={i}
                                    className="text-stone-600 font-light leading-relaxed text-lg"
                                >
                                    {p}
                                </p>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-stone-200/60">
                            <p className="text-brand-purple font-medium italic text-center">
                                {scene.block.disponible}
                            </p>
                        </div>
                    </div>
                );

            case 'resumen':
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-4">
                            <p className="text-5xl">🌸</p>
                            <h2
                                className="text-3xl sm:text-4xl text-stone-800"
                                style={{ fontFamily: softFont, fontWeight: 500 }}
                            >
                                Has completado tu Última Página
                            </h2>
                            <p className="text-stone-500 font-light max-w-lg mx-auto leading-relaxed">
                                Puedes guardar tus respuestas para volver a leerlas más
                                adelante.
                            </p>
                        </div>

                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-md">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-brand-purple/70 font-medium mb-2">
                                    Pregunta 1
                                </p>
                                <p className="text-stone-700 font-light italic mb-3">
                                    {data.pregunta_1}
                                </p>
                                <p className="text-stone-800 whitespace-pre-wrap font-light leading-relaxed">
                                    {respuesta1.trim() || (
                                        <span className="text-stone-400 italic">
                                            Reflexioné en silencio.
                                        </span>
                                    )}
                                </p>
                            </div>
                            <hr className="border-stone-200/60" />
                            <div>
                                <p className="text-xs uppercase tracking-widest text-brand-purple/70 font-medium mb-2">
                                    Pregunta 2
                                </p>
                                <p className="text-stone-700 font-light italic mb-3">
                                    {data.pregunta_2}
                                </p>
                                <p className="text-stone-800 whitespace-pre-wrap font-light leading-relaxed">
                                    {respuesta2.trim() || (
                                        <span className="text-stone-400 italic">
                                            Reflexioné en silencio.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <button
                                onClick={descargarRespuestas}
                                data-testid="ultima-descargar-btn"
                                className="px-8 py-4 bg-stone-800 text-white rounded-full font-medium shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                            >
                                ↓ Descargar mi Última Página
                            </button>
                            <button
                                onClick={onHome || onBack}
                                data-testid="ultima-cerrar-btn"
                                className="px-8 py-4 bg-white border border-stone-200 text-stone-600 rounded-full font-medium hover:bg-stone-50 transition-all"
                            >
                                Volver a Neuro Bloom
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // =============================================================
    // Render principal
    // =============================================================
    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{ background: pastelBg, fontFamily: softFont }}
            data-testid="ultima-pagina"
        >
            {/* Barra superior: salir + progreso */}
            <div className="sticky top-0 left-0 right-0 flex items-center justify-between px-6 py-5 z-10 backdrop-blur-sm bg-white/10">
                <button
                    onClick={onBack}
                    className="text-stone-400 hover:text-stone-700 flex items-center gap-2 text-sm font-medium transition-colors"
                    aria-label="Salir de la experiencia"
                    data-testid="ultima-salir-btn"
                >
                    <X size={18} /> Salir
                </button>

                <div
                    className="flex gap-1.5 items-center"
                    role="progressbar"
                    aria-valuenow={sceneIdx + 1}
                    aria-valuemin={1}
                    aria-valuemax={totalScenes}
                    aria-label={`Escena ${sceneIdx + 1} de ${totalScenes}`}
                >
                    {scenes.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${
                                i < sceneIdx
                                    ? 'bg-brand-purple/40 w-2'
                                    : i === sceneIdx
                                    ? 'bg-brand-purple w-8'
                                    : 'bg-stone-300/60 w-2'
                            }`}
                        />
                    ))}
                </div>

                <div className="w-16" />
            </div>

            {/* Escena principal */}
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-10 sm:py-16">
                <div
                    className={`w-full max-w-2xl ease-out ${
                        visible ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                        transition: `opacity ${FADE_MS}ms ease-out`
                    }}
                    key={sceneIdx}
                >
                    {renderScene()}

                    {/* Controles: solo en escenas intermedias (no en portal ni resumen) */}
                    {scene.key !== 'portal' && scene.key !== 'resumen' && (
                        <div className="mt-14 flex items-center justify-between gap-4">
                            <button
                                onClick={handleAnterior}
                                disabled={isFirstScene || transitioning}
                                data-testid="ultima-anterior-btn"
                                className="text-stone-400 hover:text-stone-700 font-medium text-sm disabled:opacity-0 disabled:pointer-events-none transition-colors"
                            >
                                &larr; Anterior
                            </button>
                            <button
                                onClick={handleContinuar}
                                disabled={transitioning}
                                data-testid="ultima-continuar-btn"
                                className="px-10 py-4 bg-stone-800 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-wait"
                            >
                                Continuar &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};