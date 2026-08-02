const RetoPremium = ({ premiumData, onBack, onHome }) => {
    const reto = premiumData.reto_premium;
    const [step, setStep] = useState(0); 

    if (!reto) return null;

    return (
        <div className="animate-fadeIn max-w-3xl mx-auto py-12 relative z-10 text-center">
            <div className="text-left">
                <BackButton onClick={onBack} text="Volver al Balance" onHome={onHome} />
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-10 lg:p-16 rounded-[3rem] border border-white shadow-glass">
                <Star size={48} className="mx-auto text-yellow-500 mb-6" fill="currentColor" />
                
                {step === 0 && (
                    <div className="animate-fadeIn space-y-6">
                        <h2 className="text-4xl font-serif font-bold text-stone-800 mb-8"><span className="brush-highlight-yellow">{reto.titulo}</span></h2>
                        {reto.intro.map((p, i) => <p key={i} className="text-xl text-stone-600 font-light leading-relaxed">{p}</p>)}
                        <button onClick={() => setStep(1)} className="mt-8 px-8 py-4 bg-stone-800 text-white rounded-full font-bold text-lg shadow-lg hover:-translate-y-1 transition-transform">Continuar</button>
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-fadeIn space-y-6 text-left">
                        {reto.desarrollo.map((p, i) => <p key={i} className="text-lg text-stone-700 font-light leading-relaxed">{p}</p>)}
                        <div className="bg-brand-purple/5 p-8 rounded-2xl border border-brand-purple/20 my-8">
                            <h3 className="text-2xl font-serif font-bold text-brand-purple mb-4">{reto.pregunta_1}</h3>
                            <textarea className="w-full bg-white border border-stone-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 resize-none" placeholder="Escribe aquí con total honestidad..."></textarea>
                        </div>
                        <div className="text-center">
                            <button onClick={() => setStep(2)} className="px-8 py-4 bg-brand-purple text-white rounded-full font-bold text-lg shadow-lg hover:-translate-y-1 transition-transform">Siguiente</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fadeIn space-y-6 text-left">
                        {reto.reflexion_1.map((p, i) => <p key={i} className="text-lg text-stone-700 font-light leading-relaxed">{p}</p>)}
                        <div className="my-8 border-t border-b border-stone-100 py-8 space-y-6">
                            {reto.transicion.map((p, i) => <p key={i} className="text-lg text-stone-700 font-light leading-relaxed">{p}</p>)}
                        </div>
                        <div className="bg-brand-green/10 p-8 rounded-2xl border border-brand-green/20 my-8">
                            <h3 className="text-2xl font-serif font-bold text-brand-green mb-4">{reto.pregunta_2}</h3>
                            <textarea className="w-full bg-white border border-stone-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none" placeholder="Tómate tu tiempo para recordar..."></textarea>
                        </div>
                        <div className="text-center">
                            <button onClick={() => setStep(3)} className="px-8 py-4 bg-brand-green text-white rounded-full font-bold text-lg shadow-lg hover:-translate-y-1 transition-transform">Finalizar Reflexión</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fadeIn space-y-6 text-left">
                        <div className="space-y-6 mb-12">
                            {reto.cierre.map((p, i) => <p key={i} className="text-lg text-stone-700 font-bold leading-relaxed">{p}</p>)}
                        </div>
                        <hr className="border-stone-200 mb-12" />
                        <div className="space-y-6">
                            {reto.despedida.map((p, i) => <p key={i} className="text-lg text-stone-600 font-light leading-relaxed">{p}</p>)}
                        </div>
                        <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 mt-12">
                            <p className="text-stone-500 font-light whitespace-pre-line italic">{reto.teaser_proximo}</p>
                        </div>
                        <div className="text-center mt-12">
                            <button onClick={onBack} className="px-8 py-4 bg-stone-800 text-white rounded-full font-bold text-lg shadow-lg hover:-translate-y-1 transition-transform">Cerrar Reto</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};