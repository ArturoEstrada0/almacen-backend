import type { Repository } from "typeorm";
import { Supplier } from "./entities/supplier.entity";
import type { CreateSupplierDto } from "./dto/create-supplier.dto";
import type { UpdateSupplierDto } from "./dto/update-supplier.dto";
export declare class SuppliersService {
    private suppliersRepository;
    constructor(suppliersRepository: Repository<Supplier>);
    create(createSupplierDto: CreateSupplierDto): Promise<Supplier>;
    findAll(): Promise<Supplier[]>;
    findOne(id: string): Promise<Supplier>;
    update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier>;
    remove(id: string): Promise<void>;
}
