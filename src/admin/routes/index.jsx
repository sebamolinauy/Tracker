// Requirements
import Login from '../pages/login';
import Start from '../pages/start';


// Constants
export default [
    {
        route: '/login',
        element: <Login />,
        all: true,
        title: 'Login',
    },
    {
        route: '/',
        element: <Start />,
        title: 'Inicio',
        fullBleed: true,
        hideNavbar: true,
    },
    {
        route: '*',
        element: <Start />,
        title: 'Inicio',
        fullBleed: true,
        hideNavbar: true,
    },
];
