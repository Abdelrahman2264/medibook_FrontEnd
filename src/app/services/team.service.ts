import { Injectable } from '@angular/core';
import { TeamMember, TeamSection } from '../models/team-member.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teamMembers: TeamMember[] = [
    {
      id: 23011109,
      fullName: 'Abd EL-Rahman Khalaf Mahran Younis',
      role: 'Full-Stack .NET Developer',
      position: 'Team Leader',
      section: 'Full-Stack',
      bio: 'Experienced Full-Stack developer with expertise in .NET ecosystem and modern web technologies. Leads the Medibook project with a focus on scalable architecture and best practices.',
      avatarColor: '#0284c7'
    },
    {
      id: 220100176,
      fullName: 'Abd EL-Rahman Ali Mohamed Hafez',
      role: 'Backend Developer',
      position: 'Section Head',
      section: 'Backend',
      bio: 'Backend section lead specializing in API development, database design, and server-side architecture. Ensures robust and secure backend systems for Medibook.',
      avatarColor: '#2563eb'
    },
    {
      id: 23011482,
      fullName: 'Mohamed Ali Mohamed ALi',
      role: 'Frontend Developer',
      position: 'Section Head',
      section: 'Frontend',
      bio: 'Frontend section head with expertise in Angular, responsive design, and user experience. Leads the frontend team in creating intuitive medical interfaces.',
      avatarColor: '#0ea5e9'
    },
    {
      id: 23011088,
      fullName: 'Shrouk Shaban Abd EL-Naby Mahmoud',
      role: 'Backend Developer',
      position: 'Team Member',
      section: 'Backend',
      bio: 'Backend developer focused on API integration and database optimization for medical data management.',
      avatarColor: '#3b82f6'
    },
    {
      id: 23011040,
      fullName: 'Esraa EL-Sayed Amer EL-Sayed',
      role: 'Backend Developer',
      position: 'Team Member',
      section: 'Backend',
      bio: 'Specializes in server-side logic, security implementation, and performance optimization for healthcare applications.',
      avatarColor: '#60a5fa'
    },
    {
      id: 23011464,
      fullName: 'Mohamed Ayman Abo EL-Nasr Ali',
      role: 'Frontend Developer',
      position: 'Team Member',
      section: 'Frontend',
      bio: 'Frontend developer creating responsive and accessible user interfaces for medical professionals and patients.',
      avatarColor: '#7dd3fc'
    },
    {
      id: 23011169,
      fullName: 'Nada Tarek Mostafa Abd EL-Razek',
      role: 'Frontend Developer',
      position: 'Team Member',
      section: 'Frontend',
      bio: 'Focuses on UI/UX design implementation, component development, and user interaction optimization.',
      avatarColor: '#38bdf8'
    },
    {
      id: 23011041,
      fullName: 'Esraa Ali Hamedi Ali',
      role: 'Frontend Developer',
      position: 'Team Member',
      section: 'Frontend',
      bio: 'Specializes in state management, reactive forms, and real-time data visualization for medical applications.',
      avatarColor: '#bae6fd'
    },
    {
      id: 23011528,
      fullName: 'Mariem Khaled Ahmed Ibrahim',
      role: 'Frontend Developer',
      position: 'Team Member',
      section: 'Frontend',
      bio: 'Frontend developer with expertise in medical dashboard creation and data visualization components.',
      avatarColor: '#93c5fd'
    },
    {
      id: 23011163,
      fullName: 'Menna Allah Taha Saad',
      role: 'Frontend Developer',
      position: 'Team Member',
      section: 'Frontend',
      bio: 'Focuses on mobile responsiveness, cross-browser compatibility, and performance optimization.',
      avatarColor: '#bfdbfe'
    }
  ];

  getTeamMembers(): TeamMember[] {
    return this.teamMembers;
  }

  getTeamMembersBySection(section: TeamSection): TeamMember[] {
    const sectionMap = {
      [TeamSection.LEADERSHIP]: ['Team Leader'],
      [TeamSection.FRONTEND]: ['Frontend'],
      [TeamSection.BACKEND]: ['Backend', 'Full-Stack']
    };

    return this.teamMembers.filter(member => 
      sectionMap[section].includes(member.section) || 
      (section === TeamSection.LEADERSHIP && member.position === 'Team Leader')
    );
  }

  getTeamStats() {
    const total = this.teamMembers.length;
    const frontend = this.teamMembers.filter(m => m.section === 'Frontend').length;
    const backend = this.teamMembers.filter(m => m.section === 'Backend').length;
    const fullStack = this.teamMembers.filter(m => m.section === 'Full-Stack').length;

    return { total, frontend, backend, fullStack };
  }
}