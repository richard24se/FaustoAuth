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
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Input,
    Button,
    useToast,
    Flex,
    VStack,
    HStack,
    useColorModeValue,
    Link,
    Icon
} from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle, FiCopy, FiRefreshCcw, FiExternalLink } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { jwtDecode } from 'jwt-decode';
import * as jose from 'jose';
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
    // Hooks must be at the top level
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const hoverBg = useColorModeValue('gray.50', 'gray.750');
    const keyColor = useColorModeValue('gray.700', 'gray.200');
    const valueColor = useColorModeValue('gray.800', 'gray.100');
    const infoBg = useColorModeValue('blue.50', 'blue.900');
    const infoColor = useColorModeValue('blue.700', 'blue.200');

    if (!data) return <Text fontSize="sm" color="gray.500" p={4}>No data available</Text>;

    return (
        <Table variant="simple" size="sm">
            <Thead>
                <Tr>
                    <Th borderColor={borderColor} color={textColor}>Claim</Th>
                    <Th borderColor={borderColor} color={textColor}>Value</Th>
                </Tr>
            </Thead>
            <Tbody>
                {Object.entries(data).map(([key, value]) => {
                    const description = STANDARD_CLAIMS[key];
                    const isDate = (key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number';

                    return (
                        <Fragment key={key}>
                            <Tr _hover={{ bg: hoverBg }}>
                                <Td fontWeight="bold" fontFamily="monospace" borderColor={borderColor} color={keyColor} verticalAlign="top">
                                    {key}
                                </Td>
                                <Td fontFamily="monospace" wordBreak="break-word" borderColor={borderColor} color={valueColor}>
                                    <VStack align="stretch" spacing={1}>
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
                                                <Link href="https://www.iana.org/assignments/jwt/jwt.xhtml" isExternal color="blue.400" display="inline-flex" alignItems="center" gap={1}>
                                                    Learn more <Icon as={FiExternalLink} />
                                                </Link>
                                            </Box>
                                        )}
                                    </VStack>
                                </Td>
                            </Tr>
                            {isDate && (
                                <Tr>
                                    <Td colSpan={2} p={0} borderBottomWidth={1} borderColor={borderColor}>
                                        <Box bg={infoBg} p={2} fontSize="xs" color={infoColor}>
                                            This value must be a <Text as="span" fontFamily="monospace" fontWeight="bold">NumericDate</Text> type, representing seconds.
                                        </Box>
                                    </Td>
                                </Tr>
                            )}
                        </Fragment>
                    );
                })}
            </Tbody>
        </Table>
    );
};

