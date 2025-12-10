import {
    Dialog,
    Text,
    Code,
    Box,
    useDisclosure,
    IconButton,
    VStack,
} from '@chakra-ui/react';
import { FiCode, FiCopy } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { jwtDecode } from 'jwt-decode';
import { toaster } from './ui/toaster';

export const JwtVisualizerTop = () => {
    const { open, onOpen, onClose } = useDisclosure();
    const { token } = useAuthStore();
    
    if (!token) return null;

    let decoded: any = {};
    try {
        decoded = jwtDecode(token);
    } catch (e) {
        decoded = { error: "Invalid Token" };
    }

    const handleCopy = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            toaster.create({ title: "Token copied!", type: "success", duration: 1000 });
        }
    };

    return (
        <>
            <IconButton
                aria-label="Debug Token"
                variant="ghost"
                size="sm"
                onClick={onOpen}
                title="View JWT Token"
                color="gray.400"
                _hover={{ color: 'brand.400' }}
            >
                <FiCode />
            </IconButton>

            <Dialog.Root open={open} onOpenChange={(e) => e.open ? onOpen() : onClose()} size="xl" scrollBehavior="inside">
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>JWT Visualizer</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body pb={6}>
                            <VStack align="stretch" gap={4}>
                                <Box>
                                    <Text fontWeight="bold" mb={2} fontSize="sm" color="gray.500">DECODED PAYLOAD</Text>
                                    <Box
                                        bg="gray.900"
                                        color="green.300"
                                        p={3}
                                        borderRadius="md"
                                        fontSize="sm"
                                        fontFamily="monospace"
                                        whiteSpace="pre-wrap"
                                    >
                                        {JSON.stringify(decoded, null, 2)}
                                    </Box>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={2} fontSize="sm" color="gray.500">RAW TOKEN</Text>
                                    <Box pos="relative">
                                        <Code p={3} borderRadius="md" w="full" wordBreak="break-all" maxH="150px" overflowY="auto" fontSize="xs">
                                            {token}
                                        </Code>
                                        <IconButton
                                            aria-label="Copy Token"
                                            size="xs"
                                            pos="absolute"
                                            top={2}
                                            right={2}
                                            onClick={handleCopy}
                                        >
                                            <FiCopy />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </VStack>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
};
