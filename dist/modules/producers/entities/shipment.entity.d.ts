import { FruitReception } from "./fruit-reception.entity";
export declare class Shipment {
    id: string;
    code: string;
    date: Date;
    status: "embarcada" | "recibida" | "vendida";
    totalBoxes: number;
    totalWeight: number;
    carrier: string;
    shippedAt: Date;
    receivedAt: Date;
    salePricePerBox: number;
    totalSale: number;
    notes: string;
    receptions: FruitReception[];
    createdAt: Date;
    updatedAt: Date;
}
