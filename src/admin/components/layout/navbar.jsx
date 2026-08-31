// Requirements
import {
    Box, Flex, IconButton, Link, Text,
} from '@radix-ui/themes';
import {
    useCallback, useEffect, useState,
} from 'react';
import {
    MoonIcon, SunIcon, ExitIcon,
} from '@radix-ui/react-icons';
import { useTheme } from '../theme.jsx';
import { API_BASE_URL, NAME } from '../../helpers/config.js';
import { useUsuario } from '../usuario.jsx';


// Constants
const navbarHeight = 48;


// Exported
export { navbarHeight };


export default ({
    navbarAlwaysOn = false,
    solidNavbar = false,
    title = '',
}) => {
    const { theme, themeToggle } = useTheme();
    const { usuarioId, usuarioNombre, usuarioApellido } = useUsuario();
    const [scrolled, setScrolled] = useState(!!navbarAlwaysOn || !!solidNavbar);

    useEffect(() => {
        if (navbarAlwaysOn || solidNavbar) return () => {};

        const handleScroll = () => {
            setScrolled(window.scrollY > navbarHeight);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [navbarAlwaysOn, solidNavbar]);

    const logOut = useCallback(() => {
        window.location = `${API_BASE_URL}authentication/logout`;
    }, []);

    if (!usuarioId) return null;

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            style={{
                height: `${navbarHeight}px`,
                zIndex: 10,
                backdropFilter: scrolled || solidNavbar ? 'blur(8px)' : 'none',
                backgroundColor: scrolled || solidNavbar ? 'var(--color-panel-translucent)' : 'transparent',
                borderBottom: scrolled || solidNavbar ? '1px solid var(--gray-a5)' : 'none',
            }}
        >
            <Flex align="center" justify="between" px="4" height="100%">
                <Flex align="center" gap="3">
                    <Link href="/" weight="medium" size="2">
                        {NAME}
                    </Link>
                    {title && (
                        <Text size="2" color="gray">
                            {title}
                        </Text>
                    )}
                </Flex>
                <Flex align="center" gap="3">
                    <Text size="2" color="gray">
                        {usuarioNombre} {usuarioApellido}
                    </Text>
                    <IconButton variant="ghost" onClick={themeToggle} aria-label="Toggle theme">
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </IconButton>
                    <IconButton variant="ghost" onClick={logOut} aria-label="Logout">
                        <ExitIcon />
                    </IconButton>
                </Flex>
            </Flex>
        </Box>
    );
};
