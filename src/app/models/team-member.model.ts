export interface TeamMember {
  id: number;
  fullName: string;
  role: string;
  position: 'Team Leader' | 'Section Head' | 'Team Member';
  section: 'Full-Stack' | 'Frontend' | 'Backend';
  bio: string;
  avatarColor: string;
}

export enum TeamSection {
  LEADERSHIP = 'leadership',
  FRONTEND = 'frontend',
  BACKEND = 'backend'
}