// Requirements
import { createRoot } from 'react-dom/client';
import Root from './pages/root/index.jsx';
import './style/main.css';
import { NAME } from './helpers/config.js';


// Main
document.title = `Admin | ${NAME}`;
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Root />);
