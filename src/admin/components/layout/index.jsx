// Requirements
import { Container, Flex, ScrollArea } from '@radix-ui/themes';
import { useLocation } from 'react-router';
import { useUsuario } from '../usuario';
import Navbar, { navbarHeight } from './navbar';


// Constants
const height = `calc(100dvh - ${navbarHeight}px)`;


// Exported
export default ({ children, title, fullBleed, solidNavbar, hideNavbar }) => {
    const { usuarioId } = useUsuario();
    const location = useLocation();

    if (!usuarioId) return children;

    const contentHeight = hideNavbar ? '100dvh' : height;

    if (fullBleed) {
        return (
            <>
                {!hideNavbar && (
                    <Navbar navbarAlwaysOn title={title} solidNavbar={solidNavbar} />
                )}
                <Flex
                    direction="column"
                    style={{
                        paddingTop: hideNavbar ? 0 : `${navbarHeight}px`,
                        height: contentHeight,
                        width: '100%',
                    }}
                >
                    {children}
                </Flex>
            </>
        );
    }

    return (
        <>
            <Navbar navbarAlwaysOn title={title} />
            <Flex style={{ paddingTop: `${navbarHeight}px` }}>
                <ScrollArea
                    key={location.pathname}
                    scrollbars="vertical"
                    style={{
                        height,
                        flex: 1,
                        width: '100%',
                    }}
                >
                    <Container
                        size="4"
                        px="3"
                        style={{
                            maxWidth: '100dvw',
                        }}
                    >
                        <Flex direction="column" align="start" justify="start" style={{ minHeight: height }} px="2">
                            {children}
                        </Flex>
                    </Container>
                </ScrollArea>
            </Flex>
        </>
    );
};
