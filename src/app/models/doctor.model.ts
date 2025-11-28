// src/app/models/doctor.model.ts

export interface DoctorDetailsDto {
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobilePhone: string;
  gender: string;
  profileImage: string | null;
  dateOfBirth: string;
  doctorId: number;
  bio: string;
  specialization: string;
  type: string;
  experienceYears: number;
  isActive: boolean;
  createDate: string;
}

export interface Doctor {
  doctorId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobilePhone: string;
  gender: string;
  dateOfBirth: string;
  bio: string;
  specialization: string;
  type: string;
  experienceYears: number;
  photoUrl: string;
  isActive: boolean;
  state: string;
  createDate: string;
}

// For creating new doctors - matches C# CreateDoctorDto
export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  password: string;
  gender: string;
  mitrialStatus: string;
  dateOfBirth: string;
  bio: string;
  specialization: string;
  type: string;
  experienceYears: number;
  profileImage: string | null;
}

// For updating doctors - matches C# UpdateDoctorDto
export interface UpdateDoctorDto {
  bio?: string;
  specialization?: string;
  type?: string;
  experienceYears?: number;
  firstName?: string;
  lastName?: string;
  mobilePhone?: string;
  profileImage?: string | null;
  mitrialStatus?: string;
}

// Mapping function from DoctorDetailsDto to Doctor
export function mapDoctorDetailsDtoToDoctor(dto: DoctorDetailsDto): Doctor {
  return {
    doctorId: dto.doctorId,
    userId: dto.userId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    fullName: dto.fullName,
    email: dto.email,
    mobilePhone: dto.mobilePhone,
    gender: dto.gender,
    dateOfBirth: dto.dateOfBirth,
    bio: dto.bio,
    specialization: dto.specialization,
    type: dto.type,
    experienceYears: dto.experienceYears,
    photoUrl: dto.profileImage || '',
    isActive: dto.isActive,
    state: dto.isActive ? 'Active' : 'Inactive',
    createDate: dto.createDate
  };
}