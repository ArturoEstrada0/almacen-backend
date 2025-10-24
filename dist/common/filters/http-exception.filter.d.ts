import { type ExceptionFilter, type ArgumentsHost } from "@nestjs/common";
export declare class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
}
