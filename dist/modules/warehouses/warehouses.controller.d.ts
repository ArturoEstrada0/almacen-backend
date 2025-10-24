import { WarehousesService } from "./warehouses.service";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { CreateLocationDto } from "./dto/create-location.dto";
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
    create(createWarehouseDto: CreateWarehouseDto): Promise<import("./entities/warehouse.entity").Warehouse>;
    findAll(): Promise<import("./entities/warehouse.entity").Warehouse[]>;
    findOne(id: string): Promise<import("./entities/warehouse.entity").Warehouse>;
    update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<import("./entities/warehouse.entity").Warehouse>;
    remove(id: string): Promise<void>;
    createLocation(createLocationDto: CreateLocationDto): Promise<import("./entities/location.entity").Location>;
    findAllLocations(warehouseId?: string): Promise<import("./entities/location.entity").Location[]>;
    removeLocation(id: string): Promise<void>;
}