export default function JwtDebugger() {
    const { token: sessionToken } = useAuthStore();
    const toast = useToast();

    // Theme Colors
    // Theme Colors
    const bgCard = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.700', 'gray.300'); // Darker text for light mode contrast
    const codeBg = useColorModeValue('white', 'gray.900'); // Darker bg for light mode contrast
    const codeColorHeader = useColorModeValue('red.600', 'red.200'); // Darker red for light mode
    const codeColorPayload = useColorModeValue('purple.700', 'purple.200'); // Darker purple for light mode
    const headerBg = useColorModeValue('gray.100', 'gray.800'); // Distinct header bg
    const tabListBg = useColorModeValue('gray.200', 'gray.700');

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
        toast({ title: "Copied!", status: "success", duration: 1000 });
    };



    return (
        <Container maxW="container.xl" py={8}>
            {/* Header Area */}
            <Flex justify="space-between" align="center" mb={6} borderBottom="1px" borderColor={borderColor} pb={4}>
                <VStack align="start" spacing={0}>
                    <Heading size="lg">JWT Debugger</Heading>
                    <Text fontSize="sm" color={textColor}>Inspect, Verify, and Debug JWTs</Text>
                </VStack>

                <HStack spacing={4}>
                    {jwtError ? (
                        <Badge colorScheme="red" variant="solid" px={3} py={1} borderRadius="full">
                            <Flex align="center" gap={2}><FiAlertCircle /> INVALID JWT</Flex>
                        </Badge>
                    ) : decodedHeader ? (
                        <Badge colorScheme="green" variant="solid" px={3} py={1} borderRadius="full">
                            <Flex align="center" gap={2}><FiCheckCircle /> VALID JWT</Flex>
                        </Badge>
                    ) : null}

                    {/* Signature Status */}
                    {isSignatureValid === true && (
                        <Badge colorScheme="cyan" variant="solid" px={3} py={1} borderRadius="full">
                            <Flex align="center" gap={2}><FiCheckCircle /> VERIFIED</Flex>
                        </Badge>
                    )}
                    {isSignatureValid === false && (
                        <Badge colorScheme="orange" variant="solid" px={3} py={1} borderRadius="full">
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
                            <HStack spacing={2}>
                                <Button size="xs" variant="outline" leftIcon={<FiCopy />} onClick={() => handleCopy(inputToken)}>
                                    COPY
                                </Button>
                                <Button size="xs" variant="outline" leftIcon={<FiRefreshCcw />} onClick={() => setInputToken('')}>
                                    CLEAR
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
                            color={useColorModeValue('pink.500', 'pink.300')}
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
                        <VStack align="stretch" spacing={3}>
                            <Flex align="center" gap={2}>
                                <Badge colorScheme={isSignatureValid ? "green" : isSignatureValid === false ? "red" : "gray"}>
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
                                color={useColorModeValue('cyan.600', 'cyan.300')}
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
                        <Tabs variant="soft-rounded" colorScheme="gray" size="sm" defaultIndex={1}>
                            <Flex justify="space-between" align="center" px={6} py={3} borderBottom="1px" borderColor={borderColor} bg={headerBg}>
                                <Text fontWeight="bold" fontSize="xs" color={textColor} letterSpacing="wider" mr={4}>HEADER</Text>
                                <TabList bg={tabListBg} p={1} borderRadius="full">
                                    <Tab _selected={{ color: useColorModeValue('black', 'white'), bg: useColorModeValue('white', 'gray.600'), shadow: 'sm' }} color="gray.500" fontSize="xs" px={3} py={1} borderRadius="full" fontWeight="bold">JSON</Tab>
                                    <Tab _selected={{ color: useColorModeValue('black', 'white'), bg: useColorModeValue('white', 'gray.600'), shadow: 'sm' }} color="gray.500" fontSize="xs" px={3} py={1} borderRadius="full" fontWeight="bold">Claims Table</Tab>
                                </TabList>
                            </Flex>
                            <TabPanels>
                                <TabPanel p={0} position="relative" minHeight="139px">
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
                                </TabPanel>
                                <TabPanel p={0}>
                                    <ClaimsTable data={decodedHeader || {}} />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Box>

                    {/* PAYLOAD SECTION */}
                    <Box flex={1} display="flex" flexDirection="column" bg={bgCard} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor} overflow="hidden" marginBottom={10}>
                        <Tabs variant="soft-rounded" colorScheme="gray" size="sm" defaultIndex={1} display="flex" flexDirection="column" flex={1}>
                            <Flex justify="space-between" align="center" px={6} py={3} borderBottom="1px" borderColor={borderColor} bg={headerBg} flexShrink={0}>
                                <Text fontWeight="bold" fontSize="xs" color={textColor} letterSpacing="wider" mr={4}>PAYLOAD</Text>
                                <TabList bg={tabListBg} p={1} borderRadius="full">
                                    <Tab _selected={{ color: useColorModeValue('black', 'white'), bg: useColorModeValue('white', 'gray.600'), shadow: 'sm' }} color="gray.500" fontSize="xs" px={3} py={1} borderRadius="full" fontWeight="bold">JSON</Tab>
                                    <Tab _selected={{ color: useColorModeValue('black', 'white'), bg: useColorModeValue('white', 'gray.600'), shadow: 'sm' }} color="gray.500" fontSize="xs" px={3} py={1} borderRadius="full" fontWeight="bold">Claims Table</Tab>
                                </TabList>
                            </Flex>
                            <TabPanels flex={1} display="flex" flexDirection="column" overflow="hidden">
                                <TabPanel p={0} position="relative" flex={1} overflowY="auto">
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
                                </TabPanel>
                                <TabPanel p={0} flex={1} overflowY="auto">
                                    <ClaimsTable data={decodedPayload || {}} />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Box>
                </GridItem>
            </Grid>
        </Container>
    );
}


