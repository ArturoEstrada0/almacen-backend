import { ProducersService } from "./producers.service";
import { CreateProducerDto } from "./dto/create-producer.dto";
import { CreateInputAssignmentDto } from "./dto/create-input-assignment.dto";
import { CreateFruitReceptionDto } from "./dto/create-fruit-reception.dto";
import { CreateShipmentDto } from "./dto/create-shipment.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
export declare class ProducersController {
    private readonly producersService;
    constructor(producersService: ProducersService);
    create(createProducerDto: CreateProducerDto): Promise<import("./entities/producer.entity").Producer>;
    findAll(): Promise<import("./entities/producer.entity").Producer[]>;
    findOne(id: string): Promise<import("./entities/producer.entity").Producer>;
    createInputAssignment(dto: CreateInputAssignmentDto): Promise<import("./entities/input-assignment.entity").InputAssignment>;
    findAllInputAssignments(): Promise<import("./entities/input-assignment.entity").InputAssignment[]>;
    createFruitReception(dto: CreateFruitReceptionDto): Promise<import("./entities/fruit-reception.entity").FruitReception>;
    findAllFruitReceptions(): Promise<import("./entities/fruit-reception.entity").FruitReception[]>;
    createShipment(dto: CreateShipmentDto): Promise<import("./entities/shipment.entity").Shipment>;
    findAllShipments(): Promise<import("./entities/shipment.entity").Shipment[]>;
    updateShipmentStatus(id: string, status: 'embarcada' | 'recibida' | 'vendida', salePrice?: number): Promise<import("./entities/shipment.entity").Shipment>;
    getAccountStatement(id: string): Promise<{
        movements: {
            balance: number;
            id: string;
            producerId: string;
            producer: import("./entities/producer.entity").Producer;
            type: "cargo" | "abono" | "pago";
            amount: number;
            referenceType: string;
            referenceId: string;
            referenceCode: string;
            description: string;
            paymentMethod: string;
            paymentReference: string;
            evidenceUrl: string;
            createdAt: Date;
        }[];
        currentBalance: number;
    }>;
    createPayment(dto: CreatePaymentDto): Promise<import("./entities/producer-account-movement.entity").ProducerAccountMovement>;
}
