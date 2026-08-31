// Requirements
import {
    createContext, useState, useMemo, useContext, useCallback,
} from 'react';
import { Callout, Box } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';


// Constants
const globalErrorStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
};


// Variables
const Context = createContext({});


// Exported
export const GlobalCalloutContext = ({ children }) => {
    const [globalError, setGlobalError] = useState(null);

    const state = useMemo(() => ({
        globalError, setGlobalError,
    }), [globalError, setGlobalError]);

    return (
        <Context.Provider value={state}>
            {children}
        </Context.Provider>
    );
};


export const useGlobalError = () => {
    const { globalError, setGlobalError } = useContext(Context);

    const globalErrorEdit = useCallback((message) => {
        setGlobalError(message.toString());
    }, [setGlobalError]);

    return {
        globalError,
        globalErrorEdit,
    };
};


export const GlobalErrorCallout = () => {
    const { globalError, globalErrorEdit } = useGlobalError();
    const clearGlobalError = useCallback(() => { globalErrorEdit(''); }, [globalErrorEdit]);
    if (!globalError) return null;
    return (
        <Box style={globalErrorStyle} p="4">
            <Callout.Root color="red" onClick={clearGlobalError}>
                <Callout.Icon>
                    <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                    {globalError}
                </Callout.Text>
            </Callout.Root>
        </Box>
    );
};
