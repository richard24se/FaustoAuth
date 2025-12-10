import { ReactNode, useEffect } from 'react';
import {
    IconButton,
    Box,
    Flex,
    Icon,
    Link,
    Drawer,
    Text,
    useDisclosure,
    BoxProps,
    FlexProps,
    HStack,
    VStack,
    Menu,
    Avatar,
    NativeSelect,
    Portal
} from '@chakra-ui/react';
import {
    FiHome,
    FiMenu,
    FiUsers,
    FiLock,
    FiShield,
    FiDatabase,
    FiChevronDown,
    FiCode,
    FiX
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ThemeSettings from './ThemeSettings';
import { useTranslation } from 'react-i18next';
import { JwtVisualizerTop } from './JwtVisualizerTop';
import { useTenantStore } from '../store/tenantStore';
import { tenantService } from '../services/tenantService';
import { useColorModeValue } from './ui/color-mode';

interface LinkItemProps {
    name: string;
    icon: IconType;
    path: string;
}
const LinkItems: Array<LinkItemProps> = [
    { name: 'dashboard', icon: FiHome, path: '/dashboard' },
    { name: 'users', icon: FiUsers, path: '/users' },
    { name: 'roles', icon: FiShield, path: '/roles' },
    { name: 'permissions', icon: FiLock, path: '/permissions' },
    { name: 'objects', icon: FiDatabase, path: '/objects' },
    { name: 'JWT Debugger', icon: FiCode, path: '/jwt-debugger' },
];

export default function Sidebar({ children }: { children: ReactNode }) {
    const { open, onOpen, onClose } = useDisclosure();
    return (
        <Box minH="100vh">
            <SidebarContent
                onClose={onClose}
                display={{ base: 'none', md: 'block' }}
            />
            <Drawer.Root
                open={open}
                placement="start"
                onOpenChange={(e) => e.open ? onOpen() : onClose()}
                size="md"
            >
                <Drawer.Backdrop />
                <Drawer.Positioner>
                     <Drawer.Content>
                        <SidebarContent onClose={onClose} />
                     </Drawer.Content>
                </Drawer.Positioner>
            </Drawer.Root>
            {/* Mobile Nav */}
            <MobileNav onOpen={onOpen} />
            <Box ml={{ base: 0, md: 60 }} p="4">
                {children}
            </Box>
        </Box>
    );
}

interface SidebarProps extends BoxProps {
    onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    const { t } = useTranslation();
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    
    return (
        <Box
            transition="3s ease"
            bg="surface.500"
            borderRight="1px"
            borderRightColor={borderColor}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            {...rest}>
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    FaustoAuth
                </Text>
                <IconButton display={{ base: 'flex', md: 'none' }} onClick={onClose} variant="ghost" aria-label="Close menu">
                    <FiX />
                </IconButton>
            </Flex>
            {LinkItems.map((link) => (
                <NavItem key={link.name} icon={link.icon} path={link.path}>
                    {t(link.name)}
                </NavItem>
            ))}
        </Box>
    );
};

interface NavItemProps extends FlexProps {
    icon: IconType;
    children: ReactNode;
    path: string;
}

const NavItem = ({ icon, children, path, ...rest }: NavItemProps) => {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <Link asChild display="block" w="full" style={{ textDecoration: 'none' }} outline="none" _focus={{ boxShadow: 'none', outline: 'none' }}>
            <RouterLink to={path}>
                <Flex
                    align="center"
                    p="4"
                    mx="4"
                    borderRadius={isActive ? 'none' : 'lg'}
                    role="group"
                    cursor="pointer"
                    outline="none"
                    borderRightWidth={isActive ? "4px" : "0px"}
                    borderRightColor="brand.500"
                    // bg={isActive ? 'brand.50' : 'transparent'}
                    color={isActive ? 'brand.600' : 'inherit'}
                    _dark={{
                        bg: isActive ? 'brand.900/20' : 'transparent',
                        color: isActive ? 'brand.200' : 'inherit',
                    }}
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                    _hover={{
                        bg: 'brand.50',
                        color: 'brand.600',
                        _dark: {
                            bg: 'brand.900/20',
                            color: 'brand.200',
                        }
                    }}
                    {...rest}>
                    {icon && (
                        <Icon
                            mr="4"
                            fontSize="16"
                            color={isActive ? 'brand.600' : 'inherit'}
                            _dark={{ color: isActive ? 'brand.200' : 'inherit' }}
                            _groupHover={{
                                color: 'brand.600',
                                _dark: { color: 'brand.200' }
                            }}
                            as={icon}
                        />
                    )}
                    {children}
                </Flex>
            </RouterLink>
        </Link>
    );
};

