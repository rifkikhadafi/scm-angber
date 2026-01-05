
import { Order, FonnteResponse, RegistrationData } from '../types';
import { FONNTE_API_TOKEN, FONNTE_TARGET_GROUP_ID } from '../constants';

/**
 * Helper untuk memformat tanggal dari YYYY-MM-DD ke DD/MM/YYYY
 */
const formatDateIndo = (dateStr: string | null): string => {
  if (!dateStr || dateStr.trim() === '') return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  // Menggunakan pemisah '/' sesuai permintaan user
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Mengirim notifikasi WhatsApp hanya untuk pesanan baru (Requested).
 * Format pesan disesuaikan dengan permintaan user.
 */
export const sendOrderNotification = async (order: Order): Promise<FonnteResponse> => {
  const formattedDate = formatDateIndo(order.date);
  
  const message = `
🆕 PERMINTAAN BARU
ID: ${order.id}
Pemesan: ${order.ordererName}

Unit: ${order.unit}
Tanggal: ${formattedDate}
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
