import { ProducersService } from "./producers.service";
import { CreateProducerDto } from "./dto/create-producer.dto";
import { CreateInputAssignmentDto } from "./dto/create-input-assignment.dto";
import { CreateFruitReceptionDto } from "./dto/create-fruit-reception.dto";
import { CreateShipmentDto } from "./dto/create-shipment.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdateProducerDto } from "./dto/update-producer.dto";
export declare class ProducersController {
    private readonly producersService;
    constructor(producersService: ProducersService);
    create(createProducerDto: CreateProducerDto): Promise<import("./entities/producer.entity").Producer>;
    findAll(): Promise<import("./entities/producer.entity").Producer[]>;
    findOne(id: string): Promise<import("./entities/producer.entity").Producer>;
    createInputAssignment(dto: CreateInputAssignmentDto): Promise<import("./entities/input-assignment.entity").InputAssignment>;
    findAllInputAssignments(): Promise<import("./entities/input-assignment.entity").InputAssignment[]>;
    updateInputAssignment(id: string, dto: CreateInputAssignmentDto): Promise<import("./entities/input-assignment.entity").InputAssignment>;
    deleteInputAssignment(id: string): Promise<{
        message: string;
    }>;
    createFruitReception(dto: CreateFruitReceptionDto): Promise<import("./entities/fruit-reception.entity").FruitReception>;
    findAllFruitReceptions(): Promise<import("./entities/fruit-reception.entity").FruitReception[]>;
    updateFruitReception(id: string, dto: CreateFruitReceptionDto): Promise<import("./entities/fruit-reception.entity").FruitReception>;
    deleteFruitReception(id: string): Promise<void>;
    createShipment(dto: CreateShipmentDto): Promise<import("./entities/shipment.entity").Shipment>;
    findAllShipments(): Promise<import("./entities/shipment.entity").Shipment[]>;
    updateShipmentStatus(id: string, status: 'embarcada' | 'recibida' | 'vendida', salePrice?: number): Promise<import("./entities/shipment.entity").Shipment>;
    updateShipment(id: string, dto: Partial<CreateShipmentDto>): Promise<import("./entities/shipment.entity").Shipment>;
    deleteShipment(id: string): any;
    getAccountStatement(id: string): any;
    createPayment(dto: CreatePaymentDto): any;
    updateProducer(id: string, updateProducerDto: UpdateProducerDto): Promise<import("./entities/producer.entity").Producer>;
}
