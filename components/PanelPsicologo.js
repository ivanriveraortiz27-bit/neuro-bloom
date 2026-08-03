// components/PanelPsicologo.js

const PanelPsicologo = ({ onBack, psicologoId }) => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Escuchamos en tiempo real las citas en Firestore asignadas a este especialista
        const unsubscribe = db.collection('citas')
            .where('especialistaId', '==', psicologoId)
            .onSnapshot((snapshot) => {
                const citasData = [];
                snapshot.forEach((doc) => {
                    citasData.push({ id: doc.id, ...doc.data() });
                });
                // Ordenar por fecha descendente
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
            alert("No se pudo actualizar el estado de la cita.");
        }
    };

    return (
        <div className="animate-fadeIn max-w-5xl mx-auto py-8 relative z-10">
            <BackButton onClick={onBack} text="Volver" />
            <div className="bg-white/90 backdrop-blur-xl p-8 lg:p-12 rounded-[2.5rem] border border-white shadow-glass">
                <div className="flex items-center gap-4 mb-8 border-b border-stone-200/50 pb-6">
                    <div className="p-3 rounded-full text-white shadow-md bg-brand-green">
                        <Calendar size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-stone-800">Panel de Agenda — Psicología</h2>
                        <p className="text-stone-500 font-light text-sm">Citas agendadas y confirmadas por pacientes.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-brand-green">
                        <Loader size={36} className="mx-auto mb-2" />
                        <p className="text-sm font-light">Cargando agenda...</p>
                    </div>
                ) : citas.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100">
                        <p className="text-stone-500 font-light text-lg">No tienes citas agendadas por el momento.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {citas.map((cita) => (
                            <div key={cita.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
                                <div>
                                    <p className="font-bold text-stone-800 text-lg">{cita.pacienteEmail}</p>
                                    <p className="text-xs text-stone-400 font-mono mt-1">
                                        Fecha de Pago: {cita.createdAt?.toDate ? cita.createdAt.toDate().toLocaleString('es-MX') : 'Reciente'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        cita.estado === 'atendida' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {cita.estado || 'pendiente'}
                                    </span>
                                    {cita.estado !== 'atendida' && (
                                        <button 
                                            onClick={() => cambiarEstadoCita(cita.id, 'atendida')}
                                            className="px-4 py-2 bg-brand-green text-white rounded-full font-bold text-xs shadow-sm hover:shadow-md transition-all"
                                        >
                                            Marcar Atendida
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