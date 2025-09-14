import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ReservationEmailData {
  reservationId: string;
  userEmail: string;
  userName: string;
  lotName: string;
  lotAddress: string;
  carPlate: string;
  arrivalWindow: {
    start: string;
    end: string;
  };
  fees: {
    reservationFeeAmount: number;
  };
  state: string;
}

export async function sendReservationConfirmationEmail(data: ReservationEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Parcin <noreply@parcin.com>',
      to: [data.userEmail],
      subject: 'Reserva Confirmada - Parcin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🚗 Parcin</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8fafc;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Reserva Confirmada!</h2>
            
            <p style="color: #4b5563; margin-bottom: 20px;">
              Olá ${data.userName}, sua reserva foi confirmada com sucesso!
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <h3 style="color: #1f2937; margin-top: 0;">Detalhes da Reserva</h3>
              <p><strong>Estacionamento:</strong> ${data.lotName}</p>
              <p><strong>Endereço:</strong> ${data.lotAddress}</p>
              <p><strong>Placa:</strong> ${data.carPlate}</p>
              <p><strong>Taxa de Reserva:</strong> R$ ${data.fees.reservationFeeAmount.toFixed(2)}</p>
              <p><strong>ID da Reserva:</strong> ${data.reservationId}</p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="color: #92400e; margin-top: 0;">⏰ Janela de Chegada</h4>
              <p style="color: #92400e; margin: 0;">
                <strong>De:</strong> ${new Date(data.arrivalWindow.start).toLocaleString('pt-BR')}<br>
                <strong>Até:</strong> ${new Date(data.arrivalWindow.end).toLocaleString('pt-BR')}
              </p>
            </div>
            
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #dc2626; margin: 0;">
                <strong>⚠️ Importante:</strong> Chegue dentro da janela de tempo para evitar que sua reserva seja marcada como não comparecimento.
              </p>
            </div>
            
            <p style="color: #4b5563;">
              Obrigado por usar o Parcin! 🚗
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
            <p style="margin: 0;">© 2024 Parcin. Todos os direitos reservados.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log('Reservation confirmation email sent:', emailData);
    return { success: true, emailId: emailData?.id };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendPaymentFailureEmail(data: ReservationEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Parcin <noreply@parcin.com>',
      to: [data.userEmail],
      subject: 'Falha no Pagamento - Parcin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🚗 Parcin</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8fafc;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Falha no Pagamento</h2>
            
            <p style="color: #4b5563; margin-bottom: 20px;">
              Olá ${data.userName}, infelizmente houve um problema com o pagamento da sua reserva.
            </p>
            
            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
              <h3 style="color: #1f2937; margin-top: 0;">Detalhes da Reserva</h3>
              <p><strong>Estacionamento:</strong> ${data.lotName}</p>
              <p><strong>Endereço:</strong> ${data.lotAddress}</p>
              <p><strong>Placa:</strong> ${data.carPlate}</p>
              <p><strong>Taxa de Reserva:</strong> R$ ${data.fees.reservationFeeAmount.toFixed(2)}</p>
              <p><strong>ID da Reserva:</strong> ${data.reservationId}</p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #92400e; margin: 0;">
                <strong>💡 O que fazer:</strong> Você pode tentar fazer uma nova reserva ou entrar em contato conosco para mais informações.
              </p>
            </div>
            
            <p style="color: #4b5563;">
              Se precisar de ajuda, entre em contato conosco.<br>
              Equipe Parcin 🚗
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
            <p style="margin: 0;">© 2024 Parcin. Todos os direitos reservados.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending payment failure email:', error);
      return { success: false, error: error.message };
    }

    console.log('Payment failure email sent:', emailData);
    return { success: true, emailId: emailData?.id };
  } catch (error) {
    console.error('Error sending payment failure email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
