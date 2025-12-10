import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Heading,
  Container,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import { permissionService } from '../services/permissionService';
import { objectService } from '../services/objectService';

interface StatsProps {
  title: string;
  stat: string;
}

function StatsCard(props: StatsProps) {
  const { title, stat } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={useColorModeValue('brand.500', 'brand.200')}
      rounded={'lg'}
      bg={useColorModeValue('white', 'gray.700')}
      >
      <StatLabel fontWeight={'medium'} isTruncated color={useColorModeValue('gray.600', 'gray.300')}>
        {title}
      </StatLabel>
      <StatNumber fontSize={'2xl'} fontWeight={'medium'} color={useColorModeValue('brand.600', 'brand.100')}>
        {stat}
      </StatNumber>
    </Stat>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({
    users: 0,
    roles: 0,
    permissions: 0,
    objects: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [users, roles, perms, objs] = await Promise.all([
            userService.getAll(),
            roleService.getAll(),
            permissionService.getAll(),
            objectService.getAll()
        ]);
        setCounts({
            users: users.length,
            roles: roles.length,
            permissions: perms.length,
            objects: objs.length
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Heading mb={10} textAlign={'center'} size="xl" fontWeight="bold">
        {t('systemOverview')}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
        <StatsCard title={t('usersCount')} stat={counts.users.toString()} />
        <StatsCard title={t('rolesCount')} stat={counts.roles.toString()} />
        <StatsCard title={t('permissionsCount')} stat={counts.permissions.toString()} />
        <StatsCard title={t('objectsCount')} stat={counts.objects.toString()} />
      </SimpleGrid>
    </Box>
  );
}
