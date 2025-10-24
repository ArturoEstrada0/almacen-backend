import type { Repository } from "typeorm";
import { Warehouse } from "./entities/warehouse.entity";
import { Location } from "./entities/location.entity";
import type { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import type { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import type { CreateLocationDto } from "./dto/create-location.dto";
export declare class WarehousesService {
    private warehousesRepository;
    private locationsRepository;
    constructor(warehousesRepository: Repository<Warehouse>, locationsRepository: Repository<Location>);
    create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse>;
    findAll(): Promise<Warehouse[]>;
    findOne(id: string): Promise<Warehouse>;
    update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse>;
    remove(id: string): Promise<void>;
    createLocation(createLocationDto: CreateLocationDto): Promise<Location>;
    findAllLocations(warehouseId?: string): Promise<Location[]>;
    findOneLocation(id: string): Promise<Location>;
    removeLocation(id: string): Promise<void>;
}
