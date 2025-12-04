import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMember } from '../../../models/team-member.model';

@Component({
  selector: 'app-team-card',
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.css'],
  imports: [CommonModule]
})
export class TeamCardComponent {
  @Input() member!: TeamMember;
  @Input() showDetails: boolean = true;

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getPositionBadgeClass(): string {
    switch (this.member.position) {
      case 'Team Leader':
        return 'badge-leader';
      case 'Section Head':
        return 'badge-section-head';
      case 'Team Member':
        return 'badge-member';
      default:
        return 'badge-member';
    }
  }

  getSectionClass(): string {
    switch (this.member.section) {
      case 'Frontend':
        return 'section-frontend';
      case 'Backend':
        return 'section-backend';
      case 'Full-Stack':
        return 'section-fullstack';
      default:
        return '';
    }
  }
}