// src/app/models/nurse.model.ts

export interface NurseDetailsDto {
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobilePhone: string;
  gender: string;
  profileImage: string | null;
  dateOfBirth: string;
  nurseId: number;
  bio: string;
  isActive: boolean;
  createDate: string;
}

export interface Nurse {
  nurseId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobilePhone: string;
  gender: string;
  dateOfBirth: string;
  bio: string;
  photoUrl: string;
  isActive: boolean;
  state: string;
  createDate: string;
}

// For creating new nurses - matches C# CreateNurseDto
export interface CreateNurseDto {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  password: string;
  gender: string;
  mitrialStatus: string;
  dateOfBirth: string;
  bio: string;
  profileImage: string | null;
}

// For updating nurses - matches C# UpdateNurseDto
export interface UpdateNurseDto {
  bio?: string;
  firstName?: string;
  lastName?: string;
  mobilePhone?: string;
  profileImage?: string | null;
  mitrialStatus?: string;
}

// Enhanced mapping function with better debugging
export function mapNurseDetailsDtoToNurse(dto: any): Nurse {
  console.log('🔍 Raw DTO received for mapping:', dto);
  
  // Handle all possible property name variations
  const nurseId = dto.nurseId ?? dto.NurseId ?? 0;
  const userId = dto.userId ?? dto.UserId ?? 0;
  const isActive = dto.isActive ?? dto.IsActive ?? false;
  
  console.log('🔍 Extracted IDs:', { nurseId, userId, isActive });

  if (nurseId === 0) {
    console.error('❌ CRITICAL: nurseId is 0 after mapping! Full DTO:', dto);
  }

  const firstName = dto.firstName ?? dto.FirstName ?? '';
  const lastName = dto.lastName ?? dto.LastName ?? '';
  const fullName = dto.fullName ?? dto.FullName ?? `${firstName} ${lastName}`.trim();

  const mappedNurse: Nurse = {
    nurseId: nurseId,
    userId: userId,
    firstName: firstName,
    lastName: lastName,
    fullName: fullName,
    email: dto.email ?? dto.Email ?? '',
    mobilePhone: dto.mobilePhone ?? dto.MobilePhone ?? '',
    gender: dto.gender ?? dto.Gender ?? '',
    dateOfBirth: dto.dateOfBirth ?? dto.DateOfBirth ?? '',
    bio: dto.bio ?? dto.Bio ?? '',
    photoUrl: dto.profileImage ?? dto.ProfileImage ?? '',
    isActive: isActive,
    state: isActive ? 'Active' : 'Inactive',
    createDate: dto.createDate ?? dto.CreateDate ?? ''
  };

  console.log('✅ Mapped nurse:', mappedNurse);
  return mappedNurse;
}