// Requirements
import {
    createContext, useState, useMemo, useContext, useCallback,
    useEffect,
} from 'react';
import { Flex, Spinner, Text } from '@radix-ui/themes';
import api from '../api';
import { GlobalErrorCallout, useGlobalError } from './callout';


// Initialization
const Context = createContext(null);


// Exported
export const Usuario = ({ children }) => {
    const [usuario, setUsuario] = useState(null);

    const state = useMemo(() => ({
        usuario,
        setUsuario,
    }),
    [usuario, setUsuario]);

    return <Context.Provider value={state}>{children}</Context.Provider>;
};


export const useUsuario = () => {
    const {
        usuario, setUsuario,
    } = useContext(Context);

    const usuarioLoaded = useMemo(() => usuario !== null, [usuario]);

    const usuarioLoad = useCallback(() => {
        api.usuarioLoad((res) => {
            setUsuario({
                usuarioId: res.usuarioId,
                usuarioNombre: res.usuarioNombre,
                usuarioApellido: res.usuarioApellido,
                usuarioEmail: res.usuarioEmail,
                usuarioRol: res.usuarioRol,
            });
        },
        () => {
            setUsuario({});
        });
    }, [setUsuario]);

    return {
        usuarioLoaded,
        usuarioLoad,
        ...(usuario || {}),
    };
};


export const UsuarioLoad = ({ children }) => {
    const { globalError } = useGlobalError();
    const { usuarioLoaded, usuarioLoad } = useUsuario();

    useEffect(usuarioLoad, [usuarioLoad]);

    if (!usuarioLoaded) {
        if (globalError) {
            return (
                <Flex align="center" justify="center" width="100%" height="100dvh">
                    <Text color="red">{globalError}</Text>
                </Flex>
            );
        }
        return (
            <Flex align="center" justify="center" width="100%" height="100dvh">
                <Spinner />
            </Flex>
        );
    }

    return (
        <>
            <GlobalErrorCallout />
            {children}
        </>
    );
};
