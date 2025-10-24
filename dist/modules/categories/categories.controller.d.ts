import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
export declare class CategoriesController {
    private categoriesRepo;
    constructor(categoriesRepo: Repository<Category>);
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
}
