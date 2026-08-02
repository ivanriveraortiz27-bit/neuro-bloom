const CuestionarioView = ({ data, onBack }) => {
    const [respuestas, setRespuestas] = useState({});
    const [resultado, setResultado] = useState(null);

    const calcularPuntaje = () => {
        const total = Object.values(respuestas).reduce((a, b) => a + b, 0);
        setResultado(total);
    };

    const obtenerInterpretacion = (puntaje) => {
        let textoResultado = "";
        let advertenciaExtra = "";

        if (data.id === 'depresion-test' && respuestas[12] >= 2) {
            advertenciaExtra = "Importante: Si en la pregunta 13 respondiste 'Frecuentemente' o 'Casi todo el tiempo', es recomendable buscar apoyo profesional lo antes posible, incluso si tu puntaje total no es elevado.";
        }

        for (let int of data.interpretacion) {
            const partes = int.rango.match(/(\d+)\s*[-–]\s*(\d+)/);
            if (partes) {
                const min = parseInt(partes[1], 10);
                const max = parseInt(partes[2], 10);
                if (puntaje >= min && puntaje <= max) {
                    textoResultado = int.texto;
                    break;
                }
            }
        }
        if (!textoResultado) textoResultado = "Te sugerimos buscar orientación profesional para analizar tus resultados a detalle.";

        return (
            <div className="space-y-4">
                <p className="text-xl text-stone-700 font-medium leading-relaxed">{textoResultado}</p>
                {advertenciaExtra && (
                    <div className="mt-4 p-4 bg-orange-100 border-l-4 border-orange-500 text-orange-800 rounded-lg text-left">
                        <strong className="block mb-1 text-orange-900">Atención:</strong>
                        {advertenciaExtra}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn bg-white/70 backdrop-blur-xl p-8 lg:p-12 rounded-[2rem] shadow-glass border border-white/60 max-w-4xl mx-auto relative z-10">
            <BackButton onClick={onBack} text="Volver a Cuestionarios" />
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full text-white shadow-md" style={{ backgroundColor: data.color || colors.primary }}>
                    {getIconComponent(data.icon)}
                </div>
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800" style={{ color: colors.primary }}>
                    <span className="brush-highlight">{data.title}</span>
                </h2>
            </div>
            {data.intro && <p className="text-lg text-stone-600 mb-8 leading-relaxed whitespace-pre-line">{data.intro}</p>}
            <div className="space-y-6">
                {data.preguntas.map((pregunta, idx) => (
                    <div key={idx} className="bg-white/80 p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                        <p className="font-semibold text-stone-800 mb-4 text-lg">{idx + 1}. {pregunta}</p>
                        <div className="flex flex-wrap gap-3">
                            {data.opciones.map((opc, oIdx) => (
                                <button key={oIdx} onClick={() => setRespuestas({...respuestas, [idx]: opc.v})} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${respuestas[idx] === opc.v ? 'bg-white shadow-md scale-105' : 'bg-stone-50/50 border-stone-200 hover:border-stone-300 text-stone-500 hover:bg-white'}`} style={{ borderColor: respuestas[idx] === opc.v ? (data.color || colors.primary) : '', color: respuestas[idx] === opc.v ? (data.color || colors.primary) : '' }}>
                                    {opc.l}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 text-center">
                <button onClick={calcularPuntaje} disabled={Object.keys(respuestas).length < data.preguntas.length} className="px-10 py-4 rounded-full text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1" style={{ backgroundColor: colors.primary }}>
                    Ver Resultado
                </button>
                {Object.keys(respuestas).length < data.preguntas.length && (
                    <p className="text-stone-400 text-sm mt-3">Responde todas las preguntas para ver tu resultado.</p>
                )}
            </div>
            {resultado !== null && (
                <div className="mt-12 p-8 lg:p-10 rounded-3xl bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 animate-slideIn text-center shadow-inner">
                    <h3 className="text-3xl font-serif font-bold mb-6" style={{ color: colors.primary }}>Tu puntuación total: {resultado}</h3>
                    <div className="mb-8 text-left max-w-2xl mx-auto p-6 bg-white/90 rounded-2xl border border-white shadow-sm">
                        {obtenerInterpretacion(resultado)}
                    </div>
                    <div className="p-6 bg-white/60 rounded-3xl text-stone-600 text-sm shadow-sm border border-white text-left">
                        <p className="font-bold mb-2">Recuerda:</p>
                        <p>Reconocer cómo nos sentimos es el primer paso para cuidar nuestra salud mental. Pedir ayuda profesional también es una forma de autocuidado.</p>
                        <p className="mt-2 italic">Este cuestionario no sustituye una evaluación clínica ni constituye un diagnóstico.</p>
                    </div>
                </div>
            )}
        </div>
    );
};