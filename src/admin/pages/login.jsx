// Requirements
import { useCallback, useState } from 'react';
import {
    Box, Button, Card, Flex, Heading, Text, TextField,
} from '@radix-ui/themes';
import api from '../api/index.js';
import { NAME } from '../helpers/config.js';
import { useGlobalError } from '../components/callout.jsx';


// Exported
export default () => {
    const { globalErrorEdit } = useGlobalError();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        setLoading(true);
        globalErrorEdit('');

        api.login({ email, password }, () => {
            window.location.href = '/';
        }, (error) => {
            globalErrorEdit(error);
            setLoading(false);
        });
    }, [email, password, globalErrorEdit]);

    return (
        <Flex align="center" justify="center" width="100%" minHeight="100dvh" p="4">
            <Box style={{ width: '100%', maxWidth: 420 }}>
                <Card size="4">
                    <Flex direction="column" gap="4">
                        <Flex direction="column" gap="1">
                            <Heading size="5">{NAME}</Heading>
                            <Text color="gray" size="2">
                                Ingresá con tu usuario y contraseña
                            </Text>
                        </Flex>
                        <form onSubmit={handleSubmit}>
                            <Flex direction="column" gap="3">
                                <Flex direction="column" gap="1">
                                    <Text as="label" size="2" weight="medium" htmlFor="email">
                                        Email
                                    </Text>
                                    <TextField.Root
                                        id="email"
                                        type="email"
                                        autoComplete="username"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </Flex>
                                <Flex direction="column" gap="1">
                                    <Text as="label" size="2" weight="medium" htmlFor="password">
                                        Contraseña
                                    </Text>
                                    <TextField.Root
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </Flex>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Ingresando...' : 'Ingresar'}
                                </Button>
                            </Flex>
                        </form>
                    </Flex>
                </Card>
            </Box>
        </Flex>
    );
};