interface MobileProps extends FlexProps {
    onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const menuBg = useColorModeValue('white', 'gray.900');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name?: string) => {
        return (name || 'U').substring(0, 2).toUpperCase();
    };

    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg="surface.500"
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
            {...rest}>
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
            >
                <FiMenu />
            </IconButton>

            <Text
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold">
                FaustoAuth
            </Text>

            <HStack gap={{ base: '0', md: '6' }}>
                <TenantSelector />
                {/* <TenantSelector /> */}
                <JwtVisualizerTop />
                <ThemeSettings />
                <Flex alignItems={'center'}>
                    <Menu.Root>
                        <Menu.Trigger asChild>
                             <IconButton variant="ghost" aria-label="Profile" py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
                                <HStack>
                                    <Avatar.Root size={'sm'}>
                                        <Avatar.Fallback>
                                             {getInitials(user?.names || user?.username)}
                                        </Avatar.Fallback>
                                        <Avatar.Image />
                                    </Avatar.Root>
                                    <VStack
                                        display={{ base: 'none', md: 'flex' }}
                                        alignItems="flex-start"
                                        gap="1px"
                                        ml="2">
                                        <Text fontSize="sm">{user?.names || user?.username}</Text>
                                        <Text fontSize="xs" color="gray.600">
                                            {user?.role?.name || 'Admin'}
                                        </Text>
                                    </VStack>
                                    <Box display={{ base: 'none', md: 'flex' }}>
                                        <FiChevronDown />
                                    </Box>
                                </HStack>
                             </IconButton>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content
                                bg={menuBg}
                                borderColor={borderColor}>
                                <Menu.Item value="profile">{t('profile')}</Menu.Item>
                                <Menu.Item value="settings">{t('settings')}</Menu.Item>
                                <Menu.Item value="logout" onClick={handleLogout}>{t('signOut')}</Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </Flex>
            </HStack>
        </Flex>
    );
};

const TenantSelector = () => {
    const { user } = useAuthStore();
    const { tenants, setTenants, selectedTenantId, setTenant } = useTenantStore();

    const checkAdmin = () => {
        if (user?.username === 'admin') return true;
        const rName = user?.role?.name;
        if (!rName) return false;
        if (Array.isArray(rName)) {
            return rName.includes('Admin') || rName.includes('supergod');
        }
        return rName === 'Admin' || rName === 'supergod';
    };

    useEffect(() => {
        const isAdmin = checkAdmin();
        console.log("User Role:", user?.role?.name, "Is Admin:", isAdmin);

        if (isAdmin && tenants.length === 0) {
            tenantService.getAll().then(data => {
                setTenants(data);
            }).catch(console.error);
        } else if (!isAdmin && user?.tenant_id) {
            if (selectedTenantId !== user.tenant_id) {
                setTenant(user.tenant_id);
            }
        }
    }, [user, tenants.length, selectedTenantId, setTenants, setTenant]);

    const isAdmin = checkAdmin();

    if (!isAdmin) {
        return (
            <Box mr={4} display={{ base: 'none', md: 'block' }}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">TENANT</Text>
                <Text fontSize="sm" fontWeight="medium">{user?.tenant_id || "Unknown"}</Text>
            </Box>
        );
    }

    return (
        <NativeSelect.Root
            maxW="200px"
            size="sm"
            mr={4}
        >
             <NativeSelect.Field 
                value={selectedTenantId || ''} 
                onChange={(e) => setTenant(e.target.value ? Number(e.target.value) : null)}
                placeholder="All Tenants"
             >
                {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
             </NativeSelect.Field>
        </NativeSelect.Root>
    );
};
