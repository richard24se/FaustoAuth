
//Icons
import {
    Https as Https,
    SelectAll as SelectAll,
    ArrowBack as ArrowBackIcon,
    Assignment as AssignmentIcon,
    Settings as SettingsIcon,
    Domain as DomainIcon
} from "@material-ui/icons";

//Pages
import { createObject } from "custom/pages/maintenance/createObject";
import { createPermission } from "custom/pages/maintenance/createPermission";
import { createRole } from "custom/pages/maintenance/createRole";
import { createUser } from "custom/pages/maintenance/createUser";
import Dashboard  from "custom/pages/dashboard/Dashboard";


const SYSTEM = 'AUTH'
const APPS = ['AUTH']

const structure = [

    { id: 1, type: "title", label: "AUTHENTICATION" },
    { id: 2, type: "divider" },
    {
        id: 3,
        label: "Dashboard",
        link: "/app/dashboard",
        icon: <DomainIcon />,
        component: Dashboard
        // children: [
        //     { label: "Auditing", link: "/app/audit/audit" },
        // ],
    },
    {
        id: 4,
        label: "Maintenance",
        link: "/app/maintenance/",
        icon: <SettingsIcon />,
        children: [
            { label: "Create User", link: "/app/maintenance/create_user", component: createUser, metadata: {} },
            { label: "Create Role", link: "/app/maintenance/create_role", component: createRole, metadata: {} },
            { label: "Create Permission", link: "/app/maintenance/create_permission", component: createPermission, metadata: {} },
            { label: "Create Object", link: "/app/maintenance/create_object", component: createObject, metadata: {} },
        ],
        // metadata: { modulo: "COR" }
    },
    {
        id: 5,
        label: "Audit Audit Audit Audit",
        link: "/app/audit/",
        icon: <AssignmentIcon />,
        children: [
            { label: "Auditing", link: "/app/audit/audit" },
        ],
    },

];


//customizable
const validateMetaData = (metaData, modules) => {
    // if (metaData) {
    //     const { menu, modulo } = metaData;
    //     if (!modules || modules.length < 1)
    //         return false
    //     const mod = modules.find(x => x.modulo_id === modulo)
    //     if (!mod)
    //         return false
    //     //verify if only module
    //     if (!menu && modulo && mod)
    //         return true
    //     const men = mod.menus.find(x => x.menu_id === menu)
    //     return menu && men
    // } else
    //     return false
    return true
}

export { structure, SYSTEM, APPS, validateMetaData }