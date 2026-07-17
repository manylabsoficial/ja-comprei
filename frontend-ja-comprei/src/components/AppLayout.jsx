import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout({ children }) {
    const location = useLocation();

    // Definição de rotas onde a barra NÃO deve aparecer
    const hideNavRoutes = ['/', '/landing-classic', '/index2', '/v2', '/login', '/confirmacao', '/auth/callback', '/acesso-indisponivel']; // Landing Pages e Auth
    const shouldShowNav = !hideNavRoutes.includes(location.pathname);

    return (
        <div className="flex flex-col min-h-screen">
            <div className={`flex-1 ${shouldShowNav ? 'pb-24' : ''}`}>
                {children}
            </div>
            {shouldShowNav && <BottomNav />}
        </div>
    );
}
