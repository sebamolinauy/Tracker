// Requirements
import L from 'leaflet';
import vehicleColor from '../../helpers/vehicleColor.js';


// Constants
const truckPaths = `
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" fill="none" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 18H9" fill="none" stroke="white" stroke-width="1.75" stroke-linecap="round"/>
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" fill="none" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="17" cy="18" r="2" fill="none" stroke="white" stroke-width="1.75"/>
    <circle cx="7" cy="18" r="2" fill="none" stroke="white" stroke-width="1.75"/>
`;


// Exported
export default (codigo, online, selected, speed = 0) => {
    const color = vehicleColor(codigo);
    const pinColor = online ? color.main : '#64748b';
    const scale = selected ? 1.12 : 1;
    const w = Math.round(120 * scale);
    const h = Math.round(72 * scale);
    const label = `${codigo} | ${Math.round(speed)} km/h`;

    const html = `
        <div class="dashboard-map-marker${selected ? ' dashboard-map-marker--selected' : ''}">
            <svg width="48" height="56" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 52 C24 52 8 36 8 22 C8 12.059 16.059 4 24 4 C31.941 4 40 12.059 40 22 C40 36 24 52 24 52Z"
                      fill="${pinColor}" opacity="0.95"/>
                <circle cx="24" cy="22" r="14" fill="rgba(15, 20, 25, 0.35)"/>
                <g transform="translate(12, 10) scale(0.85)">${truckPaths}</g>
            </svg>
            <div class="dashboard-map-marker-label">${label}</div>
        </div>`;

    return L.divIcon({
        html,
        className: 'dashboard-map-marker-wrap',
        iconSize: [w, h],
        iconAnchor: [w / 2, h - 8],
    });
};
