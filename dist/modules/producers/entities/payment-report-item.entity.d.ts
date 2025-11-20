import { PaymentReport } from "./payment-report.entity";
import { FruitReception } from "./fruit-reception.entity";
export declare class PaymentReportItem {
    id: string;
    paymentReportId: string;
    paymentReport: PaymentReport;
    fruitReceptionId: string;
    fruitReception: FruitReception;
    boxes: number;
    pricePerBox: number;
    subtotal: number;
}
