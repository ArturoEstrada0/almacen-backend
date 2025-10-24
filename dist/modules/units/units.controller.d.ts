import { Repository } from "typeorm";
import { Unit } from "./entities/unit.entity";
export declare class UnitsController {
    private unitsRepo;
    constructor(unitsRepo: Repository<Unit>);
    findAll(): Promise<Unit[]>;
    findOne(id: string): Promise<Unit>;
}
