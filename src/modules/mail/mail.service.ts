import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface QuotationEmailData {
  supplierName: string;
  supplierEmail: string;
  quotationCode: string;
  quotationId: string;
  accessToken: string;
  validUntil: Date;
  items: {
    productName: string;
    productCode: string;
    quantity: number;
    unit: string;
  }[];
  notes?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendQuotationRequest(data: QuotationEmailData): Promise<boolean> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const portalUrl = `${frontendUrl}/portal/cotizacion/${data.quotationId}?token=${data.accessToken}`;
    
    const validUntilFormatted = new Date(data.validUntil).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    try {
      await this.mailerService.sendMail({
        to: data.supplierEmail,
        subject: `Solicitud de Cotización #${data.quotationCode} - MECER`,
        html: this.generateQuotationEmailHtml({
          ...data,
          portalUrl,
          validUntilFormatted,
        }),
      });

      this.logger.log(`Correo enviado exitosamente a ${data.supplierEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando correo a ${data.supplierEmail}:`, error);
      throw error;
    }
  }

  private generateQuotationEmailHtml(data: QuotationEmailData & { portalUrl: string; validUntilFormatted: string }): string {
    const itemsRows = data.items
      .map(
        (item, index) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: center;">${index + 1}</td>
          <td style="padding: 12px;">${item.productCode}</td>
          <td style="padding: 12px;">${item.productName}</td>
          <td style="padding: 12px; text-align: center;">${item.quantity} ${item.unit}</td>
        </tr>
      `,
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Solicitud de Cotización</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Solicitud de Cotización</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Código: <strong>${data.quotationCode}</strong></p>
        </div>
        
        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Estimado/a <strong>${data.supplierName}</strong>,</p>
          
          <p>Nos ponemos en contacto para solicitar cotización de los siguientes productos. Por favor, ingrese los precios unitarios a través de nuestro portal de proveedores.</p>
          
          <!-- Products Table -->
          <div style="margin: 25px 0; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 12px; text-align: center; font-weight: 600; border-bottom: 2px solid #e5e7eb;">#</th>
                  <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Código</th>
                  <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Producto</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>
          
          ${data.notes ? `<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;"><strong>Notas:</strong> ${data.notes}</div>` : ''}
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.portalUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; text-decoration: none; padding: 15px 40px; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
              📝 Ingresar Precios de Cotización
            </a>
          </div>
          
          <!-- Valid Until -->
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <strong>⏰ Fecha límite de respuesta:</strong> ${data.validUntilFormatted}
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">Si tiene alguna pregunta sobre esta solicitud, no dude en contactarnos respondiendo a este correo.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Este es un correo automático generado por el Sistema de Gestión MECER.<br>
            © ${new Date().getFullYear()} MECER. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  async sendQuotationConfirmation(
    supplierEmail: string,
    supplierName: string,
    quotationCode: string,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: supplierEmail,
        subject: `Confirmación - Cotización #${quotationCode} recibida`,
        html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
              <div style="font-size: 48px;">✅</div>
              <h1 style="color: white; margin: 10px 0 0; font-size: 22px;">Cotización Recibida</h1>
            </div>
            
            <div style="padding: 30px;">
              <p>Estimado/a <strong>${supplierName}</strong>,</p>
              
              <p>Hemos recibido correctamente su cotización <strong>#${quotationCode}</strong>.</p>
              
              <p>Nuestro equipo revisará su propuesta y nos pondremos en contacto con usted en caso de requerir información adicional o para confirmar la orden de compra.</p>
              
              <p>Agradecemos su pronta respuesta.</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Atentamente,<br><strong>Equipo MECER</strong></p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} MECER. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
        `,
      });

      this.logger.log(`Confirmación enviada a ${supplierEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando confirmación a ${supplierEmail}:`, error);
      throw error;
    }
  }
}
