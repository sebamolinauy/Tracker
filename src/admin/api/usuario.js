// Requirements


// Exported
export default ({
    get, authPost,
}) => ({
    usuarioLoad: (onSuccess, onError) => {
        get('usuario', {}, onSuccess, onError);
    },
    login: (credentials, onSuccess, onError) => {
        authPost('authentication/login', credentials, onSuccess, onError);
    },
});
