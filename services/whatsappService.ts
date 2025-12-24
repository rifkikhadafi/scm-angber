
import { Order, FonnteResponse, RegistrationData } from '../types';
import { FONNTE_API_TOKEN, FONNTE_TARGET_GROUP_ID } from '../constants';

export const sendOrderNotification = async (order: Order, type: 'NEW' | 'CHANGE' = 'NEW'): Promise<FonnteResponse> => {
  const title = type === 'NEW' ? '🆕 PESANAN UNIT BARU' : '✏️ PERUBAHAN PESANAN';
  const message = `
${title}
ID: *${order.id}*

*Unit:* ${order.unit}
*Tanggal:* ${order.date}
*Waktu:* ${order.startTime} - ${order.endTime}
*Status:* ${order.status}

*Detail Pekerjaan:*
${order.details}

_Sent via Heavy Equipment Ops System_
  `.trim();

  try {
    const formData = new FormData();
    formData.append('target', FONNTE_TARGET_GROUP_ID);
    formData.append('message', message);
    
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': FONNTE_API_TOKEN },
      body: formData,
    });

    const result = await response.json();
    return result as FonnteResponse;
  } catch (error) {
    console.error('WA Error:', error);
    return { status: false, reason: 'Network error' };
  }
};

// Added sendWhatsAppNotification for RegistrationForm.tsx
export const sendWhatsAppNotification = async (data: RegistrationData): Promise<FonnteResponse> => {
  const message = `
*PENDAFTARAN BARU*
Nama: ${data.fullName}
Jenis Kelamin: ${data.gender}
Umur: ${data.age}
  `.trim();

  try {
    const formData = new FormData();
    formData.append('target', FONNTE_TARGET_GROUP_ID);
    formData.append('message', message);
    
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': FONNTE_API_TOKEN },
      body: formData,
    });

    const result = await response.json();
    return result as FonnteResponse;
  } catch (error) {
    console.error('WA Error:', error);
    return { status: false, reason: 'Network error' };
  }
};
