const AuthModal = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const docRef = db.collection('users').doc(userCredential.user.uid);
                const docSnap = await docRef.get();
                if (!docSnap.exists) {
                    await docRef.set({
                        email: userCredential.user.email,
                        isPremium: false,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            } else {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: userCredential.user.email,
                    isPremium: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            onClose();
        } catch (err) {
            let msg = err.message;
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = 'Correo o contraseña incorrectos.';
            else if (err.code === 'auth/email-already-in-use') msg = 'Este correo ya está registrado.';
            else if (err.code === 'auth/weak-password') msg = 'La contraseña debe tener al menos 6 caracteres.';
            setError(msg);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-stone-100/80 rounded-full text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors"><X size={20} /></button>
                <div className="text-center mb-8 mt-2">
                    <h3 className="text-3xl font-serif font-bold text-brand-purple mb-2">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h3>
                    <p className="text-stone-500 font-light text-sm">{isLogin ? 'Ingresa a tu espacio en Neuro Bloom' : 'Comienza tu proceso con nosotros'}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Correo Electrónico</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all bg-white/50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Contraseña</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all bg-white/50" required />
                    </div>
                    {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-brand-purple text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? <Loader size={20} /> : (isLogin ? 'Ingresar' : 'Registrarme')}
                    </button>
                </form>
                <div className="mt-6 text-center border-t border-stone-100 pt-6 flex flex-col gap-4">
                    <p className="text-stone-500 text-sm">{isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'} <button onClick={() => {setIsLogin(!isLogin); setError('');}} className="ml-2 text-brand-purple font-bold hover:underline">{isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}</button></p>
                </div>
            </div>
        </div>
    );
};