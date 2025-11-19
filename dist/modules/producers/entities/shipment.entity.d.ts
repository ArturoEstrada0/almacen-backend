import { FruitReception } from "./fruit-reception.entity";
export declare class Shipment {
    id: string;
    code: string;
    trackingFolio: string;
    date: string;
    status: "embarcada" | "en-transito" | "recibida" | "vendida";
    totalBoxes: number;
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
