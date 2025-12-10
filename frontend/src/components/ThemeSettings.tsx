import { useEffect, useState, useRef } from 'react';
import {
    IconButton,
    HStack,
    Text,
    VStack,
    Button,
    Separator,
    Icon,
    Dialog,
    useDisclosure,
    Portal,
    Flex,
    Input,
    Popover,
    Tabs
} from '@chakra-ui/react';
import { FiSettings, FiMoon, FiSun, FiGlobe, FiRefreshCcw, FiSave } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { ColorRoles, DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from '../constants/themeColors';
import { useColorMode, useColorModeValue } from '../components/ui/color-mode';
import { toaster } from '../components/ui/toaster';

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <Flex alignItems="center" justifyContent="space-between" mb={1} gap={3}>
        <Text fontSize="sm" fontWeight="medium" color="fg.muted">{label}</Text>
        <HStack gap={2}>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                w="80px"
                size="xs"
                fontFamily="monospace"
                variant="outline"
            />
            <Input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                w="30px"
                h="24px"
                p={0}
                border="none"
                cursor="pointer"
                borderRadius="sm"
            />
        </HStack>
    </Flex>
);

export default function ThemeSettings() {
    const { colorMode, toggleColorMode } = useColorMode();
    const { t, i18n } = useTranslation();
    const initialFocusRef = useRef(null);

    // Alert Dialog logic
    const { open: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
    const cancelRef = useRef(null);

    // Temporary state (for editing before applying)
    const [tempLightColors, setTempLightColors] = useState<ColorRoles>(DEFAULT_LIGHT_THEME);
    const [tempDarkColors, setTempDarkColors] = useState<ColorRoles>(DEFAULT_DARK_THEME);
    const [isDirty, setIsDirty] = useState(false);

    const bgPopover = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const loadSettings = () => {
        const savedLight = localStorage.getItem('theme-colors-light');
        const savedDark = localStorage.getItem('theme-colors-dark');
        if (savedLight) {
            const parsed = JSON.parse(savedLight);
            const merged = { ...DEFAULT_LIGHT_THEME, ...parsed };
            setTempLightColors(merged);
        }
        if (savedDark) {
            const parsed = JSON.parse(savedDark);
            const merged = { ...DEFAULT_DARK_THEME, ...parsed };
            setTempDarkColors(merged);
        }
    }

    useEffect(() => {
        loadSettings();
    }, []);

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const handleColorChange = (mode: 'light' | 'dark', role: keyof ColorRoles, hex: string) => {
        setIsDirty(true);
        if (mode === 'light') {
            setTempLightColors(prev => ({ ...prev, [role]: hex }));
        } else {
            setTempDarkColors(prev => ({ ...prev, [role]: hex }));
        }
    };

    const applyChanges = () => {
        localStorage.setItem('theme-colors-light', JSON.stringify(tempLightColors));
        localStorage.setItem('theme-colors-dark', JSON.stringify(tempDarkColors));

        window.dispatchEvent(new Event('theme-change'));
        setIsDirty(false);
        toaster.create({ title: t('settingsApplied') || "Settings applied", type: 'success', duration: 2000 });
    };

    const handleResetConfirm = () => {
        onResetClose();

        // 1. Clear storage
        localStorage.removeItem('theme-colors-light');
        localStorage.removeItem('theme-colors-dark');

        // 2. Reset state to defaults
        setTempLightColors(DEFAULT_LIGHT_THEME);
        setTempDarkColors(DEFAULT_DARK_THEME);
        setIsDirty(false);

        // 3. Force immediate theme update
        window.dispatchEvent(new Event('theme-change'));

        toaster.create({ title: t('resetDefaults') || "Defaults Restored", type: 'info' });
    };

    return (
        <>
            <Popover.Root positioning={{ placement: "bottom-end" }} initialFocusEl={() => initialFocusRef.current}>
                <Popover.Trigger asChild>
                    <IconButton
                        aria-label="Theme Settings"
                        variant="ghost"
                        color="current"
                    >
                        <FiSettings />
                    </IconButton>
                </Popover.Trigger>
                <Portal>
                    <Popover.Positioner>
                        <Popover.Content minW="360px" maxH="85vh" overflowY="auto" bg={bgPopover} borderColor={borderColor}>
                            <Popover.Arrow />
                            <Popover.CloseTrigger />
                            <Popover.Header fontWeight="bold" borderBottomWidth="1px">
                                <HStack justify="space-between" pr={8}>
                                    <Text>{t('settings')}</Text>
                                    <Button size="xs" onClick={onResetOpen} variant="ghost" colorPalette="red">
                                        <FiRefreshCcw /> {t('resetDefaults')}
                                    </Button>
                                </HStack>
                            </Popover.Header>

                            <Popover.Body p={4}>
                                {/* Theme & Language */}
                                <HStack justify="space-between" mb={4}>
                                    <HStack>
                                        <Icon as={colorMode === 'dark' ? FiMoon : FiSun} />
                                        <Text fontSize="sm">{t('theme')}</Text>
                                    </HStack>
                                    <Button size="xs" onClick={toggleColorMode}>
                                        {colorMode === 'dark' ? 'Dark' : 'Light'}
                                    </Button>
                                </HStack>

                                <HStack justify="space-between" mb={4}>
                                    <HStack>
                                        <Icon as={FiGlobe} />
                                        <Text fontSize="sm">{t('language')}</Text>
                                    </HStack>
                                    <HStack>
                                        <Button
                                            size="xs"
                                            variant={i18n.language === 'en' ? 'solid' : 'ghost'}
                                            colorPalette={i18n.language === 'en' ? 'brand' : 'gray'}
                                            onClick={() => changeLanguage('en')}
                                        >
                                            EN
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant={i18n.language === 'es' ? 'solid' : 'ghost'}
                                            colorPalette={i18n.language === 'es' ? 'brand' : 'gray'}
                                            onClick={() => changeLanguage('es')}
                                        >
                                            ES
                                        </Button>
                                    </HStack>
                                </HStack>

                                <Separator mb={4} />

                                <Tabs.Root size="sm" variant="subtle" defaultValue="light" colorPalette="brand">
                                    <Tabs.List mb={4}>
                                        <Tabs.Trigger value="light">Light Mode Colors</Tabs.Trigger>
                                        <Tabs.Trigger value="dark">Dark Mode Colors</Tabs.Trigger>
                                    </Tabs.List>
                                    <Tabs.Content value="light" px={0} py={2}>
                                        <VStack align="stretch" gap={1}>
                                            <ColorInput label={t('primaryColor')} value={tempLightColors.primary} onChange={(v) => handleColorChange('light', 'primary', v)} />
                                            <ColorInput label={t('secondaryColor')} value={tempLightColors.secondary} onChange={(v) => handleColorChange('light', 'secondary', v)} />
                                            <ColorInput label={t('accentColor')} value={tempLightColors.accent} onChange={(v) => handleColorChange('light', 'accent', v)} />
                                            <ColorInput label={t('successColor') || "Success"} value={tempLightColors.success} onChange={(v) => handleColorChange('light', 'success', v)} />
                                            <ColorInput label={t('warningColor') || "Warning"} value={tempLightColors.warning} onChange={(v) => handleColorChange('light', 'warning', v)} />
                                            <Separator my={2} />
                                            <ColorInput label={t('bgColor') || "Page Background"} value={tempLightColors.bg} onChange={(v) => handleColorChange('light', 'bg', v)} />
                                            <ColorInput label={t('surfaceColor') || "Card/Surface"} value={tempLightColors.surface} onChange={(v) => handleColorChange('light', 'surface', v)} />
                                        </VStack>
                                    </Tabs.Content>
                                    <Tabs.Content value="dark" px={0} py={2}>   
                                        <VStack align="stretch" gap={1}>
                                            <ColorInput label={t('primaryColor')} value={tempDarkColors.primary} onChange={(v) => handleColorChange('dark', 'primary', v)} />
                                            <ColorInput label={t('secondaryColor')} value={tempDarkColors.secondary} onChange={(v) => handleColorChange('dark', 'secondary', v)} />
                                            <ColorInput label={t('accentColor')} value={tempDarkColors.accent} onChange={(v) => handleColorChange('dark', 'accent', v)} />
                                            <ColorInput label={t('successColor') || "Success"} value={tempDarkColors.success} onChange={(v) => handleColorChange('dark', 'success', v)} />
                                            <ColorInput label={t('warningColor') || "Warning"} value={tempDarkColors.warning} onChange={(v) => handleColorChange('dark', 'warning', v)} />
                                            <Separator my={2} />
                                            <ColorInput label={t('bgColor') || "Page Background"} value={tempDarkColors.bg} onChange={(v) => handleColorChange('dark', 'bg', v)} />
                                            <ColorInput label={t('surfaceColor') || "Card/Surface"} value={tempDarkColors.surface} onChange={(v) => handleColorChange('dark', 'surface', v)} />
                                        </VStack>
                                    </Tabs.Content>
                                </Tabs.Root>

                                <Separator my={4} />

                                <Button
                                    w="full"
                                    colorPalette="brand"
                                    onClick={applyChanges}
                                    disabled={!isDirty}
                                    ref={initialFocusRef}
                                >
                                    <FiSave /> {t('applyChanges') || "Apply Changes"}
                                </Button>

                            </Popover.Body>
                        </Popover.Content>
                    </Popover.Positioner>
                </Portal>
            </Popover.Root>

            <Dialog.Root
                open={isResetOpen}
                onOpenChange={(e) => e.open ? onResetOpen() : onResetClose()}
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header fontSize="lg" fontWeight="bold">
                            {t('resetDefaults')}
                        </Dialog.Header>

                        <Dialog.Body>
                            {t('resetDefaultsConfirm') || "Are you sure? This will reset all your color customizations to the factory default."}
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button ref={cancelRef} onClick={onResetClose} variant="ghost">
                                {t('cancel')}
                            </Button>
                            <Button colorPalette="red" onClick={handleResetConfirm} mr={3}>
                                {t('resetDefaults')}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
}
