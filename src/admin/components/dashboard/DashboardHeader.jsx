// Requirements
import { useEffect, useState } from 'react';
import { Flex, IconButton, Text } from '@radix-ui/themes';
import { ExitIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { Wifi } from 'lucide-react';
import { API_BASE_URL, NAME } from '../../helpers/config.js';
import { useTheme } from '../theme.jsx';
import { useUsuario } from '../usuario.jsx';


// Internal
const formatClock = now => now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});


// Exported
export default ({ connected }) => {
    const { theme, themeToggle } = useTheme();
    const { usuarioNombre, usuarioApellido } = useUsuario();
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const logOut = () => {
        window.location = `${API_BASE_URL}authentication/logout`;
    };

    return (
        <header className="dashboard-header">
            <Flex align="center" justify="between" gap="4" wrap="wrap">
                <Flex direction="column" gap="0">
                    <Text className="dashboard-header-title">{NAME}</Text>
                    <Text className="dashboard-header-subtitle">Dashboard de Vehículos</Text>
                </Flex>

                <Flex align="center" gap="4" wrap="wrap">
                    <Flex align="center" gap="2" className="dashboard-header-status">
                        <Wifi size={16} className={connected ? 'dashboard-icon-online' : 'dashboard-icon-offline'} />
                        <Text size="2" weight="medium">
                            {connected ? 'Conectado' : 'Desconectado'}
                        </Text>
                    </Flex>

                    <Text size="3" weight="bold" className="dashboard-mono">
                        {formatClock(now)}
                    </Text>

                    <Flex align="center" gap="3">
                        <Text size="2" className="dashboard-muted">
                            {usuarioNombre} {usuarioApellido}
                        </Text>
                        <IconButton variant="ghost" color="gray" highContrast onClick={themeToggle} aria-label="Toggle theme">
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </IconButton>
                        <IconButton variant="ghost" color="gray" highContrast onClick={logOut} aria-label="Logout">
                            <ExitIcon />
                        </IconButton>
                    </Flex>
                </Flex>
            </Flex>
        </header>
    );
};
