// src/app/models/patient.model.ts

export interface UserDetailsDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  gender: string;
  mitrialStatus: string;
  profileImage: string | null;
  dateOfBirth: string;
  createDate: string;
  isActive: boolean;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobilePhone: string;
  gender: string;
  mitrialStatus: string;
  profileImage: string | null;
  dateOfBirth: string;
  createDate: string;
  isActive: boolean;
  state: string;
  age?: number;
}

// For updating patients - matches C# UpdateUserDto
export interface UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  mobilePhone?: string;
  gender?: string;
  mitrialStatus?: string;
  profileImage?: string | null;
}

// Mapping function from UserDetailsDto to Patient
export function mapUserDetailsDtoToPatient(dto: any): Patient {
  console.log('🔍 Raw Patient DTO received for mapping:', dto);
  
  // Handle all possible property name variations
  const id = dto.id ?? dto.Id ?? dto.userId ?? dto.UserId ?? 0;
  const isActive = dto.isActive ?? dto.IsActive ?? false;
  
  console.log('🔍 Extracted IDs:', { id, isActive });

  if (id === 0) {
    console.error('❌ CRITICAL: Patient id is 0 after mapping! Full DTO:', dto);
  }

  const firstName = dto.firstName ?? dto.FirstName ?? '';
  const lastName = dto.lastName ?? dto.LastName ?? '';
  const fullName = dto.fullName ?? dto.FullName ?? `${firstName} ${lastName}`.trim();

  // Calculate age from date of birth
  let age: number | undefined;
  if (dto.dateOfBirth || dto.DateOfBirth) {
    const birthDate = new Date(dto.dateOfBirth ?? dto.DateOfBirth);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  const mappedPatient: Patient = {
    id: id,
    firstName: firstName,
    lastName: lastName,
    fullName: fullName,
    email: dto.email ?? dto.Email ?? '',
    mobilePhone: dto.mobilePhone ?? dto.MobilePhone ?? '',
    gender: dto.gender ?? dto.Gender ?? '',
    mitrialStatus: dto.mitrialStatus ?? dto.MitrialStatus ?? '',
    profileImage: dto.profileImage ?? dto.ProfileImage ?? null,
    dateOfBirth: dto.dateOfBirth ?? dto.DateOfBirth ?? '',
    createDate: dto.createDate ?? dto.CreateDate ?? '',
    isActive: isActive,
    state: isActive ? 'Active' : 'Inactive',
    age: age
  };

  console.log('✅ Mapped patient:', mappedPatient);
  return mappedPatient;
}