// Requirements


// Exported
export const get = async (req, res, next) => {
    try {
        res.json({
            usuarioId: req.usuario.usuarioId,
            usuarioNombre: req.usuario.usuarioNombre,
            usuarioApellido: req.usuario.usuarioApellido,
            usuarioEmail: req.usuario.usuarioEmail,
            usuarioRol: req.usuario.usuarioRol,
        });
    } catch (error) {
        next(error);
    }
};
