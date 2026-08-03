// components/NeuroBloom.js

function NeuroBloom() {
    const [activeSection, setActiveSection] = useState('home');
    const [subView, setSubView] = useState(null); 
    const [premiumSubSection, setPremiumSubSection] = useState(null);
    
    const [indTab, setIndTab] = useState('info'); 
    const [balTab, setBalTab] = useState('info'); 
    const [retoTab, setRetoTab] = useState('intro');
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    const [appData, setAppData] = useState(null);
    const [premiumData, setPremiumData] = useState(null);
    const [dataError, setDataError] = useState(false);

    useEffect(() => {
        let unsubscribeSnapshot = null;
        const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                try {
                    await currentUser.getIdToken(true);
                    unsubscribeSnapshot = db.collection('users').doc(currentUser.uid).onSnapshot(async (doc) => {
                        if (!doc.exists) {
                            if (unsubscribeSnapshot) unsubscribeSnapshot();
                            await auth.signOut();
                            setUser(null); setIsPremium(false); setAuthLoading(false);
                            return;
                        }
                        let isUserPremium = doc.data().isPremium === true;
                        const urlParams = new URLSearchParams(window.location.search);
                        if (urlParams.get('payment') === 'success' && !isUserPremium) {
                            await db.collection('users').doc(currentUser.uid).update({ isPremium: true });
                            window.history.replaceState(null, '', window.location.pathname);
                            alert('¡Pago completado con éxito! Ya puedes acceder a Bloom Premium. 🌟');
                            setActiveSection('premium_view');
                            return; 
                        }
                        setUser(currentUser);
                        setIsPremium(isUserPremium);
                        setAuthLoading(false);
                    }, (error) => { console.error("Error al escuchar usuario:", error); setAuthLoading(false); });
                } catch (error) {
                    console.error("Error:", error);
                    await auth.signOut(); setUser(null); setIsPremium(false); setAuthLoading(false);
                }
            } else {
                if (unsubscribeSnapshot) unsubscribeSnapshot();
                setUser(null); setIsPremium(false); setAuthLoading(false);
            }
        });
        return () => { unsubscribeAuth(); if (unsubscribeSnapshot) unsubscribeSnapshot(); };
    }, []);

    useEffect(() => {
        Promise.all([
            fetch('./datos_indicadores.json').then(res => res.json()),
            fetch('./datos_balance.json').then(res => res.json()),
            fetch('./datos_reto.json').then(res => res.json()),
            fetch('./datos_capsulas.json').then(res => res.json()),
            fetch('./datos_especialistas.json').then(res => res.json()),
            fetch('./datos_infancias.json').then(res => res.json()),
            fetch('./datos_library.json').then(res => res.json()),
            fetch('./datos_cuentos.json').then(res => res.json())
        ])
        .then(([indicadores, balance, reto_del_mes, capsulas, especialistas, detras_conducta, bloom_library, cuentos]) => {
            setAppData({
                indicadores,
                balance,
                reto_del_mes,
                capsulas,
                especialistas,
                detras_conducta,
                bloom_library,
                cuentos
            });
        })
        .catch(err => {
            console.error("Error al cargar los datos modulares:", err);
            setDataError(true);
        });
    }, []);

    useEffect(() => {
        if (activeSection === 'premium_view' || premiumSubSection === 'reto') {
            if (!premiumData) {
                fetch('./premium_data.json')
                    .then(res => { if (!res.ok) throw new Error("No premium data"); return res.json(); })
                    .then(data => setPremiumData(data))
                    .catch(err => { console.error("Error cargando premium data", err); });
            }
        }
    }, [activeSection, premiumSubSection, premiumData]);

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeSection, subView, premiumSubSection, retoTab]);
    
    useEffect(() => { 
        setSubView(null); 
        setPremiumSubSection(null);
        setIndTab('info');
        setBalTab('info');
        setRetoTab('intro');
    }, [activeSection]); 

    const handlePremiumClick = (target = null) => {
        if (!user) {
            setShowAuthModal(true);
        } else if (!isPremium) {
            window.open('https://buy.stripe.com/5kQeVc2NH6wJ9EVfM377O00', 'PagoPremium', 'width=500,height=750,left=200,top=100');
        } else {
            if (target === 'reto') {
                setPremiumSubSection('reto');
            } else {
                setActiveSection('premium_view');
                if (target) setPremiumSubSection(target);
            }
        }
    };

    const handleLogout = async () => { await auth.signOut(); setActiveSection('home'); };

    if (dataError) return <div className="loading-screen bg-red-50 text-stone-800 p-8"><h2 className="text-2xl text-red-600 font-bold mb-4 font-serif">Error al cargar datos</h2></div>;
    if (!appData || authLoading) return <div className="loading-screen"><h2 className="loading-title animate-pulse">Despertando Neuro Bloom...</h2></div>;

    const renderContent = () => {
        // --- NAVEGACIÓN A LA ÚLTIMA PÁGINA ---
        if (premiumSubSection === 'ultima') {
            return <UltimaPagina 
                onBack={() => {setPremiumSubSection(null); setActiveSection('balance'); setBalTab('reto');}} 
                onHome={() => setActiveSection('home')} 
            />;
        }

        // --- NAVEGACIÓN AL RETO PREMIUM ---
        if (premiumSubSection === 'reto' && premiumData) {
            return <RetoPremium 
                premiumData={premiumData} 
                onBack={() => {setPremiumSubSection(null); setActiveSection('balance'); setBalTab('reto');}} 
                onHome={() => setActiveSection('home')} 
                onIrUltima={() => setPremiumSubSection('ultima')} 
            />;
        }
        
        switch(activeSection) {
            case 'home':
                return (
                    <div className="animate-fadeIn flex flex-col items-center justify-center text-center py-8 lg:py-16 relative z-10">
                        <img src={logoUrl} alt="Neuro Bloom" className="w-full max-w-lg h-auto mx-auto drop-shadow-md mb-8 animate-breathe" />
                        <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-wide mb-6 text-brand-dark" style={{ color: colors.primary }}>“Habitarte también es una forma de florecer”</h1>
                        <p className="max-w-2xl mb-12 text-lg md:text-xl text-brand-dark/80 leading-relaxed font-light">Un espacio dedicado al bienestar emocional, la creatividad y la conexión humana, floreciendo desde el interior.</p>

                        <div className="flex justify-center mb-16 w-full animate-bounce" style={{animationDuration: '3s'}}>
                            <button onClick={() => handlePremiumClick()} className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full font-bold text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-3 border-2 border-yellow-300">
                                <Star size={28} fill="currentColor" /> Bloom Premium
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl">
                            <div onClick={() => setActiveSection('indicadores')} className="w-full sm:w-[45%] lg:w-[30%] cursor-pointer rounded-[2rem] shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                <Thumbnail src="./indicadores-emocionales.jpeg" alt="Indicadores" className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" fallback={<div className="w-full py-16 bg-white/60 flex items-center justify-center"><Activity size={64} className="text-brand-purple" /></div>} />
                            </div>
                            <div onClick={() => setActiveSection('balance')} className="w-full sm:w-[45%] lg:w-[30%] cursor-pointer rounded-[2rem] shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                <Thumbnail src="./balance-cotidiano.jpeg" alt="Balance" className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" fallback={<div className="w-full py-16 bg-white/60 flex items-center justify-center"><Sun size={64} className="text-blue-400" /></div>} />
                            </div>
                            <div onClick={() => setActiveSection('library')} className="w-full sm:w-[45%] lg:w-[30%] cursor-pointer rounded-[2rem] shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                <Thumbnail src="./bloom-library.jpeg" alt="Library" className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" fallback={<div className="w-full py-16 bg-white/60 flex items-center justify-center"><Library size={64} className="text-brand-lilac" /></div>} />
                            </div>
                            <div onClick={() => setActiveSection('infancias')} className="w-full sm:w-[45%] lg:w-[30%] cursor-pointer rounded-[2rem] shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                <Thumbnail src="./infancias.jpeg" alt="Infancias" className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" fallback={<div className="w-full py-16 bg-white/60 flex items-center justify-center"><Sprout size={64} className="text-pink-400" /></div>} />
                            </div>
                            <div onClick={() => setActiveSection('capsulas')} className="w-full sm:w-[45%] lg:w-[30%] cursor-pointer rounded-[2rem] shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                <Thumbnail src="./capsulas-en-video.jpeg" alt="Cápsulas" className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" fallback={<div className="w-full py-16 bg-white/60 flex items-center justify-center"><PlayCircle size={64} className="text-orange-400" /></div>} />
                            </div>
                            <div onClick={() => setActiveSection('citas')} className="w-full sm:w-[45%] lg:w-[30%] cursor-pointer rounded-[2rem] shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                <Thumbnail src="./conoce-y-agenda.jpeg" alt="Agenda" className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" fallback={<div className="w-full py-16 bg-white/60 flex items-center justify-center"><Calendar size={64} className="text-brand-green" /></div>} />
                            </div>
                        </div>
                    </div>
                );

            case 'indicadores':
                if (subView) {
                    const infoData = appData.indicadores?.informacion?.find(d => d.id === subView);
                    if (infoData) {
                        return (
                            <div className="animate-fadeIn bg-white/80 backdrop-blur-xl p-8 lg:p-14 rounded-[2.5rem] shadow-glass border border-white max-w-4xl mx-auto relative z-10">
                                <BackButton onClick={() => setSubView(null)} text="Volver a Información" />
                                {infoData.imagen && (
                                    <div className="mb-12 w-full flex justify-center bg-white rounded-3xl p-4 sm:p-6 border border-stone-100 shadow-sm">
                                        <img src={infoData.imagen} alt={infoData.title} className="max-w-full rounded-2xl object-contain max-h-[60vh]" />
                                    </div>
                                )}
                                <div className="flex items-center gap-5 mb-10 border-b border-stone-200/50 pb-8">
                                    <div className="p-4 rounded-full text-white shadow-md" style={{ backgroundColor: infoData.color }}>
                                        {getIconComponent(infoData.icon, {size: 32})}
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800" style={{ color: colors.primary }}>
                                        <span className="brush-highlight">{infoData.title}</span>
                                    </h2>
                                </div>
                                <div className="space-y-6 text-lg text-stone-700 leading-relaxed font-light text-justify">
                                    {infoData.contenido.map((parrafo, idx) => {
                                        if(parrafo.includes(':') && parrafo.split(':')[0].length < 50) {
                                            const parts = parrafo.split(':');
                                            return <p key={idx}><strong className="text-stone-800">{parts[0]}:</strong>{parts.slice(1).join(':')}</p>;
                                        }
                                        return <p key={idx}>{parrafo}</p>;
                                    })}
                                </div>
                            </div>
                        );
                    }
                    const testData = appData.indicadores?.cuestionarios?.find(d => d.id === subView);
                    if (testData) return <CuestionarioView data={testData} onBack={() => setSubView(null)} />;
                }
                return (
                    <div className="animate-fadeIn max-w-6xl mx-auto space-y-12 relative z-10">
                        <div className="w-full">
                            <BackButton onClick={() => setActiveSection('home')} text="Volver al Inicio" />
                        </div>
                        <div className="text-center mb-10">
                            <h2 className="text-5xl font-serif font-bold mb-6 text-stone-800" style={{ color: colors.primary }}>
                                <span className="brush-highlight">Indicadores Emocionales</span>
                            </h2>
                            <p className="text-stone-600 max-w-2xl mx-auto text-xl font-light">Infórmate sobre tu salud emocional y realiza ejercicios de autoexploración.</p>
                        </div>
                        
                        <div className="flex justify-center flex-wrap gap-2 sm:gap-4 bg-white/50 backdrop-blur-md p-2 rounded-full shadow-glass border border-white w-fit mx-auto">
                            <button onClick={() => setIndTab('info')} className={`px-8 py-3 rounded-full font-bold transition-all text-lg ${indTab === 'info' ? 'bg-white shadow-sm text-brand-purple' : 'text-stone-500 hover:text-brand-purple'}`}>Información</button>
                            <button onClick={() => setIndTab('test')} className={`px-8 py-3 rounded-full font-bold transition-all text-lg ${indTab === 'test' ? 'bg-white shadow-sm text-brand-purple' : 'text-stone-500 hover:text-brand-purple'}`}>Cuestionarios</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
                            {indTab === 'info' && appData.indicadores?.informacion?.map(item => (
                                <div key={item.id} onClick={() => setSubView(item.id)} className="cursor-pointer bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] shadow-glass border border-white hover:shadow-lg transition-all group flex flex-col hover:-translate-y-1">
                                    <Thumbnail src={item.imagen} alt={item.title} className="w-20 h-20 rounded-2xl object-cover mb-6 shadow-sm group-hover:scale-105 transition-transform border-2 border-white" fallback={<div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform text-white shadow-sm" style={{ backgroundColor: item.color }}>{getIconComponent(item.icon)}</div>} />
                                    <h3 className="text-2xl font-serif font-bold mb-3 text-stone-800 group-hover:text-brand-purple transition-colors">{item.title}</h3>
                                    <p className="text-[15px] text-stone-500 line-clamp-3 flex-grow leading-relaxed font-light">{item.contenido[0]}</p>
                                    <p className="text-sm font-bold text-brand-purple mt-6 tracking-wider uppercase">Leer artículo &rarr;</p>
                                </div>
                            ))}

                            {indTab === 'test' && appData.indicadores?.cuestionarios?.map(item => (
                                <div key={item.id} onClick={() => setSubView(item.id)} className="cursor-pointer bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] shadow-glass border border-white hover:shadow-lg transition-all group flex flex-col hover:-translate-y-1">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform text-white shadow-sm" style={{ backgroundColor: item.color || colors.primary }}>
                                        {getIconComponent(item.icon)}
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold mb-3 text-stone-800 group-hover:text-brand-purple transition-colors">{item.title}</h3>
                                    <p className="text-[15px] text-stone-500 line-clamp-3 flex-grow leading-relaxed font-light">{item.intro || 'Realiza esta evaluación para conocer más sobre ti.'}</p>
                                    <p className="text-sm font-bold text-brand-purple mt-6 tracking-wider uppercase">Realizar test &rarr;</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'balance':
                const renderContenidoTexto = (parrafos, mediaData = {}) => {
                    return parrafos.map((parrafo, idx) => {
                        if (parrafo === '---') return <hr key={idx} className="my-10 border-stone-200" />;
                        if (parrafo === '[AUDIO_RETO]') return null; 
                        
                        if (parrafo.includes('⭐') || parrafo.includes('🔒')) {
                            const textoLimpio = parrafo.replace('⭐', '').replace('🔒', '').trim();
                            return (
                                <button key={idx} onClick={() => handlePremiumClick('reto')} className="w-full py-6 mt-12 rounded-2xl bg-gradient-to-r from-stone-800 to-stone-700 text-white font-bold text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex justify-center items-center gap-3 border border-stone-600 group premium-card-border">
                                    <Lock size={24} className="text-stone-300 group-hover:text-white transition-colors" /> {textoLimpio}
                                </button>
                            );
                        }

                        if (parrafo.match(/^[✨🌸💌☕🌿🗓️✍️🌱🎧💬🤍🧠🎥🎬🪷🌧️🔥💛🚧]/) || parrafo === parrafo.toUpperCase()) {
                            
                            const isVideoHeader = parrafo.includes('🎥');
                            const isAudioHeader = parrafo.includes('🎧');

                            return (
                                <React.Fragment key={idx}>
                                    <h3 className="text-2xl font-serif font-bold text-brand-purple mt-10 mb-4">{parrafo}</h3>
                                    
                                    {isVideoHeader && mediaData.youtube_id && (
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-8 border border-white mt-6">
                                            <iframe className="absolute top-0 left-0 w-full h-full" src={`https://www.youtube.com/embed/${mediaData.youtube_id}`} frameBorder="0" allowFullScreen></iframe>
                                        </div>
                                    )}

                                    {isAudioHeader && mediaData.url && (
                                        <div className="my-8 bg-gradient-to-r from-brand-lilac/20 to-brand-purple/20 p-6 rounded-3xl border border-brand-purple/20 shadow-sm flex flex-col gap-4">
                                            <div className="flex items-center gap-3 text-brand-purple font-bold uppercase tracking-widest text-sm">
                                                <Headphones size={20} /> Audio del Mes
                                            </div>
                                            <div className="bg-white/80 p-4 rounded-2xl border border-brand-purple/20 shadow-inner">
                                                <audio controls className="w-full outline-none">
                                                    <source src={mediaData.url} type="audio/mpeg" />
                                                    Tu navegador no soporta el elemento de audio.
                                                </audio>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        }
                        return <p key={idx}>{parrafo}</p>;
                    });
                };

                return (
                    <div className="animate-fadeIn max-w-5xl mx-auto space-y-8 relative z-10">
                        <BackButton onClick={() => setActiveSection('home')} text="Volver al Inicio" />
                        <div className="text-center mb-10">
                            <h2 className="text-5xl font-serif font-bold mb-6 text-stone-800" style={{ color: colors.primary }}>
                                <span className="brush-highlight">Balance Cotidiano</span>
                            </h2>
                            <p className="text-stone-600 max-w-2xl mx-auto text-xl font-light">Estrategias y retos para construir bienestar emocional paso a paso.</p>
                        </div>

                        <div className="flex justify-center flex-wrap gap-2 sm:gap-4 bg-white/50 backdrop-blur-md p-2 rounded-full shadow-glass border border-white w-fit mx-auto mb-8">
                            <button onClick={() => setBalTab('info')} className={`px-8 py-3 rounded-full font-bold transition-all text-lg ${balTab === 'info' ? 'bg-white shadow-sm text-brand-purple' : 'text-stone-500 hover:text-brand-purple'}`}>Vida en Equilibrio</button>
                            <button onClick={() => setBalTab('reto')} className={`px-8 py-3 rounded-full font-bold transition-all text-lg ${balTab === 'reto' ? 'bg-white shadow-sm text-brand-purple' : 'text-stone-500 hover:text-brand-purple'}`}>Reto del Mes</button>
                        </div>

                        {balTab === 'info' && (
                            <div className="bg-white/80 backdrop-blur-xl p-8 lg:p-14 rounded-[2.5rem] shadow-glass border border-white animate-fadeIn">
                                {appData.balance.imagen && (
                                    <div className="mb-12 w-full flex justify-center bg-white rounded-3xl p-4 sm:p-6 border border-stone-100 shadow-sm">
                                        <img src={appData.balance.imagen} alt="Hábitos Sanos" className="max-w-full rounded-2xl object-contain max-h-[70vh]" />
                                    </div>
                                )}
                                <div className="flex items-center gap-5 mb-10 border-b border-stone-200/50 pb-8">
                                    <div className="p-4 rounded-full text-white shadow-md bg-blue-400">
                                        {getIconComponent(appData.balance.icon, {size: 32})}
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800">{appData.balance.title}</h2>
                                </div>
                                <div className="space-y-6 text-lg text-stone-700 leading-relaxed font-light text-justify">
                                    {renderContenidoTexto(appData.balance.contenido)}
                                </div>
                            </div>
                        )}

                        {balTab === 'reto' && (
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-glass border border-white animate-fadeIn overflow-hidden">
                                <div className="p-8 lg:p-10 border-b border-stone-200/50 flex items-center gap-5">
                                    <div className="p-4 rounded-full text-white shadow-md bg-yellow-400">
                                        <Star size={32} fill="currentColor" />
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800">
                                        <span className="brush-highlight-yellow">Reto del Mes</span>
                                    </h2>
                                </div>

                                <div className="flex overflow-x-auto border-b border-stone-100 bg-stone-50/50 no-scrollbar">
                                    {[
                                        { id: 'intro', label: 'Introducción' },
                                        { id: 'sem1', label: 'Semana 1' },
                                        { id: 'sem2', label: 'Semana 2' },
                                        { id: 'sem3', label: 'Semana 3' },
                                        { id: 'sem4', label: 'Semana 4' },
                                        { id: 'cierre', label: 'Cierre' }
                                    ].map(tab => (
                                        <button 
                                            key={tab.id}
                                            onClick={() => setRetoTab(tab.id)}
                                            className={`px-6 py-4 font-bold whitespace-nowrap transition-colors ${retoTab === tab.id ? 'text-brand-purple border-b-4 border-brand-purple bg-white' : 'text-stone-400 hover:text-brand-purple'}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-8 lg:p-14 space-y-6 text-lg text-stone-700 leading-relaxed font-light text-justify">
                                    {retoTab === 'intro' && (
                                        <div className="animate-fadeIn space-y-6">
                                            {appData.reto_del_mes.youtube_id && (
                                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-8 border border-white">
                                                    <iframe className="absolute top-0 left-0 w-full h-full" src={`https://www.youtube.com/embed/${appData.reto_del_mes.youtube_id}`} frameBorder="0" allowFullScreen></iframe>
                                                </div>
                                            )}
                                            {renderContenidoTexto(appData.reto_del_mes.intro, { url: appData.reto_del_mes.url })}
                                        </div>
                                    )}
                                    
                                    {['sem1', 'sem2', 'sem3', 'sem4'].includes(retoTab) && (() => {
                                        const index = parseInt(retoTab.replace('sem', '')) - 1;
                                        const semanaData = appData.reto_del_mes.semanas[index];
                                        return (
                                            <div className="animate-fadeIn space-y-6">
                                                {renderContenidoTexto(semanaData.contenido, { youtube_id: semanaData.youtube_id })}
                                            </div>
                                        );
                                    })()}

                                    {retoTab === 'cierre' && (
                                        <div className="animate-fadeIn space-y-6">
                                            {renderContenidoTexto(appData.reto_del_mes.cierre)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'library':
                return (
                    <div className="animate-fadeIn max-w-4xl mx-auto py-12 relative z-10">
                        <BackButton onClick={() => setActiveSection('home')} text="Volver al Inicio" />
                        <div className="text-center">
                            <h2 className="text-5xl font-serif font-bold mb-6 text-stone-800">
                                <span className="brush-highlight">Bloom Library</span>
                            </h2>
                            <p className="text-stone-600 mb-12 text-xl font-light">Un espacio para nutrir tu mente y alma a través de recursos, recomendaciones y cuentos terapéuticos.</p>
                            <div className="p-20 bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white shadow-glass flex flex-col items-center justify-center relative z-10">
                                <Library size={100} className="text-brand-lilac mb-8 animate-pulse" />
                                <h3 className="text-3xl font-serif font-bold text-stone-500 mb-4">Próximamente</h3>
                                <p className="text-stone-500 max-w-md mx-auto text-lg font-light">Estamos protegiendo la magia de nuestras historias. El contenido estará disponible una vez finalizado el registro de derechos de autor.</p>
                            </div>
                        </div>
                    </div>
                );

            case 'infancias':
                return (
                    <div className="animate-fadeIn max-w-5xl mx-auto space-y-8 relative z-10">
                        <BackButton onClick={() => setActiveSection('home')} text="Volver al Inicio" />
                        <div className="text-center mb-10">
                            <h2 className="text-5xl font-serif font-bold mb-6 text-stone-800" style={{ color: colors.primary }}>
                                <span className="brush-highlight-pink">Infancias que Florecen</span>
                            </h2>
                            <p className="text-stone-600 max-w-2xl mx-auto text-xl font-light">Desarrollo emocional infantil para comprender antes que juzgar.</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-xl p-8 lg:p-14 rounded-[2.5rem] shadow-glass border border-white animate-fadeIn">
                            <div className="flex items-center gap-5 mb-10 border-b border-stone-200/50 pb-8">
                                <div className="p-4 rounded-full text-white shadow-md bg-pink-400"><Sprout size={32} /></div>
                                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800">{appData.detras_conducta?.title || "🪷 Detrás de su conducta"}</h2>
                            </div>
                            <div className="space-y-6 text-lg text-stone-700 leading-relaxed font-light text-justify">
                                {appData.detras_conducta?.contenido.map((parrafo, idx) => {
                                    if (parrafo === '---') return <hr key={idx} className="my-10 border-stone-200" />;
                                    if (parrafo.match(/^[✨🌸💌☕🌿🗓️✍️🌱🎧💬🤍🧠🎥🎬🪷🌧️🔥💛🚧]/) || parrafo === parrafo.toUpperCase()) {
                                        return <h3 key={idx} className="text-2xl font-serif font-bold text-brand-purple mt-10 mb-4">{parrafo}</h3>;
                                    }
                                    return <p key={idx}>{parrafo}</p>;
                                })}
                            </div>
                        </div>
                    </div>
                );

            case 'capsulas':
                if (subView) {
                    const capsulaData = appData.capsulas?.find(c => c.id === subView);
                    if (capsulaData) {
                        return (
                            <div className="animate-fadeIn bg-white/80 backdrop-blur-xl p-8 lg:p-14 rounded-[2.5rem] shadow-glass border border-white max-w-4xl mx-auto relative z-10">
                                <BackButton onClick={() => setSubView(null)} text="Volver a Cápsulas" />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 rounded-full text-white shadow-md bg-orange-400">
                                        <PlayCircle size={32} />
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800">
                                        <span className="brush-highlight-yellow">{capsulaData.title}</span>
                                    </h2>
                                </div>
                                
                                {capsulaData.youtube_id && (
                                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-10 border border-white">
                                        <iframe 
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={`https://www.youtube.com/embed/${capsulaData.youtube_id}`} 
                                            title="YouTube video player" 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen>
                                        </iframe>
                                    </div>
                                )}

                                <div className="space-y-6 text-lg text-stone-700 leading-relaxed font-light text-justify">
                                    {capsulaData.guion.map((parrafo, idx) => <p key={idx}>{parrafo}</p>)}
                                </div>
                            </div>
                        );
                    }
                }
                return (
                    <div className="animate-fadeIn max-w-6xl mx-auto space-y-12 relative z-10">
                        <div className="w-full">
                            <BackButton onClick={() => setActiveSection('home')} text="Volver al Inicio" />
                        </div>
                        <div className="text-center mb-10">
                            <h2 className="text-5xl font-serif font-bold mb-6 text-stone-800">
                                <span className="brush-highlight-yellow">Cápsulas en Video</span>
                            </h2>
                            <p className="text-stone-600 max-w-2xl mx-auto text-xl font-light">Reflexiones y guías audiovisuales de Neuro Bloom.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
                            {appData.capsulas?.map(item => (
                                <div key={item.id} onClick={() => setSubView(item.id)} className="cursor-pointer bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] shadow-glass border border-white hover:shadow-lg transition-all group flex flex-col hover:-translate-y-1">
                                    {item.imagen ? (
                                        <Thumbnail src={item.imagen} alt={item.title} className="w-full aspect-video rounded-2xl object-cover mb-6 shadow-sm group-hover:scale-105 transition-transform border-2 border-white" fallback={<div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform text-white shadow-sm bg-orange-400"><PlayCircle size={32} /></div>} />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform text-white shadow-sm bg-orange-400">
                                            <PlayCircle size={32} />
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-serif font-bold mb-3 text-stone-800 group-hover:text-orange-500 transition-colors">{item.title}</h3>
                                    <p className="text-[15px] text-stone-500 line-clamp-3 flex-grow leading-relaxed font-light">{item.guion[0]}</p>
                                    <p className="text-sm font-bold text-orange-500 mt-6 tracking-wider uppercase flex items-center gap-2">
                                        {item.youtube_id ? <><PlayCircle size={16}/> Ver Video</> : "Leer Guión"} &rarr;
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'citas':
                return (
                    <div className="animate-fadeIn max-w-5xl mx-auto space-y-12 relative z-10">
                        <BackButton onClick={() => setActiveSection('home')} text="Volver al Inicio" />
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-serif font-bold mb-6 text-stone-800">
                                <span className="brush-highlight-green">Conoce y Agenda Cita</span>
                            </h2>
                            <p className="text-stone-600 max-w-2xl mx-auto text-xl font-light">Inicia tu proceso de bienestar emocional. Conoce a nuestros especialistas y reserva tu espacio seguro con nosotros.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-10 relative z-10">
                            {appData.especialistas?.map(esp => (
                                <div key={esp.id} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-glass border border-white overflow-hidden flex flex-col hover:shadow-xl transition-all group">
                                    <div className="w-full h-80 bg-stone-50 overflow-hidden relative border-b border-white">
                                        <Thumbnail src={esp.imagen} alt={esp.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" fallback={<Activity size={80} className="text-stone-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />} />
                                    </div>
                                    <div className="p-10 flex flex-col flex-grow">
                                        <h3 className="text-3xl font-serif font-bold text-stone-800 mb-2">{esp.nombre}</h3>
                                        <p className="text-brand-green font-bold text-lg mb-3">{esp.titulo}</p>
                                        {esp.cedula && <p className="text-sm text-stone-400 mb-5 font-mono">Cédula: {esp.cedula}</p>}
                                        <p className="text-stone-600 text-[15px] mb-8 italic font-light leading-relaxed">{esp.descripcion}</p>
                                        <div className="mb-10 flex-grow">
                                            <h4 className="font-bold text-sm text-stone-800 mb-4 uppercase tracking-widest border-b border-stone-200 pb-2">Especialidades y Enfoque</h4>
                                            <ul className="space-y-3">
                                                {esp.enfoques.map((enfoque, i) => (
                                                    <li key={i} className="text-[15px] text-stone-600 flex items-start gap-3 font-light">
                                                        <span className="text-brand-green mt-1"><Heart size={16} fill="currentColor" /></span>
                                                        <span className="leading-tight">{enfoque}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <button className="w-full py-4 rounded-full text-white font-bold text-lg shadow-md hover:-translate-y-1 hover:shadow-lg transition-all flex justify-center items-center gap-3 bg-brand-green">
                                            <Calendar size={20} /> Agendar Cita
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'premium_view':
                if (!premiumData) {
                    return <div className="text-center py-20 text-brand-purple"><Loader size={48} className="animate-spin mx-auto mb-4" /> Cargando entorno Premium...</div>;
                }

                if (premiumSubSection === 'perfil') return <PerfilEmocional premiumData={premiumData} onBack={() => setPremiumSubSection(null)} onHome={() => setActiveSection('home')} />;
                if (premiumSubSection === 'rutas') return <RutasBienestar premiumData={premiumData} onBack={() => setPremiumSubSection(null)} onHome={() => setActiveSection('home')} />;
                if (premiumSubSection === 'maternidad') return <MaternidadView premiumData={premiumData} onBack={() => setPremiumSubSection(null)} onHome={() => setActiveSection('home')} />;

                return (
                    <div className="animate-fadeIn max-w-6xl mx-auto py-8 lg:py-12 relative z-10">
                        <div className="w-full mb-8">
                            <BackButton onClick={() => setActiveSection('home')} text="Volver al Inicio" />
                        </div>
                        
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full shadow-lg mb-6">
                                <Star size={40} className="text-yellow-600" fill="currentColor" />
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800 mb-4"><span className="brush-highlight-yellow">Tu Espacio Premium</span></h2>
                            <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
                                Bienvenido a la zona reservada. Aquí encontrarás herramientas profundas de autoexploración y crecimiento guiado.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 max-w-5xl mx-auto">
                            
                            <button onClick={() => setPremiumSubSection('perfil')} className="group bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-glass hover:shadow-xl transition-all transform hover:-translate-y-2 text-left flex flex-col h-full premium-card-border">
                                <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Brain size={32} /></div>
                                <h3 className="text-2xl font-serif font-bold text-stone-800 mb-3">Conoce tu Perfil Emocional</h3>
                                <p className="text-stone-500 font-light flex-grow leading-relaxed">Evalúa 7 dimensiones clave de tu bienestar y obtén una ruta personalizada.</p>
                                <div className="mt-8 flex items-center text-brand-purple font-bold text-sm tracking-widest uppercase">Comenzar Test &rarr;</div>
                            </button>

                            <button onClick={() => setPremiumSubSection('rutas')} className="group bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-glass hover:shadow-xl transition-all transform hover:-translate-y-2 text-left flex flex-col h-full premium-card-border">
                                <div className="w-16 h-16 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Compass size={32} /></div>
                                <h3 className="text-2xl font-serif font-bold text-stone-800 mb-3">Rutas de Bienestar</h3>
                                <p className="text-stone-500 font-light flex-grow leading-relaxed">7 programas guiados por módulos. Desde regular tu sistema nervioso hasta fortalecer tu autoestima y propósito.</p>
                                <div className="mt-8 flex items-center text-brand-green font-bold text-sm tracking-widest uppercase">Explorar Rutas &rarr;</div>
                            </button>

                            <button onClick={() => setPremiumSubSection('maternidad')} className="group bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-glass hover:shadow-xl transition-all transform hover:-translate-y-2 text-left flex flex-col h-full premium-card-border">
                                <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Sprout size={32} /></div>
                                <h3 className="text-2xl font-serif font-bold text-stone-800 mb-3">Maternidad con Ciencia</h3>
                                <p className="text-stone-500 font-light flex-grow leading-relaxed">Entiende el cerebro de mamá, el cerebro infantil y descubre herramientas de crianza basadas en la evidencia.</p>
                                <div className="mt-8 flex items-center text-pink-500 font-bold text-sm tracking-widest uppercase">Leer Módulos &rarr;</div>
                            </button>

                        </div>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="min-h-screen font-sans relative overflow-hidden text-stone-700 bg-[#faf8f9]">
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Manchas Orgánicas */}
                <div className="absolute top-[-10%] left-[-10%] w-[45rem] h-[45rem] bg-[#fdf2f8] animate-organic-blob mix-blend-multiply filter blur-2xl opacity-70"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-[#f3e8ff] animate-organic-blob animation-delay-2000 mix-blend-multiply filter blur-2xl opacity-70"></div>
                <div className="absolute bottom-[-10%] left-[15%] w-[40rem] h-[40rem] bg-[#fff7ed] animate-organic-blob animation-delay-4000 mix-blend-multiply filter blur-2xl opacity-70"></div>
                
                {/* Formas sutiles flotantes */}
                <div className="absolute top-[15%] left-[5%] w-48 h-48 bg-pink-300/10 rounded-full animate-float-slow blur-xl"></div>
                <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-brand-green/10 rounded-full animate-float-slow animation-delay-2000 blur-xl"></div>
                <div className="absolute top-[60%] left-[80%] w-32 h-32 bg-yellow-400/10 rounded-full animate-float-slow animation-delay-4000 blur-xl"></div>
            </div>

            <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-xl shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="cursor-pointer hover:opacity-80 transition-opacity h-full py-3" onClick={() => setActiveSection('home')}>
                        <Logo className="h-full" />
                    </div>

                    <nav className="hidden lg:flex gap-2 relative z-50">
                        <NavButton active={activeSection === 'home'} onClick={() => setActiveSection('home')} icon={<Heart />}>Inicio</NavButton>
                        <NavButton active={activeSection === 'indicadores'} onClick={() => setActiveSection('indicadores')} icon={<Activity />}>Indicadores</NavButton>
                        <NavButton active={activeSection === 'balance'} onClick={() => setActiveSection('balance')} icon={<Sun />}>Balance</NavButton>
                        <NavButton active={activeSection === 'library'} onClick={() => setActiveSection('library')} icon={<Library />}>Library</NavButton>
                        <NavButton active={activeSection === 'infancias'} onClick={() => setActiveSection('infancias')} icon={<Sprout />}>Infancias</NavButton>
                        <NavButton active={activeSection === 'capsulas'} onClick={() => setActiveSection('capsulas')} icon={<PlayCircle />}>Cápsulas</NavButton>
                        <NavButton active={activeSection === 'citas'} onClick={() => setActiveSection('citas')} icon={<Calendar />}>Agenda</NavButton>
                    </nav>

                    <div className="flex items-center gap-4 relative z-50">
                        {user ? (
                            <button onClick={handleLogout} className="hidden sm:flex text-sm font-bold text-stone-500 hover:text-brand-purple transition-colors items-center gap-2">
                                <UserCircle size={20} /> Cerrar Sesión
                            </button>
                        ) : (
                            <button onClick={() => setShowAuthModal(true)} className="hidden sm:flex px-4 py-2 bg-white/50 border border-brand-purple/30 rounded-full text-sm font-bold text-brand-purple hover:bg-brand-purple hover:text-white transition-all items-center gap-2">
                                <UserCircle size={18} /> Ingresar
                            </button>
                        )}
                        <button className="lg:hidden p-2 text-brand-purple" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
                        </button>
                    </div>
                </div>
            </header>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 pt-28 px-6 lg:hidden animate-slideIn bg-white/95 backdrop-blur-3xl">
                    <div className="flex flex-col gap-4">
                        <div className="mb-4 pb-4 border-b border-stone-200">
                            {user ? (
                                <button onClick={() => {handleLogout(); setMobileMenuOpen(false);}} className="w-full text-left p-5 rounded-2xl font-bold text-xl text-stone-500 bg-stone-100 flex items-center gap-3">
                                    <UserCircle size={24} /> Cerrar Sesión
                                </button>
                            ) : (
                                <button onClick={() => {setShowAuthModal(true); setMobileMenuOpen(false);}} className="w-full text-left p-5 rounded-2xl font-bold text-xl text-white bg-brand-purple shadow-md flex items-center gap-3">
                                    <UserCircle size={24} /> Iniciar Sesión / Registro
                                </button>
                            )}
                        </div>
                        {['home', 'indicadores', 'balance', 'library', 'infancias', 'capsulas', 'citas'].map(sec => (
                            <button 
                                key={sec}
                                onClick={() => { setActiveSection(sec); setMobileMenuOpen(false); }}
                                className="text-left p-5 rounded-2xl font-bold text-xl border border-white/50 shadow-sm"
                                style={{ 
                                    color: activeSection === sec ? colors.white : colors.primary,
                                    backgroundColor: activeSection === sec ? colors.primary : 'rgba(255,255,255,0.8)'
                                }}
                            >
                                {sec === 'library' ? 'Bloom Library' : sec === 'infancias' ? 'Infancias que Florecen' : sec === 'citas' ? 'Agenda' : sec.charAt(0).toUpperCase() + sec.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-6 py-12 min-h-[80vh] relative z-10">
                {renderContent()}
            </main>

            <footer className="py-16 mt-12 bg-stone-900/95 backdrop-blur-md text-stone-400 flex flex-col items-center justify-center text-center relative z-10">
                <img 
                    src={logoUrl} 
                    alt="Neuro Bloom Logo Blanco" 
                    className="h-16 w-auto mb-6 opacity-50 brightness-0 invert" 
                />
                <p className="font-light tracking-wide relative z-20">© {new Date().getFullYear()} Neuro Bloom. Creciendo con cada emoción.</p>
            </footer>
        </div>
    );
}

// Renderizado final de la app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<NeuroBloom />);