
import { Order, FonnteResponse, RegistrationData } from '../types';
import { FONNTE_API_TOKEN, FONNTE_TARGET_GROUP_ID } from '../constants';

/**
 * Mengirim notifikasi WhatsApp hanya untuk pesanan baru (Requested).
 * Format pesan disesuaikan dengan permintaan user.
 */
export const sendOrderNotification = async (order: Order): Promise<FonnteResponse> => {
  const message = `
🆕 PERMINTAAN BARU
ID: ${order.id}
Pemesan: ${order.ordererName}

Unit: ${order.unit}
Tanggal: ${order.date}
Waktu: ${order.startTime} - ${order.endTime}

Detail Pekerjaan:
${order.details}

Mohon dibantu untuk permintaan ini, terima kasih.
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
