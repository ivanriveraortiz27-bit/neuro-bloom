// components/PanelAdmin.js

const PanelAdmin = ({ onBack }) => {
    const [citas, setCitas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    
    // Estados de Contenido
    const [capsulas, setCapsulas] = useState([]);
    const [retoActual, setRetoActual] = useState(null);
    
    // Estados de UI
    const [tab, setTab] = useState('citas');
    const [contentTab, setContentTab] = useState('capsulas'); // 'capsulas' | 'reto'
    const [loading, setLoading] = useState(true);
    
    // Estados de Edición
    const [editingCapsula, setEditingCapsula] = useState(null);
    const [editingReto, setEditingReto] = useState(null);

    useEffect(() => {
        // Cargar citas
        const unsubCitas = db.collection('citas').onSnapshot((snapshot) => {
            const data = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setCitas(data);
            setLoading(false);
        });

        // Cargar usuarios
        const unsubUsers = db.collection('users').onSnapshot((snapshot) => {
            const data = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            setUsuarios(data);
        });

        // Cargar Cápsulas
        const unsubCapsulas = db.collection('content_capsulas').onSnapshot((snapshot) => {
            const data = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => a.id.localeCompare(b.id));
            setCapsulas(data);
        });

        // Cargar Reto del Mes
        const unsubReto = db.collection('content_retos').doc('actual').onSnapshot((doc) => {
            if (doc.exists) {
                setRetoActual(doc.data());
            } else {
                setRetoActual(null);
            }
        });

        return () => { unsubCitas(); unsubUsers(); unsubCapsulas(); unsubReto(); };
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

    // ==========================================
    // LÓGICA DE CÁPSULAS
    // ==========================================
    const migrarCapsulas = async () => {
        try {
            const res = await fetch('./datos_capsulas.json');
            const data = await res.json();
            const batch = db.batch();
            data.forEach(cap => {
                const docRef = db.collection('content_capsulas').doc(cap.id);
                batch.set(docRef, cap);
            });
            await batch.commit();
            alert("¡Cápsulas migradas con éxito a la nube!");
        } catch (err) {
            console.error(err);
            alert("Hubo un error al migrar las cápsulas.");
        }
    };

    const guardarCapsula = async (e) => {
        e.preventDefault();
        try {
            const guionArray = editingCapsula.guionTexto.split('\n\n').map(p => p.trim()).filter(p => p !== '');
            const capToSave = {
                title: editingCapsula.title,
                youtube_id: editingCapsula.youtube_id || "",
                guion: guionArray
            };
            await db.collection('content_capsulas').doc(editingCapsula.id).set(capToSave, { merge: true });
            alert("Cápsula actualizada correctamente.");
            setEditingCapsula(null);
        } catch (err) {
            console.error(err);
            alert("No se pudo guardar la cápsula.");
        }
    };

    // ==========================================
    // LÓGICA DE RETO DEL MES
    // ==========================================
    const migrarReto = async () => {
        try {
            const res = await fetch('./datos_reto.json');
            const data = await res.json();
            await db.collection('content_retos').doc('actual').set(data);
            alert("¡Reto del Mes migrado a la nube! Ya puedes editarlo.");
        } catch (err) {
            console.error(err);
            alert("Hubo un error al migrar el Reto del Mes.");
        }
    };

    const iniciarEdicionReto = () => {
        setEditingReto({
            youtube_id: retoActual.youtube_id || "",
            url: retoActual.url || "",
            introTexto: retoActual.intro ? retoActual.intro.join('\n\n') : "",
            sem1_yt: retoActual.semanas?.[0]?.youtube_id || "",
            sem1_texto: retoActual.semanas?.[0]?.contenido ? retoActual.semanas[0].contenido.join('\n\n') : "",
            sem2_yt: retoActual.semanas?.[1]?.youtube_id || "",
            sem2_texto: retoActual.semanas?.[1]?.contenido ? retoActual.semanas[1].contenido.join('\n\n') : "",
            sem3_yt: retoActual.semanas?.[2]?.youtube_id || "",
            sem3_texto: retoActual.semanas?.[2]?.contenido ? retoActual.semanas[2].contenido.join('\n\n') : "",
            sem4_yt: retoActual.semanas?.[3]?.youtube_id || "",
            sem4_texto: retoActual.semanas?.[3]?.contenido ? retoActual.semanas[3].contenido.join('\n\n') : "",
            cierreTexto: retoActual.cierre ? retoActual.cierre.join('\n\n') : ""
        });
    };

    const guardarReto = async (e) => {
        e.preventDefault();
        try {
            const formatText = (txt) => txt.split('\n\n').map(p => p.trim()).filter(p => p !== '');
            const updatedReto = {
                youtube_id: editingReto.youtube_id,
                url: editingReto.url,
                intro: formatText(editingReto.introTexto),
                semanas: [
                    { id: "sem1", youtube_id: editingReto.sem1_yt, contenido: formatText(editingReto.sem1_texto) },
                    { id: "sem2", youtube_id: editingReto.sem2_yt, contenido: formatText(editingReto.sem2_texto) },
                    { id: "sem3", youtube_id: editingReto.sem3_yt, contenido: formatText(editingReto.sem3_texto) },
                    { id: "sem4", youtube_id: editingReto.sem4_yt, contenido: formatText(editingReto.sem4_texto) }
                ],
                cierre: formatText(editingReto.cierreTexto)
            };
            await db.collection('content_retos').doc('actual').set(updatedReto);
            alert("Reto del mes actualizado correctamente y en vivo para todos.");
            setEditingReto(null);
        } catch (err) {
            console.error(err);
            alert("No se pudo guardar el Reto del Mes.");
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
                        <p className="text-stone-500 font-light text-sm">Control global de citas, roles de usuario y contenido de la plataforma.</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                    <button onClick={() => setTab('citas')} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${tab === 'citas' ? 'bg-brand-purple text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                        Todas las Citas ({citas.length})
                    </button>
                    <button onClick={() => setTab('usuarios')} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${tab === 'usuarios' ? 'bg-brand-purple text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                        Gestión de Usuarios ({usuarios.length})
                    </button>
                    <button onClick={() => {setTab('contenido'); setEditingCapsula(null); setEditingReto(null);}} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${tab === 'contenido' ? 'bg-brand-purple text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                        <PenTool size={16} /> Gestor de Contenido
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
                ) : tab === 'usuarios' ? (
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
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        
                        <div className="flex gap-4 mb-6 border-b border-stone-100 pb-4 overflow-x-auto no-scrollbar">
                            <button onClick={() => {setContentTab('capsulas'); setEditingReto(null); setEditingCapsula(null);}} className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${contentTab === 'capsulas' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-stone-500 hover:bg-stone-50'}`}>🎥 Cápsulas en Video</button>
                            <button onClick={() => {setContentTab('reto'); setEditingReto(null); setEditingCapsula(null);}} className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${contentTab === 'reto' ? 'bg-yellow-100 text-yellow-600 shadow-sm' : 'text-stone-500 hover:bg-stone-50'}`}>⭐ Reto del Mes</button>
                        </div>

                        {/* SUB-TABS CONTENIDO */}
                        {contentTab === 'capsulas' ? (
                            capsulas.length === 0 ? (
                                <div className="text-center bg-stone-50 p-10 rounded-[2rem] border border-stone-200 shadow-inner">
                                    <FileText size={48} className="mx-auto text-stone-300 mb-4" />
                                    <p className="text-stone-600 font-light text-lg mb-6">Aún no hay cápsulas registradas en la base de datos de la nube.</p>
                                    <button onClick={migrarCapsulas} className="px-8 py-4 bg-brand-purple text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex justify-center items-center gap-2 mx-auto"><Activity size={20} /> Migrar Cápsulas desde Archivo Local</button>
                                </div>
                            ) : editingCapsula ? (
                                <form onSubmit={guardarCapsula} className="bg-white/80 backdrop-blur-xl p-8 lg:p-10 rounded-[2rem] border border-white shadow-sm space-y-6 animate-fadeIn premium-card-border">
                                    <div className="flex justify-between items-center mb-2 border-b border-stone-100 pb-6">
                                        <h4 className="font-serif font-bold text-brand-purple text-2xl">Editando: {editingCapsula.title}</h4>
                                        <button type="button" onClick={() => setEditingCapsula(null)} className="text-stone-400 hover:text-brand-purple transition-colors p-2 bg-stone-50 rounded-full hover:bg-brand-purple/10"><X size={20}/></button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-widest">Título de la Cápsula</label>
                                        <input type="text" value={editingCapsula.title} onChange={e => setEditingCapsula({...editingCapsula, title: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all bg-white/50 text-stone-800 font-medium" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-widest">ID de YouTube</label>
                                        <p className="text-xs text-stone-500 font-light mb-3">Ejemplo: youtube.com/watch?v=<b className="text-brand-purple">q6LTwWarLag</b> (solo lo remarcado).</p>
                                        <input type="text" value={editingCapsula.youtube_id} onChange={e => setEditingCapsula({...editingCapsula, youtube_id: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all bg-white/50 font-mono text-stone-600" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-widest">Guion / Contenido</label>
                                        <p className="text-xs text-stone-500 font-light mb-3">Presiona <kbd className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">Enter</kbd> dos veces para separar los párrafos.</p>
                                        <textarea value={editingCapsula.guionTexto} onChange={e => setEditingCapsula({...editingCapsula, guionTexto: e.target.value})} rows="12" className="w-full px-5 py-5 rounded-2xl border border-stone-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none resize-y transition-all bg-white/50 leading-relaxed text-stone-700 font-light" required></textarea>
                                    </div>
                                    <div className="pt-6 flex flex-wrap justify-end gap-4 border-t border-stone-100">
                                        <button type="button" onClick={() => setEditingCapsula(null)} className="px-8 py-3 rounded-full font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-all">Cancelar</button>
                                        <button type="submit" className="px-8 py-3 rounded-full font-bold text-white bg-brand-green shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2"><CheckCircle size={18} /> Guardar</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {capsulas.map(cap => (
                                        <div key={cap.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                                            <div>
                                                <div className="flex items-center gap-2 text-stone-400 mb-4 text-xs font-mono bg-stone-50 w-fit px-3 py-1 rounded-full"><PlayCircle size={14}/> {cap.youtube_id || 'Sin video'}</div>
                                                <h4 className="font-serif font-bold text-stone-800 text-xl mb-3">{cap.title}</h4>
                                                <p className="text-sm text-stone-500 line-clamp-3 font-light leading-relaxed">{cap.guion && cap.guion[0]}</p>
                                            </div>
                                            <button onClick={() => setEditingCapsula({...cap, guionTexto: cap.guion ? cap.guion.join('\n\n') : ''})} className="mt-6 px-4 py-3 w-full bg-stone-50 text-brand-purple border border-stone-200 rounded-xl font-bold text-sm hover:bg-brand-purple hover:text-white transition-all flex justify-center items-center gap-2 group-hover:border-brand-purple/30"><PenTool size={16}/> Editar Textos</button>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            !retoActual ? (
                                <div className="text-center bg-stone-50 p-10 rounded-[2rem] border border-stone-200 shadow-inner">
                                    <Star size={48} className="mx-auto text-yellow-500 mb-4" fill="currentColor" />
                                    <p className="text-stone-600 font-light text-lg mb-6">El Reto del Mes no ha sido migrado a la base de datos de la nube. Migralo para poder editarlo visualmente.</p>
                                    <button onClick={migrarReto} className="px-8 py-4 bg-brand-purple text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex justify-center items-center gap-2 mx-auto"><Activity size={20} /> Migrar Reto del Mes desde Archivo Local</button>
                                </div>
                            ) : editingReto ? (
                                <form onSubmit={guardarReto} className="bg-white/80 backdrop-blur-xl p-8 lg:p-10 rounded-[2rem] border border-white shadow-sm space-y-8 animate-fadeIn premium-card-border">
                                    <div className="flex justify-between items-center mb-2 border-b border-stone-100 pb-6">
                                        <h4 className="font-serif font-bold text-yellow-600 text-2xl flex items-center gap-2"><Star size={24} fill="currentColor"/> Editando Reto del Mes</h4>
                                        <button type="button" onClick={() => setEditingReto(null)} className="text-stone-400 hover:text-red-500 transition-colors p-2 bg-stone-50 rounded-full hover:bg-red-50"><X size={20}/></button>
                                    </div>

                                    {/* GLOBALES */}
                                    <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100 space-y-4">
                                        <h5 className="font-bold text-stone-800 uppercase tracking-widest text-sm mb-4 border-b border-stone-200 pb-2">Multimedia General</h5>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1">ID Video Introducción (Youtube)</label>
                                                <input type="text" value={editingReto.youtube_id} onChange={e => setEditingReto({...editingReto, youtube_id: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-purple outline-none text-sm font-mono text-stone-600" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1">URL Audio de Meditación</label>
                                                <input type="text" value={editingReto.url} onChange={e => setEditingReto({...editingReto, url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-purple outline-none text-sm font-mono text-stone-600" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* INTRODUCCIÓN */}
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-widest">Introducción</label>
                                        <textarea value={editingReto.introTexto} onChange={e => setEditingReto({...editingReto, introTexto: e.target.value})} rows="6" className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:border-brand-purple outline-none resize-y text-stone-700 font-light" required></textarea>
                                    </div>

                                    {/* SEMANAS */}
                                    {[1,2,3,4].map(num => (
                                        <div key={num} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                                            <h5 className="font-bold text-stone-800 uppercase tracking-widest text-sm mb-2 border-b border-stone-100 pb-2">Semana {num}</h5>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1">ID de Video (Youtube)</label>
                                                <input type="text" value={editingReto[`sem${num}_yt`]} onChange={e => setEditingReto({...editingReto, [`sem${num}_yt`]: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-purple outline-none text-sm font-mono text-stone-600" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1">Contenido / Guion</label>
                                                <textarea value={editingReto[`sem${num}_texto`]} onChange={e => setEditingReto({...editingReto, [`sem${num}_texto`]: e.target.value})} rows="5" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-purple outline-none resize-y text-stone-700 font-light" required></textarea>
                                            </div>
                                        </div>
                                    ))}

                                    {/* CIERRE */}
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-widest">Cierre</label>
                                        <textarea value={editingReto.cierreTexto} onChange={e => setEditingReto({...editingReto, cierreTexto: e.target.value})} rows="6" className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:border-brand-purple outline-none resize-y text-stone-700 font-light" required></textarea>
                                    </div>

                                    <div className="pt-6 flex flex-wrap justify-end gap-4 border-t border-stone-100">
                                        <button type="button" onClick={() => setEditingReto(null)} className="px-8 py-3 rounded-full font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-all">Cancelar</button>
                                        <button type="submit" className="px-8 py-3 rounded-full font-bold text-white bg-yellow-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2"><CheckCircle size={18} /> Guardar Reto del Mes</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-sm text-center">
                                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Star size={36} className="text-yellow-500" fill="currentColor" />
                                    </div>
                                    <h4 className="font-serif font-bold text-stone-800 text-3xl mb-4">Reto del Mes Activo</h4>
                                    <p className="text-stone-500 font-light mb-8 max-w-lg mx-auto leading-relaxed">El reto del mes ya está alojado en la nube. Haz clic en editar para modificar la introducción, las 4 semanas y los videos.</p>
                                    <button onClick={iniciarEdicionReto} className="px-10 py-4 bg-yellow-500 text-white rounded-full font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all flex justify-center items-center gap-2 mx-auto"><PenTool size={20} /> Editar Reto de este Mes</button>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};