// src/app/models/feedback.model.ts

export interface CreateFeedbackDto {
  patientId: number;
  doctorId: number;
  appointmentId: number;
  comment: string;
  rate: number;
}

export interface FeedbackDetailsDto {
  feedbackId: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
  doctorSpecialization: string;
  appointmentId: number;
  appointmentDate: string;
  comment: string;
  rate: number;
  feedbackDate: string;
  doctorReply: string;
  replyDate: string | null;
  isFavourite: boolean;
}

export interface UpdateFeedbackDto {
  feedbackId: number;
  comment?: string;
}

export interface DoctorReplyDto {
  feedbackId: number;
  doctorReply: string;
}

export interface Feedback {
  feedbackId: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  appointmentId: number;
  appointmentDate: string;
  formattedAppointmentDate: string;
  comment: string;
  rate: number;
  feedbackDate: string;
  formattedFeedbackDate: string;
  doctorReply: string;
  replyDate: string | null;
  formattedReplyDate: string;
  isFavourite: boolean;
}

// Mapping function to convert FeedbackDetailsDto to Feedback
export function mapFeedbackDetailsDtoToFeedback(dto: any): Feedback {
  console.log('🔍 Raw Feedback DTO received for mapping:', dto);
  
  const feedbackData = dto.data || dto;
  
  const feedbackId = feedbackData.feedbackId ?? feedbackData.FeedbackId ?? 0;
  const patientId = feedbackData.patientId ?? feedbackData.PatientId ?? 0;
  const doctorId = feedbackData.doctorId ?? feedbackData.DoctorId ?? 0;
  const appointmentId = feedbackData.appointmentId ?? feedbackData.AppointmentId ?? 0;
  
  const patientFirstName = feedbackData.patientFirstName ?? feedbackData.PatientFirstName ?? '';
  const patientLastName = feedbackData.patientLastName ?? feedbackData.PatientLastName ?? '';
  const patientEmail = feedbackData.patientEmail ?? feedbackData.PatientEmail ?? '';
  
  const doctorFirstName = feedbackData.doctorFirstName ?? feedbackData.DoctorFirstName ?? '';
  const doctorLastName = feedbackData.doctorLastName ?? feedbackData.DoctorLastName ?? '';
  const doctorSpecialization = feedbackData.doctorSpecialization ?? feedbackData.DoctorSpecialization ?? '';
  
  const rawAppointmentDate = feedbackData.appointmentDate ?? feedbackData.AppointmentDate ?? '';
  const rawFeedbackDate = feedbackData.feedbackDate ?? feedbackData.FeedbackDate ?? '';
  const rawReplyDate = feedbackData.replyDate ?? feedbackData.ReplyDate ?? null;
  
  const comment = feedbackData.comment ?? feedbackData.Comment ?? '';
  const rate = feedbackData.rate ?? feedbackData.Rate ?? 0;
  const doctorReply = feedbackData.doctorReply ?? feedbackData.DoctorReply ?? '';
  const isFavourite = feedbackData.isFavourite ?? feedbackData.IsFavourite ?? false;
  
  // Format dates
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  const mappedFeedback: Feedback = {
    feedbackId: feedbackId,
    patientId: patientId,
    patientName: `${patientFirstName} ${patientLastName}`.trim(),
    patientEmail: patientEmail,
    doctorId: doctorId,
    doctorName: `${doctorFirstName} ${doctorLastName}`.trim(),
    doctorSpecialization: doctorSpecialization,
    appointmentId: appointmentId,
    appointmentDate: rawAppointmentDate,
    formattedAppointmentDate: formatDate(rawAppointmentDate),
    comment: comment,
    rate: rate,
    feedbackDate: rawFeedbackDate,
    formattedFeedbackDate: formatDateTime(rawFeedbackDate),
    doctorReply: doctorReply,
    replyDate: rawReplyDate,
    formattedReplyDate: rawReplyDate ? formatDateTime(rawReplyDate) : '-',
    isFavourite: isFavourite
  };
  
  console.log('✅ Mapped feedback:', mappedFeedback);
  return mappedFeedback;
}



