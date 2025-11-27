/**
 * User model interface
 * Update this based on your actual API response
 */
export interface User {
  id: number;
  email: string;
  name?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  department?: string;
  photo?: string;
  status?: string;
  joinDate?: string;
  lastLogin?: string;
  address?: string;
  emergencyContact?: string;
  qualifications?: string[];
  skills?: string[];
  languages?: string[];
}

