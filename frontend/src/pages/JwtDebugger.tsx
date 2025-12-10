import { useState, useEffect, Fragment } from 'react';
import {
    Container,
    Heading,
    Text,
    Box,
    Textarea,
    Grid,
    GridItem,
    Badge,
    Tabs,
    Table,
    Input,
    Button,
    Flex,
    VStack,
    HStack,
    Link,
    Icon,
} from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle, FiCopy, FiRefreshCcw, FiExternalLink } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { jwtDecode } from 'jwt-decode';
import * as jose from 'jose';
import { toaster } from '../components/ui/toaster';
import { useColorMode } from '../components/ui/color-mode';

// Standard JWT Claims Descriptions
const STANDARD_CLAIMS: Record<string, string> = {
    // Registered Claims
    iss: "The principal that issued the JWT.",
    sub: "The subject of the JWT (the user).",
    aud: "The recipients that the JWT is intended for.",
    exp: "The expiration time on or after which the JWT MUST NOT be accepted for processing.",
    nbf: "The time before which the JWT MUST NOT be accepted for processing.",
    iat: "The time at which the JWT was issued.",
    jti: "Unique identifier for the JWT.",
    // Header Claims
    alg: "The algorithm used to sign the JWT.",
    typ: "The media type of this complete JWT.",
    kid: "Key ID - a hint indicating which key was used to secure the JWS.",
    // Common Custom Claims
    name: "Full name of the subject.",
    given_name: "Given name(s) or first name(s).",
    family_name: "Surname(s) or last name(s).",
    email: "Email address of the subject.",
    role: "User roles associated with the subject.",
    scope: "OAuth 2.0 scopes authorized for this token.",
    tenant_id: "Identifier for the tenant/organization."
};

