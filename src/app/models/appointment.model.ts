// src/app/models/appointment.model.ts

export interface AppointmentDetailsDto {
  appointmentId: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  patientGender: string;
  patientMartialStatus: string;
  patientMobilePhone: string;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
  doctorGender: string;
  doctorMobilePhone: string;
  doctorType: string;
  doctorSpecialization: string;
  nurseId: number | null;
  nurseFirstName: string;
  nurseLastName: string;
  nurseGender: string;
  roomId: number | null;
  roomName: string;
  roomType: string;
  appointmentDate: string;
  status: string;
  medicine: string;
  notes: string;
}

export interface Appointment {
  appointmentId: number;
  patientId: number;
  patientName: string;
  patientInfo: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  nurseId: number | null;
  nurseName: string;
  roomId: number | null;
  roomName: string;
  appointmentDate: string;
  formattedDate: string;
  formattedTime: string;
  status: string;
  statusColor: string;
  statusIcon: string;
  medicine: string;
  notes: string;
}

export interface CreateAppointmentDto {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
}

export interface CancelAppointmentDto {
  appointmentId: number;
  cancellationReason: string;
}

export interface AssignAppointmentDto {
  appointmentId: number;
  nurseId: number;
  roomId: number;
}

export interface CloseAppointmentDto {
  appointmentId: number;
  notes: string;
  medicine: string;
}

export interface AvailableDateDto {
  date: string;
  availableSlots: string[];
}

export interface AppointmentResponseDto {
  appointmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  message: string;
}

// Enhanced mapping function
export function mapAppointmentDetailsDtoToAppointment(dto: any): Appointment {
  console.log('🔍 Raw Appointment DTO received for mapping:', dto);
  
  const appointmentData = dto.data || dto;
  
  const appointmentId = appointmentData.appointmentId ?? appointmentData.AppointmentId ?? 0;
  const patientId = appointmentData.patientId ?? appointmentData.PatientId ?? 0;
  const doctorId = appointmentData.doctorId ?? appointmentData.DoctorId ?? 0;
  const nurseId = appointmentData.nurseId ?? appointmentData.NurseId ?? null;
  const roomId = appointmentData.roomId ?? appointmentData.RoomId ?? null;
  
  const patientFirstName = appointmentData.patientFirstName ?? appointmentData.PatientFirstName ?? '';
  const patientLastName = appointmentData.patientLastName ?? appointmentData.PatientLastName ?? '';
  const doctorFirstName = appointmentData.doctorFirstName ?? appointmentData.DoctorFirstName ?? '';
  const doctorLastName = appointmentData.doctorLastName ?? appointmentData.DoctorLastName ?? '';
  const nurseFirstName = appointmentData.nurseFirstName ?? appointmentData.NurseFirstName ?? '';
  const nurseLastName = appointmentData.nurseLastName ?? appointmentData.NurseLastName ?? '';

  // Raw date / time coming from API (handle multiple possible casings / shapes)
  const rawAppointmentDate =
    appointmentData.appointmentDate ??
    appointmentData.AppointmentDate ??
    appointmentData.date ??
    '';

  const rawAppointmentTime =
    appointmentData.appointmentTime ??
    appointmentData.AppointmentTime ??
    appointmentData.time ??
    '';

  const status = appointmentData.status ?? appointmentData.Status ?? 'Pending';

  // Prepare a combined date-time string when possible
  let storedAppointmentDate = rawAppointmentDate || '';
  let formattedDate = '';
  let formattedTime = '';

  if (rawAppointmentDate) {
    let dateTimeString = rawAppointmentDate;

    // If API sends date and time separately, combine them
    if (rawAppointmentTime) {
      if (!rawAppointmentDate.includes('T') && !rawAppointmentDate.includes(' ')) {
        dateTimeString = `${rawAppointmentDate}T${rawAppointmentTime}`;
      } else {
        dateTimeString = `${rawAppointmentDate} ${rawAppointmentTime}`;
      }
    }

    const parsed = new Date(dateTimeString);

    if (!isNaN(parsed.getTime())) {
      // Valid JS date – format nicely for UI
      storedAppointmentDate = dateTimeString;
      formattedDate = parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
      formattedTime = parsed.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // Fallback – keep raw values so UI never shows "Invalid Date"
      storedAppointmentDate = rawAppointmentDate;
      formattedDate = rawAppointmentDate || '-';
      formattedTime = rawAppointmentTime || '-';
    }
  } else {
    // No date from API – show safe placeholders
    storedAppointmentDate = '';
    formattedDate = '-';
    formattedTime = rawAppointmentTime || '-';
  }
  
  // Determine status color and icon
  const { color, icon } = getAppointmentStatusInfo(status);
  
  const mappedAppointment: Appointment = {
    appointmentId: appointmentId,
    patientId: patientId,
    patientName: `${patientFirstName} ${patientLastName}`.trim(),
    patientInfo: `${appointmentData.patientGender ?? ''} • ${appointmentData.patientMobilePhone ?? ''}`,
    doctorId: doctorId,
    doctorName: `${doctorFirstName} ${doctorLastName}`.trim(),
    doctorSpecialization: appointmentData.doctorSpecialization ?? appointmentData.DoctorSpecialization ?? '',
    nurseId: nurseId,
    nurseName: nurseFirstName && nurseLastName ? `${nurseFirstName} ${nurseLastName}`.trim() : 'Not Assigned',
    roomId: roomId,
    roomName: appointmentData.roomName ?? appointmentData.RoomName ?? 'Not Assigned',
    appointmentDate: storedAppointmentDate,
    formattedDate: formattedDate,
    formattedTime: formattedTime,
    status: status,
    statusColor: color,
    statusIcon: icon,
    medicine: appointmentData.medicine ?? appointmentData.Medicine ?? '',
    notes: appointmentData.notes ?? appointmentData.Notes ?? ''
  };

  console.log('✅ Mapped appointment:', mappedAppointment);
  return mappedAppointment;
}

// Helper function to get appointment status styling
function getAppointmentStatusInfo(status: string): { color: string; icon: string } {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'scheduled':
    case 'confirmed':
      return { color: '#4caf50', icon: 'fas fa-calendar-check' };
    case 'pending':
      return { color: '#ff9800', icon: 'fas fa-clock' };
    case 'assigned':
      return { color: '#2196f3', icon: 'fas fa-user-md' };
    case 'in progress':
      return { color: '#9c27b0', icon: 'fas fa-procedures' };
    case 'completed':
    case 'closed':
      return { color: '#607d8b', icon: 'fas fa-check-circle' };
    case 'cancelled':
      return { color: '#f44336', icon: 'fas fa-times-circle' };
    default:
      return { color: '#78909c', icon: 'fas fa-calendar' };
  }
}