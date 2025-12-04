import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/team.service';
import { TeamMember, TeamSection } from '../../models/team-member.model';
import { TeamCardComponent } from '../Shared/team-card/team-card.component';
import { SectionHeadFilterPipe } from '../../pipes/section-head-filter.pipe';

@Component({
  selector: 'app-meet-our-team',
  templateUrl: './meet-our-team.component.html',
  styleUrls: ['./meet-our-team.component.css'],
  imports: [CommonModule, TeamCardComponent, SectionHeadFilterPipe]
})
export class MeetOurTeamComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  leadershipTeam: TeamMember[] = [];
  frontendTeam: TeamMember[] = [];
  backendTeam: TeamMember[] = [];
  
  stats = {
    total: 0,
    frontend: 0,
    backend: 0,
    fullStack: 0
  };
  
  activeFilter: string = 'all';
  isDarkTheme: boolean = false;

  constructor(private teamService: TeamService) {}

  ngOnInit() {
    this.loadTeamData();
    this.checkTheme();
  }

  loadTeamData() {
    this.teamMembers = this.teamService.getTeamMembers();
    this.leadershipTeam = this.teamService.getTeamMembersBySection(TeamSection.LEADERSHIP);
    this.frontendTeam = this.teamMembers.filter(m => 
      m.section === 'Frontend' && m.position !== 'Team Leader'
    );
    this.backendTeam = this.teamMembers.filter(m => 
      m.section === 'Backend' && m.position !== 'Team Leader'
    );
    
    this.stats = this.teamService.getTeamStats();
  }

  filterTeam(filter: string) {
    this.activeFilter = filter;
  }

  getFilteredMembers(): TeamMember[] {
    switch (this.activeFilter) {
      case 'leadership':
        return this.leadershipTeam;
      case 'frontend':
        return this.teamMembers.filter(m => m.section === 'Frontend');
      case 'backend':
        return this.teamMembers.filter(m => m.section === 'Backend');
      case 'fullstack':
        return this.teamMembers.filter(m => m.section === 'Full-Stack');
      default:
        return this.teamMembers;
    }
  }

  checkTheme() {
    this.isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
  }
}