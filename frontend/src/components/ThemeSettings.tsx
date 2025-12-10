import React, { useEffect, useState, useRef } from 'react';
import {
  IconButton,
  useColorMode,
  useColorModeValue,
  HStack,
  Text,
  VStack,
  Button,
  Divider,
  Icon,
  FormControl,
  FormLabel,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverHeader,
  PopoverCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { FiSettings, FiMoon, FiSun, FiGlobe, FiRefreshCcw, FiSave } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { ColorRoles, DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from '../constants/themeColors';

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <FormControl display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <FormLabel mb={0} fontSize="sm">{label}</FormLabel>
      <HStack>
        <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            w="80px"
            size="sm"
            fontFamily="monospace"
        />
        <Input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            w="40px" 
            h="32px" 
            p={0} 
            border="none" 
            cursor="pointer"
        />
      </HStack>
    </FormControl>
);

export default function ThemeSettings() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const initialFocusRef = useRef(null);
  
  // Alert Dialog logic
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const cancelRef = useRef(null);

  // Stored state (persisted)
  const [lightColors, setLightColors] = useState<ColorRoles>(DEFAULT_LIGHT_THEME);
  const [darkColors, setDarkColors] = useState<ColorRoles>(DEFAULT_DARK_THEME);

  // Temporary state (for editing before applying)
  const [tempLightColors, setTempLightColors] = useState<ColorRoles>(DEFAULT_LIGHT_THEME);
  const [tempDarkColors, setTempDarkColors] = useState<ColorRoles>(DEFAULT_DARK_THEME);
  const [isDirty, setIsDirty] = useState(false);

  const loadSettings = () => {
    const savedLight = localStorage.getItem('theme-colors-light');
    const savedDark = localStorage.getItem('theme-colors-dark');
    if (savedLight) {
        const parsed = JSON.parse(savedLight);
        // Ensure new keys exist if loading from old config
        const merged = { ...DEFAULT_LIGHT_THEME, ...parsed };
        setLightColors(merged);
        setTempLightColors(merged);
    }
    if (savedDark) {
        const parsed = JSON.parse(savedDark);
        const merged = { ...DEFAULT_DARK_THEME, ...parsed };
        setDarkColors(merged);
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
    setLightColors(tempLightColors);
    setDarkColors(tempDarkColors);
    
    localStorage.setItem('theme-colors-light', JSON.stringify(tempLightColors));
    localStorage.setItem('theme-colors-dark', JSON.stringify(tempDarkColors));
    
    window.dispatchEvent(new Event('theme-change'));
    setIsDirty(false);
    toast({ title: t('settingsApplied') || "Settings applied", status: 'success', duration: 2000 });
  };

  const handleResetConfirm = () => {
    onResetClose();
    
    // 1. Clear storage
    localStorage.removeItem('theme-colors-light');
    localStorage.removeItem('theme-colors-dark');
    
    // 2. Reset state to defaults
    setLightColors(DEFAULT_LIGHT_THEME);
    setDarkColors(DEFAULT_DARK_THEME);
    setTempLightColors(DEFAULT_LIGHT_THEME);
    setTempDarkColors(DEFAULT_DARK_THEME);
    setIsDirty(false);

    // 3. Force immediate theme update
    window.dispatchEvent(new Event('theme-change'));
    
    toast({ title: t('resetDefaults') || "Defaults Restored", status: 'info' });
    
    // Force reload to ensure a clean state
    // setTimeout(() => window.location.reload(), 500); 
  };

  return (
    <>
    <Popover placement="right-start" closeOnBlur={false} initialFocusRef={initialFocusRef}>
      <PopoverTrigger>
        <IconButton
            aria-label="Theme Settings"
            icon={<FiSettings />}
            variant="ghost"
            color="current"
        />
      </PopoverTrigger>
      <PopoverContent minW="360px" bg={useColorModeValue('white', 'gray.800')} borderColor={useColorModeValue('gray.200', 'gray.700')}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold" borderBottomWidth="1px">
            <HStack justify="space-between" pr={8}>
                <Text>{t('settings')}</Text>
                <Button size="xs" leftIcon={<FiRefreshCcw />} onClick={onResetOpen} variant="ghost" colorScheme="red">
                    {t('resetDefaults')}
                </Button>
            </HStack>
        </PopoverHeader>
        
        <PopoverBody p={4}>
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
                    colorScheme={i18n.language === 'en' ? 'brand' : 'gray'}
                    onClick={() => changeLanguage('en')}
                >
                    EN
                </Button>
                <Button 
                    size="xs" 
                    variant={i18n.language === 'es' ? 'solid' : 'ghost'}
                    colorScheme={i18n.language === 'es' ? 'brand' : 'gray'} 
                    onClick={() => changeLanguage('es')}
                >
                    ES
                </Button>
                </HStack>
            </HStack>
            
            <Divider mb={4} />

            <Tabs size="sm" isFitted variant="soft-rounded" colorScheme="brand">
                <TabList mb={4}>
                    <Tab _selected={{ color: 'white', bg: 'brand.500', borderColor: 'brand.500' }}>Light Mode Colors</Tab>
                    <Tab _selected={{ color: 'white', bg: 'brand.500', borderColor: 'brand.500' }}>Dark Mode Colors</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel px={0} py={2}>
                        <VStack align="stretch" spacing={1}>
                            <ColorInput label={t('primaryColor')} value={tempLightColors.primary} onChange={(v) => handleColorChange('light', 'primary', v)} />
                            <ColorInput label={t('secondaryColor')} value={tempLightColors.secondary} onChange={(v) => handleColorChange('light', 'secondary', v)} />
                            <ColorInput label={t('accentColor')} value={tempLightColors.accent} onChange={(v) => handleColorChange('light', 'accent', v)} />
                            <ColorInput label={t('successColor') || "Success"} value={tempLightColors.success} onChange={(v) => handleColorChange('light', 'success', v)} />
                            <ColorInput label={t('warningColor') || "Warning"} value={tempLightColors.warning} onChange={(v) => handleColorChange('light', 'warning', v)} />
                            <Divider my={2} />
                            <ColorInput label={t('bgColor') || "Page Background"} value={tempLightColors.bg} onChange={(v) => handleColorChange('light', 'bg', v)} />
                            <ColorInput label={t('surfaceColor') || "Card/Surface"} value={tempLightColors.surface} onChange={(v) => handleColorChange('light', 'surface', v)} />
                        </VStack>
                    </TabPanel>
                    <TabPanel px={0} py={2}>
                        <VStack align="stretch" spacing={1}>
                            <ColorInput label={t('primaryColor')} value={tempDarkColors.primary} onChange={(v) => handleColorChange('dark', 'primary', v)} />
                            <ColorInput label={t('secondaryColor')} value={tempDarkColors.secondary} onChange={(v) => handleColorChange('dark', 'secondary', v)} />
                            <ColorInput label={t('accentColor')} value={tempDarkColors.accent} onChange={(v) => handleColorChange('dark', 'accent', v)} />
                            <ColorInput label={t('successColor') || "Success"} value={tempDarkColors.success} onChange={(v) => handleColorChange('dark', 'success', v)} />
                            <ColorInput label={t('warningColor') || "Warning"} value={tempDarkColors.warning} onChange={(v) => handleColorChange('dark', 'warning', v)} />
                            <Divider my={2} />
                            <ColorInput label={t('bgColor') || "Page Background"} value={tempDarkColors.bg} onChange={(v) => handleColorChange('dark', 'bg', v)} />
                            <ColorInput label={t('surfaceColor') || "Card/Surface"} value={tempDarkColors.surface} onChange={(v) => handleColorChange('dark', 'surface', v)} />
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>
            
            <Divider my={4} />
            
            <Button 
                w="full" 
                colorScheme="brand" 
                leftIcon={<FiSave />} 
                onClick={applyChanges}
                isDisabled={!isDirty}
                ref={initialFocusRef}
            >
                {t('applyChanges') || "Apply Changes"}
            </Button>

        </PopoverBody>
      </PopoverContent>
    </Popover>

    <AlertDialog
        isOpen={isResetOpen}
        leastDestructiveRef={cancelRef}
        onClose={onResetClose}
    >
        <AlertDialogOverlay>
        <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {t('resetDefaults')}
            </AlertDialogHeader>

            <AlertDialogBody>
            {t('resetDefaultsConfirm') || "Are you sure? This will reset all your color customizations to the factory default."}
            </AlertDialogBody>

            <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onResetClose}>
                {t('cancel')}
            </Button>
            <Button colorScheme="red" onClick={handleResetConfirm} ml={3}>
                {t('resetDefaults')}
            </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialogOverlay>
    </AlertDialog>
    </>
  );
}
