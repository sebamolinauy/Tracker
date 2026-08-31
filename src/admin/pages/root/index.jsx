// Requirements
import { BrowserRouter, Routes, Route } from 'react-router';
import routes from '../../routes';
import { ThemeContext } from '../../components/theme';
import { Usuario, UsuarioLoad } from '../../components/usuario';
import Layout from '../../components/layout';
import { GlobalCalloutContext } from '../../components/callout';
import Authorization from './autorization';


// Internal
const getElement = r => (
    <Authorization route={r}>
        <Layout title={r.title} fullBleed={r.fullBleed} solidNavbar={r.solidNavbar} hideNavbar={r.hideNavbar}>
            {r.element}
        </Layout>
    </Authorization>
);


// Exported
export default () => (
    <ThemeContext>
        <GlobalCalloutContext>
            <Usuario>
                <BrowserRouter basename="/">
                    <UsuarioLoad>
                        <Routes>
                            { routes.map(r => (
                                <Route
                                    key={r.route}
                                    path={r.route}
                                    element={getElement(r)}
                                />
                            )) }
                        </Routes>
                    </UsuarioLoad>
                </BrowserRouter>
            </Usuario>
        </GlobalCalloutContext>
    </ThemeContext>
);
