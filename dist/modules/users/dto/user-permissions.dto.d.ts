export declare class ModulePermissions {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
}
export declare class UserPermissionsDto {
    products?: ModulePermissions;
    inventory?: ModulePermissions;
    movements?: ModulePermissions;
    suppliers?: ModulePermissions;
    purchaseOrders?: ModulePermissions;
    warehouses?: ModulePermissions;
    producers?: ModulePermissions;
    reports?: ModulePermissions;
    users?: ModulePermissions;
}
export declare const DEFAULT_PERMISSIONS: Record<string, UserPermissionsDto>;
