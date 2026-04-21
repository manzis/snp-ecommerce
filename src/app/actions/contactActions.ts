'use server';

import { sendContactFormEmail } from '@/services/emailService';

export async function submitContactFormAction(formData: {
  fullName: string;
  email: string;
  message: string;
}) {
  try {
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.message) {
      return { success: false, message: 'All fields are required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    // Trigger Email Dispatch
    const submittedAt = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kathmandu',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const emailSent = await sendContactFormEmail({
      ...formData,
      submittedAt,
    });

    if (emailSent) {
      return { success: true, message: 'Thank you! Your message has been sent successfully.' };
    } else {
      return { success: false, message: 'Failed to send message. Please try again later.' };
    }
  } catch (error) {
    console.error('[contactActions] Error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
