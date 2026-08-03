// components/PanelPsicologo.js

const PanelPsicologo = ({ onBack, psicologoId }) => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Consultamos únicamente las citas del especialista actual
        const unsubscribe = db.collection('citas')
            .where('especialistaId', '==', psicologoId)
            .onSnapshot((snapshot) => {
                const citasData = [];
                snapshot.forEach((doc) => {
                    citasData.push({ id: doc.id, ...doc.data() });
                });
                citasData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setCitas(citasData);
                setLoading(false);
            }, (error) => {
                console.error("Error al cargar citas del psicólogo:", error);
                setLoading(false);
            });

        return () => unsubscribe();
    }, [psicologoId]);

    const cambiarEstadoCita = async (citaId, nuevoEstado) => {
        try {
            await db.collection('citas').doc(citaId).update({ estado: nuevoEstado });
        } catch (err) {
            console.error("Error al actualizar estado:", err);
            alert("No se pudo actualizar el estado de la cita. Verifica tus permisos.");
        }
    };

    // Función para dar formato al nombre del especialista basándonos en su ID
    const formatName = (id) => {
        if (!id) return '';
        return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="animate-fadeIn max-w-5xl mx-auto py-8 relative z-10">
            <BackButton onClick={onBack} text="Volver al Inicio" />
            <div className="bg-white/90 backdrop-blur-xl p-8 lg:p-12 rounded-[2.5rem] border border-white shadow-glass">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-stone-200/50 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full text-white shadow-md bg-brand-green">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-stone-800">Mi Agenda de Citas</h2>
                            <p className="text-stone-500 font-light text-sm mt-1">Pacientes que han confirmado su pago y esperan ser contactados.</p>
                        </div>
                    </div>
                    <div className="bg-stone-50 px-4 py-2 rounded-xl border border-stone-100">
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Sesión actual</p>
                        <p className="text-brand-green font-bold">{formatName(psicologoId)}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-brand-green flex flex-col items-center">
                        <Loader size={36} className="animate-spin mb-2" />
                        <p>Cargando tu agenda...</p>
                    </div>
                ) : citas.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100 shadow-inner">
                        <p className="text-stone-500 font-light text-lg">No tienes citas agendadas por el momento.</p>
                        <p className="text-stone-400 font-light text-sm mt-2">Las nuevas confirmaciones de pago aparecerán aquí automáticamente.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {citas.map((cita) => (
                            <div key={cita.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all">
                                <div>
                                    <p className="font-bold text-stone-800 text-xl">{cita.pacienteEmail}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-stone-500">
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {cita.createdAt?.toDate ? cita.createdAt.toDate().toLocaleDateString('es-MX') : 'Fecha reciente'}</span>
                                        <span className="flex items-center gap-1"><Activity size={12}/> {cita.createdAt?.toDate ? cita.createdAt.toDate().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                                    <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-center w-full sm:w-auto ${
                                        cita.estado === 'atendida' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {cita.estado || 'pendiente'}
                                    </span>
                                    
                                    {cita.estado !== 'atendida' ? (
                                        <button 
                                            onClick={() => cambiarEstadoCita(cita.id, 'atendida')}
                                            className="px-6 py-2 bg-brand-green text-white rounded-full font-bold text-xs shadow-sm hover:shadow-md transition-all w-full sm:w-auto flex justify-center items-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Marcar Atendida
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => cambiarEstadoCita(cita.id, 'pendiente')}
                                            className="px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200 rounded-full font-bold text-xs transition-all w-full sm:w-auto flex justify-center items-center gap-2"
                                        >
                                            Revertir a Pendiente
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};