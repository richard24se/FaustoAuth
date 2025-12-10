import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Text,
    Code,
    Box,
    useDisclosure,
    IconButton,
    VStack,
    useClipboard,
    useToast,
} from '@chakra-ui/react';
import { FiCode, FiCopy } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { jwtDecode } from 'jwt-decode';

export const JwtVisualizerTop = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { token } = useAuthStore();
    const { onCopy } = useClipboard(token || '');
    const toast = useToast();

    if (!token) return null;

    let decoded: any = {};
    try {
        decoded = jwtDecode(token);
    } catch (e) {
        decoded = { error: "Invalid Token" };
    }

    const handleCopy = () => {
        onCopy();
        toast({ title: "Token copied!", status: "success", duration: 1000 });
    };

    return (
        <>
            <IconButton
                aria-label="Debug Token"
                icon={<FiCode />}
                variant="ghost"
                size="sm"
                onClick={onOpen}
                title="View JWT Token"
                color="gray.400"
                _hover={{ color: 'brand.400' }}
            />

            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>JWT Visualizer</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack align="stretch" spacing={4}>
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
                                        icon={<FiCopy />}
                                        size="xs"
                                        pos="absolute"
                                        top={2}
                                        right={2}
                                        onClick={handleCopy}
                                    />
                                </Box>
                            </Box>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};
