// Requirements
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useUsuario } from '../../components/usuario.jsx';
import { NAME } from '../../helpers/config.js';


// Exported
export default ({ route, children }) => {
    const { usuarioId } = useUsuario();
    const navigate = useNavigate();

    const isAuthorized = useMemo(() => (route.all || !!usuarioId), [route, usuarioId]);

    useEffect(() => {
        if (route.title) {
            document.title = `Admin | ${route.title} | ${NAME}`;
        }
    }, [route.title]);

    useEffect(() => {
        if (!usuarioId && !route.all) {
            navigate('/login');
        } else if (usuarioId && route.route === '/login') {
            navigate('/');
        }
    }, [usuarioId, route.all, route.route, navigate]);

    if (!isAuthorized) return null;

    return children;
};
