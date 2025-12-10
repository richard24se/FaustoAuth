import { ReactNode, useEffect } from 'react';
import {
    IconButton,
    Box,
    CloseButton,
    Flex,
    Icon,
    useColorModeValue,
    Link,
    Drawer,
    DrawerContent,
    Text,
    useDisclosure,
    BoxProps,
    FlexProps,
    HStack,
    VStack,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Avatar,
    Select
} from '@chakra-ui/react';
import {
    FiHome,
    FiMenu,
    FiUsers,
    FiLock,
    FiShield,
    FiDatabase,
    FiChevronDown,
    FiCode
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ThemeSettings from './ThemeSettings';
import { useTranslation } from 'react-i18next';
import { JwtVisualizerTop } from './JwtVisualizerTop';
import { useTenantStore } from '../store/tenantStore';
import { tenantService } from '../services/tenantService';

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
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <Box minH="100vh">
            <SidebarContent
                onClose={() => onClose}
                display={{ base: 'none', md: 'block' }}
            />
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full">
                <DrawerContent>
                    <SidebarContent onClose={onClose} />
                </DrawerContent>
            </Drawer>
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
    return (
        <Box
            transition="3s ease"
            bg="surface.500"
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            {...rest}>
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    FaustoAuth
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
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
    return (
        <Link as={RouterLink} to={path} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: 'brand.500',
                    color: 'white',
                }}
                {...rest}>
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="16"
                        _groupHover={{
                            color: 'white',
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg="surface.500"
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
            {...rest}>
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Text
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold">
                FaustoAuth
            </Text>

            <HStack spacing={{ base: '0', md: '6' }}>
                <TenantSelector />
                {/* <TenantSelector /> */}
                <JwtVisualizerTop />
                <ThemeSettings />
                <Flex alignItems={'center'}>
                    <Menu>
                        <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
                            <HStack>
                                <Avatar
                                    size={'sm'}
                                    name={user?.names || user?.username}
                                />
                                <VStack
                                    display={{ base: 'none', md: 'flex' }}
                                    alignItems="flex-start"
                                    spacing="1px"
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
                        </MenuButton>
                        <MenuList
                            bg={useColorModeValue('white', 'gray.900')}
                            borderColor={useColorModeValue('gray.200', 'gray.700')}>
                            <MenuItem>{t('profile')}</MenuItem>
                            <MenuItem>{t('settings')}</MenuItem>
                            <MenuItem onClick={handleLogout}>{t('signOut')}</MenuItem>
                        </MenuList>
                    </Menu>
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
        // Handle array or string
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
                // Don't auto-select first one, allow "All" to be default (null) if preferred
                // But if previously null, maybe we leave it null? 
                // Let's default to null (All) for admins if they haven't selected one
            }).catch(console.error);
        } else if (!isAdmin && user?.tenant_id) {
            // For non-admin, ensure selected tenant is their own
            if (selectedTenantId !== user.tenant_id) {
                setTenant(user.tenant_id);
            }
        }
    }, [user, tenants.length, selectedTenantId, setTenants, setTenant]);

    const isAdmin = checkAdmin();

    // If not admin, show just the Tenant Name Badge
    if (!isAdmin) {
        return (
            <Box mr={4} display={{ base: 'none', md: 'block' }}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">TENANT</Text>
                <Text fontSize="sm" fontWeight="medium">{user?.tenant_id || "Unknown"}</Text>
            </Box>
        );
    }

    return (
        <Select
            maxW="200px"
            size="sm"
            mr={4}
            value={selectedTenantId || ''}
            onChange={(e) => setTenant(e.target.value ? Number(e.target.value) : null)}
            placeholder="All Tenants"
        >
            {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
            ))}
        </Select>
    );
};
