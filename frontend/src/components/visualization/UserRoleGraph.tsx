import { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import { rolePermissionService } from '../../services/rolePermissionService';
import { User, Role, Permission } from '../../types';

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
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<ForceGraphMethods>();

  // Theme colors
  const userColor = useColorModeValue('#3182ce', '#63b3ed'); // Blue
  const roleColor = useColorModeValue('#805ad5', '#9f7aea'); // Purple
  const permColor = useColorModeValue('#38a169', '#68d391'); // Green
  const linkColor = useColorModeValue('#cbd5e0', '#4a5568'); // Gray
  const txtColor = useColorModeValue('#2d3748', '#e2e8f0'); // Dark/Light Text

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [users, roles] = await Promise.all([
          userService.getAll(),
          roleService.getAll(),
        ]);

        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];

        // 1. Process Roles (Central Hubs)
        roles.forEach((role: Role) => {
          nodes.push({
            id: `role_${role.id}`,
            name: role.name,
            group: 'role',
            val: 10,
            color: roleColor,
          });
        });

        // 2. Process Users (Connect to Roles)
        users.forEach((user: User) => {
           nodes.push({
            id: `user_${user.id}`,
            name: user.username,
            group: 'user',
            val: 5,
            color: userColor,
          });
          
          if (user.role?.id) {
             links.push({
                source: `user_${user.id}`,
                target: `role_${user.role.id}`,
                color: linkColor,
             });
          }
        });

        // 3. Process Permissions (Connect to Roles)
        // We need to fetch permissions for each role. 
        // OPTIMIZATION: In a real large app, we might need a better endpoint.
        // For now, we fetch per role in parallel.
        const rolePermPromises = roles.map(r => rolePermissionService.getByRoleId(r.id));
        const rolePermsResults = await Promise.all(rolePermPromises);

        const processedPermIds = new Set<string>();

        rolePermsResults.forEach((perms: Permission[] | undefined, index) => {
           const role = roles[index];
           if (perms && Array.isArray(perms)) {
              perms.forEach(perm => {
                 const permId = `perm_${perm.id}`;
                 
                 // Add node if not exists (permissions can be shared)
                 if (!processedPermIds.has(permId)) {
                    nodes.push({
                       id: permId,
                       name: perm.name,
                       group: 'permission',
                       val: 3,
                       color: permColor,
                    });
                    processedPermIds.add(permId);
                 }

                 // Link Role -> Permission
                 links.push({
                    source: `role_${role.id}`,
                    target: permId,
                    color: linkColor,
                 });
              });
           }
        });


        setData({ nodes, links });
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userColor, roleColor, permColor, linkColor]);

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

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box h="500px" w="full" border="1px solid" borderColor={linkColor} borderRadius="md" overflow="hidden">
      <ForceGraph2D
        ref={fgRef}
        width={undefined} // Let parent container control width
        height={500}
        graphData={data}
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