const ClaimsTable = ({ data }: { data: any }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const borderColor = isDark ? 'gray.700' : 'gray.200';
    const textColor = isDark ? 'gray.400' : 'gray.600';
    const hoverBg = isDark ? 'gray.750' : 'gray.50';
    const keyColor = isDark ? 'gray.200' : 'gray.700';
    const valueColor = isDark ? 'gray.100' : 'gray.800';
    const infoBg = isDark ? 'blue.900' : 'blue.50';
    const infoColor = isDark ? 'blue.200' : 'blue.700';

    if (!data) return <Text fontSize="sm" color="gray.500" p={4}>No data available</Text>;

    return (
        <Table.Root variant="outline" size="sm">
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader borderColor={borderColor} color={textColor}>Claim</Table.ColumnHeader>
                    <Table.ColumnHeader borderColor={borderColor} color={textColor}>Value</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {Object.entries(data).map(([key, value]) => {
                    const description = STANDARD_CLAIMS[key];
                    const isDate = (key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number';

                    return (
                        <Fragment key={key}>
                            <Table.Row _hover={{ bg: hoverBg }}>
                                <Table.Cell fontWeight="bold" fontFamily="monospace" borderColor={borderColor} color={keyColor} verticalAlign="top">
                                    {key}
                                </Table.Cell>
                                <Table.Cell fontFamily="monospace" wordBreak="break-word" borderColor={borderColor} color={valueColor}>
                                    <VStack align="stretch" gap={1}>
                                        <Text>
                                            {isDate ? value : (typeof value === 'object' ? JSON.stringify(value) : String(value))}
                                        </Text>

                                        {isDate && (
                                            <Text fontSize="xs" color="gray.500">
                                                {new Date((value as number) * 1000).toLocaleString()}
                                            </Text>
                                        )}

                                        {description && (
                                            <Box fontSize="xs" color="gray.500" mt={1}>
                                                {description}{' '}
                                                <Link href="https://www.iana.org/assignments/jwt/jwt.xhtml" target="_blank" color="blue.400" display="inline-flex" alignItems="center" gap={1}>
                                                    Learn more <Icon as={FiExternalLink} />
                                                </Link>
                                            </Box>
                                        )}
                                    </VStack>
                                </Table.Cell>
                            </Table.Row>
                            {isDate && (
                                <Table.Row>
                                    <Table.Cell colSpan={2} p={0} borderBottomWidth={1} borderColor={borderColor}>
                                        <Box bg={infoBg} p={2} fontSize="xs" color={infoColor}>
                                            This value must be a <Text as="span" fontFamily="monospace" fontWeight="bold">NumericDate</Text> type, representing seconds.
                                        </Box>
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Fragment>
                    );
                })}
            </Table.Body>
        </Table.Root>
    );
};

export default function JwtDebugger() {
    const { token: sessionToken } = useAuthStore();
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    // Theme Colors
    const bgCard = isDark ? 'gray.800' : 'white';
    const borderColor = isDark ? 'gray.700' : 'gray.200';
    const textColor = isDark ? 'gray.300' : 'gray.700'; 
    const codeBg = isDark ? 'gray.900' : 'white';
    const codeColorHeader = isDark ? 'red.200' : 'red.600';
    const codeColorPayload = isDark ? 'purple.200' : 'purple.700';
    const headerBg = isDark ? 'gray.800' : 'gray.100';
    const tabListBg = isDark ? 'gray.700' : 'gray.200';

    // State
    const [inputToken, setInputToken] = useState('');
    const [decodedHeader, setDecodedHeader] = useState<any>(null);
    const [decodedPayload, setDecodedPayload] = useState<any>(null);
    const [jwtError, setJwtError] = useState<string | null>(null);

    // Signature Verification State
    const [secret, setSecret] = useState('');
    const [isSignatureValid, setIsSignatureValid] = useState<boolean | null>(null);

    // Initial load
    useEffect(() => {
        if (sessionToken && !inputToken) {
            setInputToken(sessionToken);
        }
    }, [sessionToken]);

    // Decode logic
    useEffect(() => {
        if (!inputToken.trim()) {
            setDecodedHeader(null);
            setDecodedPayload(null);
            setJwtError(null);
            setIsSignatureValid(null);
            return;
        }

        try {
            const header = jwtDecode(inputToken, { header: true });
            const payload = jwtDecode(inputToken);
            setDecodedHeader(header);
            setDecodedPayload(payload);
            setJwtError(null);
        } catch (e) {
            setDecodedHeader(null);
            setDecodedPayload(null);
            setJwtError("Invalid JWT Token");
            setIsSignatureValid(null);
        }
    }, [inputToken]);

    // Signature Verification Logic
    useEffect(() => {
        const verifySignature = async () => {
            if (!inputToken || !decodedHeader || !secret) {
                setIsSignatureValid(null);
                return;
            }

            try {
                const alg = decodedHeader.alg;
                if (!alg || alg === 'none') {
                    setIsSignatureValid(false);
                    return;
                }

                const secretBytes = new TextEncoder().encode(secret);

                if (alg.startsWith('HS')) {
                    await jose.jwtVerify(inputToken, secretBytes);
                    setIsSignatureValid(true);
                } else if (alg.startsWith('RS') || alg.startsWith('PS') || alg.startsWith('ES')) {
                    const publicKey = await jose.importSPKI(secret, alg);
                    await jose.jwtVerify(inputToken, publicKey);
                    setIsSignatureValid(true);
                } else {
                    setIsSignatureValid(false);
                }

            } catch (e) {
                setIsSignatureValid(false);
            }
        };

        const timeout = setTimeout(verifySignature, 500);
        return () => clearTimeout(timeout);

    }, [inputToken, secret, decodedHeader]);


    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toaster.create({ title: "Copied!", type: "success", duration: 1000 });
    };

    return (
        <Container maxW="container.xl" py={8}>
            {/* Header Area */}
            <Flex justify="space-between" align="center" mb={6} borderBottom="1px" borderColor={borderColor} pb={4}>
                <VStack align="start" gap={0}>
                    <Heading size="lg">JWT Debugger</Heading>
                    <Text fontSize="sm" color={textColor}>Inspect, Verify, and Debug JWTs</Text>
                </VStack>

                <HStack gap={4}>
                    {jwtError ? (
                        <Badge colorPalette="red" variant="solid" px={3} py={1} borderRadius="full">
                            <Flex align="center" gap={2}><FiAlertCircle /> INVALID JWT</Flex>
                        </Badge>
                    ) : decodedHeader ? (
                        <Badge colorPalette="green" variant="solid" px={3} py={1} borderRadius="full">
                            <Flex align="center" gap={2}><FiCheckCircle /> VALID JWT</Flex>
                        </Badge>
                    ) : null}

                    {/* Signature Status */}
                    {isSignatureValid === true && (
                        <Badge colorPalette="cyan" variant="solid" px={3} py={1} borderRadius="full">
                            <Flex align="center" gap={2}><FiCheckCircle /> VERIFIED</Flex>
                        </Badge>
                    )}
                    {isSignatureValid === false && (
                        <Badge colorPalette="orange" variant="solid" px={3} py={1} borderRadius="full">
                            <Flex align="center" gap={2}><FiAlertCircle /> SIGNATURE INVALID</Flex>
                        </Badge>
                    )}
                </HStack>
            </Flex>

            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))" }} gap={6} h={{ base: "auto", lg: "calc(100vh - 250px)" }}>
                {/* LEFT COLUMN: Encoded Token & Signature Input */}
                <GridItem display="flex" flexDirection="column" gap={4}>
                    {/* Token Input Area */}
                    <Box flex={1} display="flex" flexDirection="column" bg={bgCard} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
                        <Flex justify="space-between" mb={2}>
                            <Text fontWeight="bold" fontSize="xs" color={textColor} letterSpacing="wider">ENCODED TOKEN</Text>
                            <HStack gap={2}>
                                <Button size="xs" variant="outline" onClick={() => handleCopy(inputToken)}>
                                    <FiCopy /> COPY
                                </Button>
                                <Button size="xs" variant="outline" onClick={() => setInputToken('')}>
                                    <FiRefreshCcw /> CLEAR
                                </Button>
                            </HStack>
                        </Flex>
                        <Textarea
                            value={inputToken}
                            onChange={(e) => setInputToken(e.target.value)}
                            placeholder="Paste your JWT here..."
                            h="full"
                            bg="transparent"
                            border={0}
                            color={isDark ? 'pink.300' : 'pink.500'}
                            fontFamily="monospace"
                            fontSize="sm"
                            resize="none"
                            _focus={{ boxShadow: 'none' }}
                            p={0}
                        />
                        <Text fontSize="xs" color="gray.400" mt={2}>
                            {inputToken === sessionToken ? "Currently showing your active session token." : "Showing custom token."}
                        </Text>
                    </Box>

                    {/* Signature Section */}
                    <Box p={6} bg={bgCard} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor} marginBottom={10}>
                        <Text fontWeight="bold" fontSize="xs" color={textColor} letterSpacing="wider" mb={4}>
                            VERIFY SIGNATURE
                        </Text>
                        <VStack align="stretch" gap={3}>
                            <Flex align="center" gap={2}>
                                <Badge colorPalette={isSignatureValid ? "green" : isSignatureValid === false ? "red" : "gray"}>
                                    {decodedHeader?.alg || 'HS256'}
                                </Badge>
                                <Text fontSize="xs" color="gray.500">
                                    {decodedHeader?.alg?.startsWith('RS') ? 'Paste Public Key' : 'Paste Secret'}
                                </Text>
                            </Flex>
                            <Input
                                placeholder={decodedHeader?.alg?.startsWith('RS') ? "-----BEGIN PUBLIC KEY..." : "your-256-bit-secret"}
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                bg={codeBg}
                                border="1px"
                                borderColor={isSignatureValid === false ? "red.300" : borderColor}
                                color={isDark ? 'cyan.300' : 'cyan.600'}
                                fontFamily="monospace"
                                size="sm"
                            />
                            {isSignatureValid === false && (
                                <Text fontSize="xs" color="red.500">Signature verification failed.</Text>
                            )}
                        </VStack>
                    </Box>
                </GridItem>

                {/* RIGHT COLUMN: Decoded Header & Payload */}
                <GridItem display="flex" flexDirection="column" gap={6}>
                    {/* HEADER SECTION */}
                    <Box flex="0 0 auto" p={0} bg={bgCard} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor} overflow="hidden">
                        <Tabs.Root variant="enclosed" size="sm" defaultValue="claims">
                            <Flex justify="space-between" align="center" px={6} py={3} borderBottom="1px" borderColor={borderColor} bg={headerBg}>
                                <Text fontWeight="bold" fontSize="xs" color={textColor} letterSpacing="wider" mr={4}>HEADER</Text>
                                <Tabs.List bg={tabListBg} p={1} borderRadius="full">
                                    <Tabs.Trigger value="json" color="gray.500" fontSize="xs" px={3} py={1} borderRadius="full" fontWeight="bold">JSON</Tabs.Trigger>
                                    <Tabs.Trigger value="claims" color="gray.500" fontSize="xs" px={3} py={1} borderRadius="full" fontWeight="bold">Claims Table</Tabs.Trigger>
                                </Tabs.List>
                            </Flex>
                            <Box>
                                <Tabs.Content value="json" p={0} position="relative" minHeight="139px">
                                    <Box
                                        bg={codeBg}
                                        p={6}
                                        color={codeColorHeader}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                        whiteSpace="pre-wrap"
                                    >
                                        {decodedHeader ? JSON.stringify(decodedHeader, null, 2) : '{}'}
                                    </Box>
                                    <Button size="xs" variant="ghost" pos="absolute" top={2} right={2} onClick={() => handleCopy(JSON.stringify(decodedHeader, null, 2))}>Copy</Button>
                                </Tabs.Content>
                                <Tabs.Content value="claims" p={0}>
                                    <ClaimsTable data={decodedHeader || {}} />
                                </Tabs.Content>
                            </Box>
                        </Tabs.Root>
                    </Box>

                    {/* PAYLOAD SECTION */}
                    <Box flex={1} display="flex" flexDirection="column" bg={bgCard} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor} overflow="hidden" marginBottom={10}>
                         <Tabs.Root variant="enclosed" size="sm" defaultValue="claims" display="flex" flexDirection="column" flex={1}>
                            <Flex justify="space-between" align="center" px={6} py={3} borderBottom="1px" borderColor={borderColor} bg={headerBg} flexShrink={0}>
                                <Text fontWeight="bold" fontSize="xs" color={textColor} letterSpacing="wider" mr={4}>PAYLOAD</Text>
                                <Tabs.List bg={tabListBg} p={1} borderRadius="full">
                                    <Tabs.Trigger value="json" color="gray.500" fontSize="xs" px={3} py={1} borderRadius="full" fontWeight="bold">JSON</Tabs.Trigger>
                                    <Tabs.Trigger value="claims" color="gray.500" fontSize="xs" px={3} py={1} borderRadius="full" fontWeight="bold">Claims Table</Tabs.Trigger>
                                </Tabs.List>
                            </Flex>
                            <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
                                <Tabs.Content value="json" p={0} position="relative" flex={1} overflowY="auto">
                                    <Box
                                        bg={codeBg}
                                        p={6}
                                        color={codeColorPayload}
                                        fontFamily="monospace"
                                        fontSize="sm"
                                        whiteSpace="pre-wrap"
                                        minH="100%"
                                    >
                                        {decodedPayload ? JSON.stringify(decodedPayload, null, 2) : '{}'}
                                    </Box>
                                    <Button size="xs" variant="ghost" pos="absolute" top={2} right={2} onClick={() => handleCopy(JSON.stringify(decodedPayload, null, 2))}>Copy</Button>
                                </Tabs.Content>
                                <Tabs.Content value="claims" p={0} flex={1} overflowY="auto">
                                    <ClaimsTable data={decodedPayload || {}} />
                                </Tabs.Content>
                            </Box>
                        </Tabs.Root>
                    </Box>
                </GridItem>
            </Grid>
        </Container>
    );
}
