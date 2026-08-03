// ============================================================
// Firebase Init + React Hooks + Iconos + UI Base
// Este archivo DEBE cargarse primero, todos los demás dependen de él
// ============================================================

// --- Inicialización de Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyDDrImW6-xUfu5TdamXe0HH0eawlME-yZI",
    authDomain: "neuro-bloom-5313d.firebaseapp.com",
    projectId: "neuro-bloom-5313d",
    storageBucket: "neuro-bloom-5313d.firebasestorage.app",
    messagingSenderId: "727914123954",
    appId: "1:727914123954:web:2b4e961315b999647f6fab"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- React Hooks (destructuring global) ---
const { useState, useEffect, useRef } = React;

// --- Iconos Globales ---
const IconWrapper = ({ name, size = 24, className, color, fill = "none", ...props }) => {
    const iconRef = useRef(null);
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons({
                root: iconRef.current,
                nameAttr: 'data-lucide',
                attrs: { width: size, height: size, stroke: color || 'currentColor', fill: fill, class: className, ...props }
            });
        }
    }, [name, size, className, color, fill]);
    return <i ref={iconRef} data-lucide={name} style={{ display: 'inline-flex' }}></i>;
};

// Íconos globales confirmados para el funcionamiento de toda la aplicación (incluyendo UltimaPagina.js)
const Heart = (props) => <IconWrapper name="heart" {...props} />;
const Activity = (props) => <IconWrapper name="activity" {...props} />;
const HeartHandshake = (props) => <IconWrapper name="heart-handshake" {...props} />;
const Sun = (props) => <IconWrapper name="sun" {...props} />;
const Calendar = (props) => <IconWrapper name="calendar" {...props} />;
const Menu = (props) => <IconWrapper name="menu" {...props} />;
const X = (props) => <IconWrapper name="x" {...props} />;
const ArrowLeft = (props) => <IconWrapper name="arrow-left" {...props} />;
const Shield = (props) => <IconWrapper name="shield" {...props} />;
const Brain = (props) => <IconWrapper name="brain" {...props} />;
const BookHeart = (props) => <IconWrapper name="book-heart" {...props} />;
const PlayCircle = (props) => <IconWrapper name="play-circle" {...props} />;
const Library = (props) => <IconWrapper name="library" {...props} />;
const Sprout = (props) => <IconWrapper name="sprout" {...props} />;
const Star = (props) => <IconWrapper name="star" {...props} />;
const UserCircle = (props) => <IconWrapper name="user-circle" {...props} />;
const Loader = (props) => <IconWrapper name="loader" {...props} className="animate-spin" />;
const Compass = (props) => <IconWrapper name="compass" {...props} />;
const Lock = (props) => <IconWrapper name="lock" {...props} />;
const CheckCircle = (props) => <IconWrapper name="check-circle" {...props} />;
const MessageCircle = (props) => <IconWrapper name="message-circle" {...props} />;
const PenTool = (props) => <IconWrapper name="pen-tool" {...props} />;
const Headphones = (props) => <IconWrapper name="headphones" {...props} />;
const FileText = (props) => <IconWrapper name="file-text" {...props} />;
const Leaf = (props) => <IconWrapper name="leaf" {...props} />;
const Instagram = (props) => <IconWrapper name="instagram" {...props} />;

const getIconComponent = (name, props = {}) => {
    switch(name) {
        case 'activity': return <Activity {...props} />;
        case 'heart': return <Heart {...props} />;
        case 'heart-handshake': return <HeartHandshake {...props} />;
        case 'sun': return <Sun {...props} />;
        case 'shield': return <Shield {...props} />;
        case 'brain': return <Brain {...props} />;
        case 'book-heart': return <BookHeart {...props} />;
        case 'play-circle': return <PlayCircle {...props} />;
        case 'library': return <Library {...props} />;
        case 'sprout': return <Sprout {...props} />;
        case 'star': return <Star {...props} />;
        case 'compass': return <Compass {...props} />;
        default: return <Activity {...props} />;
    }
};

// --- Componente Thumbnail (imagen con fallback) ---
const Thumbnail = ({ src, alt, fallback, className }) => {
    const [error, setError] = useState(false);
    if (error || !src) return fallback;
    return <img src={src} alt={alt} onError={() => setError(true)} className={className} />;
};

// --- Constantes globales ---
const colors = {
    primary: '#81638b', secondary: '#b695c0', actionBlue: '#2196f3',
    brainGreen: '#9BC496', white: '#FFFFFF',
};

const logoUrl = "https://i.ibb.co/WWs5xcSX/Neuro-Bloom-Logo-nbg.png";

// --- Componentes UI base ---
const Logo = ({ className }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <img src={logoUrl} alt="Neuro Bloom Logo" className="h-full w-auto object-contain drop-shadow-sm" />
    </div>
);

const NavButton = ({ active, onClick, children, icon }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 text-[15px] font-bold tracking-wide border ${active ? 'bg-brand-purple/90 text-white border-brand-purple shadow-md transform scale-105' : 'bg-white/40 text-brand-purple border-white/60 hover:bg-white/70 hover:shadow-sm'}`}>
        {React.cloneElement(icon, { size: 18, color: active ? colors.white : colors.primary })}
        <span className="hidden lg:inline">{children}</span>
    </button>
);

const BackButton = ({ onClick, text = "Volver", onHome, homeText = "Ir al Inicio" }) => (
    <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={onClick} className="flex items-center gap-2 text-stone-500 hover:text-brand-purple transition-colors font-bold group w-fit bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white shadow-sm hover:shadow-md">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform text-brand-purple" />
            <span className="text-stone-600">{text}</span>
        </button>
        {onHome && (
            <button onClick={onHome} className="flex items-center gap-2 text-stone-500 hover:text-brand-purple transition-colors font-bold group w-fit bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white shadow-sm hover:shadow-md">
                <Heart size={18} className="group-hover:scale-110 transition-transform text-brand-purple" />
                <span className="text-stone-600">{homeText}</span>
            </button>
        )}
    </div>
);