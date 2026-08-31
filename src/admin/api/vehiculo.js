// Requirements


// Exported
export default ({
    get, delete: del,
}) => ({
    vehiculoList: (onSuccess, onError) => {
        get('vehiculo', {}, onSuccess, onError);
    },
    vehiculoDelete: (vehiculoCodigo, onSuccess, onError) => {
        del(`vehiculo/${encodeURIComponent(vehiculoCodigo)}`, onSuccess, onError);
    },
});
