// components/PanelAdmin.js

const PanelAdmin = ({ onBack }) => {
    const [citas, setCitas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [tab, setTab] = useState('citas');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar todas las citas ordenadas por la fecha más reciente
        const unsubCitas = db.collection('citas').onSnapshot((snapshot) => {
            const data = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setCitas(data);
            setLoading(false);
        });

        // Cargar todos los usuarios para la gestión de roles
        const unsubUsers = db.collection('users').onSnapshot((snapshot) => {
            const data = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            setUsuarios(data);
        });

        return () => { unsubCitas(); unsubUsers(); };
    }, []);

    const actualizarRolUsuario = async (userId, nuevoRol) => {
        try {
            await db.collection('users').doc(userId).update({ role: nuevoRol });
            alert(`Rol actualizado a "${nuevoRol}" con éxito.`);
        } catch (err) {
            console.error("Error cambiando rol:", err);
            alert("No se pudo cambiar el rol. Verifica los permisos de Firestore.");
        }
    };

    return (
        <div className="animate-fadeIn max-w-6xl mx-auto py-8 relative z-10">
            <BackButton onClick={onBack} text="Volver al Inicio" />
            <div className="bg-white/90 backdrop-blur-xl p-8 lg:p-12 rounded-[2.5rem] border border-white shadow-glass">
                <div className="flex items-center gap-4 mb-8 border-b border-stone-200/50 pb-6">
                    <div className="p-3 rounded-full text-white shadow-md bg-brand-purple">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-stone-800">Panel de Administración</h2>
                        <p className="text-stone-500 font-light text-sm">Control global de citas y asignación de roles de usuario.</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-8">
                    <button 
                        onClick={() => setTab('citas')} 
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${tab === 'citas' ? 'bg-brand-purple text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                        Todas las Citas ({citas.length})
                    </button>
                    <button 
                        onClick={() => setTab('usuarios')} 
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${tab === 'usuarios' ? 'bg-brand-purple text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                        Gestión de Usuarios ({usuarios.length})
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-brand-purple flex flex-col items-center">
                        <Loader size={36} className="animate-spin mb-2" />
                        <p>Cargando datos del servidor...</p>
                    </div>
                ) : tab === 'citas' ? (
                    <div className="space-y-4">
                        {citas.map((c) => (
                            <div key={c.id} className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-bold text-stone-800 text-lg">{c.pacienteEmail}</p>
                                    <p className="text-sm text-stone-500 mt-1">Especialista: <strong className="text-brand-purple capitalize">{c.especialistaId?.replace('-', ' ')}</strong></p>
                                    <p className="text-xs text-stone-400 font-mono mt-1">ID: {c.id}</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${c.estado === 'atendida' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {c.estado || 'pendiente'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {usuarios.map((u) => (
                            <div key={u.id} className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-bold text-stone-800 text-lg">{u.email}</p>
                                    <p className="text-xs text-stone-400 mt-1">
                                        Estado Premium: <strong className={u.isPremium ? "text-green-500" : "text-stone-400"}>{u.isPremium ? "Activo" : "Inactivo"}</strong>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Asignar Rol</label>
                                    <select 
                                        value={u.role || 'paciente'} 
                                        onChange={(e) => actualizarRolUsuario(u.id, e.target.value)}
                                        className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 bg-stone-50 outline-none focus:ring-2 focus:border-brand-purple cursor-pointer"
                                    >
                                        <option value="paciente">Paciente (Por defecto)</option>
                                        <option value="feler-munoz">Psicólogo: Féler Muñoz</option>
                                        <option value="fernanda-regalado">Psicólogo: Fernanda Regalado</option>
                                        <option value="admin">Administrador General</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};