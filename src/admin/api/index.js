// Requirements
import { API_BASE_URL } from '../helpers/config.js';
import usuario from './usuario.js';
import vehiculo from './vehiculo.js';


// Constants
const JSONHeaders = { 'Content-Type': 'application/json' };


// Internal
const translateError = (e) => {
    if (e === 'Failed to fetch') return 'No connection';
    return e;
};

const JSONParseRes = async (res) => {
    if ([401, 500].includes(res.status)) {
        // Invalid token = sin sesión (esperado en /login). Solo forzar logout si expiró.
        if (res.statusText === 'Expired token') {
            window.location = `${API_BASE_URL}authentication/logout`;
            return { error: 'Session expired' };
        }
        let body = {};
        try {
            body = await res.json();
        } catch {
            body = {};
        }
        return { error: body.error || res.statusText || 'Server error' };
    }

    return res.json();
};

const JSONGet = (url, parameters, onSuccess, onError) => {
    let queryString = '';
    if (parameters && Object.keys(parameters).length) {
        queryString = new URLSearchParams(parameters).toString();
        queryString = `?${queryString}`;
    }
    const urlComplete = `${API_BASE_URL}api/${url}${queryString}`;
    fetch(urlComplete, {
        credentials: 'include',
        headers: JSONHeaders,
    })
        .then(JSONParseRes)
        .then((res) => {
            if (res.error) {
                onError(res.error);
                return;
            }
            onSuccess(res, urlComplete, queryString);
        })
        .catch((error) => {
            onError(translateError(error.message));
        });
};

const JSONDelete = (url, onSuccess, onError) => {
    fetch(`${API_BASE_URL}api/${url}`, {
        credentials: 'include',
        headers: JSONHeaders,
        method: 'DELETE',
    })
        .then(JSONParseRes)
        .then((res) => {
            if (res.error) {
                onError(res.error);
                return;
            }
            onSuccess(res);
        })
        .catch((error) => {
            onError(translateError(error.message));
        });
};

const JSONPost = (url, body, onSuccess, onError) => {
    fetch(`${API_BASE_URL}api/${url}`, {
        credentials: 'include',
        headers: JSONHeaders,
        method: 'POST',
        body: JSON.stringify(body),
    })
        .then(JSONParseRes)
        .then((res) => {
            if (res.error) {
                onError(res.error);
                return;
            }
            onSuccess(res);
        })
        .catch((error) => {
            onError(translateError(error.message));
        });
};

const JSONAuthPost = (url, body, onSuccess, onError) => {
    fetch(`${API_BASE_URL}${url}`, {
        credentials: 'include',
        headers: JSONHeaders,
        method: 'POST',
        body: JSON.stringify(body),
    })
        .then(JSONParseRes)
        .then((res) => {
            if (res.error) {
                onError(res.error);
                return;
            }
            onSuccess(res);
        })
        .catch((error) => {
            onError(translateError(error.message));
        });
};


const JSONmethods = {
    get: JSONGet,
    post: JSONPost,
    delete: JSONDelete,
    authPost: JSONAuthPost,
};


// Exported
export default {
    ...usuario(JSONmethods),
    ...vehiculo(JSONmethods),
};
