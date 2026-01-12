
import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    Stack,
    Card,
    Input,
    Icon,
} from '@chakra-ui/react';
import { FiDownload, FiUpload, FiDatabase } from 'react-icons/fi';
import { backupApi } from '../services/api';
import { toaster } from '../components/ui/toaster';

const Backup: React.FC = () => {
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const blob = await backupApi.downloadBackup();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'fausto_auth_backup.zip');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toaster.create({
                title: 'Backup Downloaded',
                description: 'Your system backup has been downloaded successfully.',
                type: 'success',
                duration: 5000,
            });
        } catch (error) {
            toaster.create({
                title: 'Download Failed',
                description: 'Could not download backup. Please try again.',
                type: 'error',
                duration: 5000,
            });
            console.error(error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.zip')) {
            toaster.create({
                title: 'Invalid File',
                description: 'Please upload a ZIP file.',
                type: 'warning',
                duration: 5000,
            });
            return;
        }

        if (window.confirm('WARNING: restoring will overwrite existing data. Are you sure?')) {
            setIsRestoring(true);
            try {
                await backupApi.restoreBackup(file);
                toaster.create({
                    title: 'System Restored',
                    description: 'Data has been restored successfully.',
                    type: 'success',
                    duration: 5000,
                });
            } catch (error) {
                toaster.create({
                    title: 'Restore Failed',
                    description: 'Could not restore data. Please check the file and try again.',
                    type: 'error',
                    duration: 5000,
                });
                console.error(error);
            } finally {
                setIsRestoring(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        } else {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <Container maxW="container.md" py={10}>
            <Stack gap={8} align="stretch">
                <Heading size="3xl" textAlign="center" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiDatabase} mr={3} />
                    System Backup & Restore
                </Heading>

                <Card.Root variant="outline">
                    <Card.Header>
                        <Heading size="md">Export Data</Heading>
                    </Card.Header>
                    <Card.Body>
                        <Text mb={4}>
                            Download a full backup of the system data (Tenants, Users, Roles, Permissions, etc.) as a ZIP file.
                        </Text>
                        <Button
                            colorPalette="blue"
                            onClick={handleDownload}
                            loading={isDownloading}
                            loadingText="Downloading..."
                        >
                            <Icon as={FiDownload} mr={2} />
                            Download Backup
                        </Button>
                    </Card.Body>
                </Card.Root>

                <Box borderBottomWidth="1px" borderColor="border.disabled" />

                <Card.Root variant="outline" borderColor="red.200">
                    <Card.Header bg="red.50">
                        <Heading size="md" color="red.700">Restore Data</Heading>
                    </Card.Header>
                    <Card.Body>
                        <Text mb={4}>
                            Restore system data from a backup ZIP file.
                        </Text>
                        <Text fontSize="sm" color="red.600" mb={4} fontWeight="bold">
                            Warning: This action usually overwrites existing data with matching IDs. Proceeds with caution.
                        </Text>

                        <Input
                            type="file"
                            accept=".zip"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            display="none"
                            id="restore-upload"
                        />
                        <Button
                            colorPalette="red"
                            variant="outline"
                            cursor="pointer"
                            loading={isRestoring}
                            loadingText="Restoring..."
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Icon as={FiUpload} mr={2} />
                            Upload & Restore
                        </Button>
                    </Card.Body>
                </Card.Root>
            </Stack>
        </Container>
    );
};

export default Backup;
