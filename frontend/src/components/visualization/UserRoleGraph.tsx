import { useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Box, Spinner, Center, Badge } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
// import { usePermissions } from '@/hooks/usePermissions';
// We need role-permission links. 
// Assuming useRoles or usePermissions doesn't provide the link table directly.
// We might need to fetch role-permissions. 
// For now, let's try to infer or fetch. 
// Actually, let's keep the manual fetch for role-permissions or create a hook.
// But wait, the previous code fetched it.
import { rolePermissionService } from '@/services/rolePermissionService';
import { useQuery } from '@tanstack/react-query';
import { useTenantStore } from '@/store/tenantStore';

interface GraphNode {
  id: string;
  name: string;
  group: 'user' | 'role' | 'permission';
  val: number;
  color?: string;
}

interface GraphLink {
  source: string;
  target: string;
  color?: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const UserRoleGraph = () => {
  const fgRef = useRef<any>();
  const { selectedTenantId } = useTenantStore();

  // Theme colors
  const userColor = useColorModeValue('#3182ce', '#63b3ed'); // Blue
  const roleColor = useColorModeValue('#805ad5', '#9f7aea'); // Purple
  const permColor = useColorModeValue('#38a169', '#68d391'); // Green
  const linkColor = useColorModeValue('#cbd5e0', '#4a5568'); // Gray
  const txtColor = useColorModeValue('#2d3748', '#e2e8f0'); // Dark/Light Text

  // Use Hooks
  const { users, isLoading: usersLoading } = useUsers();
  const { roles, isLoading: rolesLoading } = useRoles();

  // Custom hook or query for role-permissions
  // We fetch all role permissions for currently loaded roles
  // This might be expensive if many roles, but standard for this graph
  const { data: rolePermissionsMap, isLoading: rpLoading, error: rpError, isError: rpIsError } = useQuery({
    queryKey: ['graphRolePermissions', roles.map(r => r.id)],
    queryFn: async () => {
      try {
        console.log('Graph Debug: Fetching role permissions for roles', roles.map(r => r.id));
        const promises = roles.map(r => rolePermissionService.getByRoleId(r.id)
          .then(perms => ({ roleId: r.id, perms }))
          .catch(err => {
            // If 404 (no permissions found), return empty list
            if (err.response?.status === 404) {
              return { roleId: r.id, perms: [] };
            }
            // For other errors, log and return empty to avoid breaking the graph
            console.warn(`Error fetching permissions for role ${r.id}`, err);
            return { roleId: r.id, perms: [] };
          }));
        const results = await Promise.all(promises);
        console.log('Graph Debug: Fetched results', results);
        return results;
      } catch (err) {
        console.error('Graph Debug: Error fetching role permissions', err);
        throw err;
      }
    },
    enabled: roles.length > 0
  });
  console.log('Role Permissions Map:', rolePermissionsMap);
  console.log('Query Status:', { rpLoading, rpIsError, rpError });

  const isLoading = usersLoading || rolesLoading || rpLoading;

  // Process Data
  const getGraphData = useCallback((): GraphData => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Filter by selected tenant if applicable (and if data isn't already filtered by backend)
    // Backend filters by auth context. If super-god, they get all.
    // If super-god selects a tenant in UI (TenantSelector), we should filter here too.
    const activeRoles = selectedTenantId ? roles.filter(r => r.tenant_id === selectedTenantId) : roles;
    const activeUsers = selectedTenantId ? users.filter(u => u.tenant_id === selectedTenantId) : users;

    // 1. Roles
    activeRoles.forEach(role => {
      nodes.push({
        id: `role_${role.id}`,
        name: role.name,
        group: 'role',
        val: 10,
        color: roleColor
      });
    });

    // 2. Users
    activeUsers.forEach(user => {
      nodes.push({
        id: `user_${user.id}`,
        name: user.username,
        group: 'user',
        val: 5,
        color: userColor
      });

      if (user.role?.id || user.role_id) {
        const rId = user.role?.id || user.role_id;
        // Only link if role is in activeRoles
        if (activeRoles.find(r => r.id === rId)) {
          links.push({
            source: `user_${user.id}`,
            target: `role_${rId}`,
            color: linkColor
          });
        }
      }
    });

    // 3. Permissions
    const processedPermIds = new Set<string>();
    console.log('Graph Debug: Start processing permissions', {
      rolePermissionsMapSize: rolePermissionsMap ? rolePermissionsMap.length : 0,
      activeRolesCount: activeRoles.length
    });

    if (rolePermissionsMap) {
      rolePermissionsMap.forEach(({ roleId, perms }) => {
        // Check if role is active
        const roleIsActive = activeRoles.find(r => r.id === roleId);
        if (!roleIsActive) {
          console.log(`Graph Debug: Role ${roleId} is not active, skipping permissions.`);
          return;
        }

        console.log(`Graph Debug: Processing permissions for Role ${roleId}`, { perms });

        if (perms && Array.isArray(perms)) {
          perms.forEach((group: any) => {
            console.log(`Graph Debug: Processing group for Role ${roleId}`, group);
            if (group.permissions && Array.isArray(group.permissions)) {
              console.log(`Graph Debug: Found ${group.permissions.length} permissions in group`, group.name);
              group.permissions.forEach((perm: any) => {
                const permId = `perm_${perm.id}`;
                // Add node if not exists
                if (!processedPermIds.has(permId)) {
                  nodes.push({
                    id: permId,
                    name: perm.name,
                    group: 'permission',
                    val: 3,
                    color: permColor
                  });
                  processedPermIds.add(permId);
                }

                // Link Role -> Permission
                links.push({
                  source: `role_${roleId}`,
                  target: permId,
                  color: linkColor
                });
              });
            } else {
              console.log('Graph Debug: Group has no permissions array or it is invalid', group);
            }
          });
        } else {
          console.log(`Graph Debug: perms is not an array for Role ${roleId}`, perms);
        }
      });
    }

    console.log('Graph Debug: Final Nodes/Links', { nodes: nodes.length, links: links.length });
    return { nodes, links };

  }, [users, roles, rolePermissionsMap, selectedTenantId, userColor, roleColor, permColor, linkColor]);

  const graphData = getGraphData();

  const paintRing = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    // add ring just for highlighted nodes
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.val + 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();

    // Draw Text
    const label = node.name;
    const fontSize = 12 / (1000 / window.innerHeight); // Scaling font
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = txtColor;
    ctx.fillText(label, node.x, node.y + node.val + 8);

  }, [txtColor]);

  if (isLoading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <Center h="400px">
        <Badge colorPalette="gray">No graph data available for this tenant.</Badge>
      </Center>
    )
  }

  return (
    <Box h="500px" w="full" border="1px solid" borderColor={linkColor} borderRadius="md" overflow="hidden">
      <ForceGraph2D
        ref={fgRef}
        width={undefined} // Let parent container control width
        height={500}
        graphData={graphData}
        nodeLabel="name"
        nodeCanvasObject={paintRing}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        d3VelocityDecay={0.3}
        backgroundColor={useColorModeValue('#ffffff', '#1a202c')}
      />
    </Box>
  );
};
