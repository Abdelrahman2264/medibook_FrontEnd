import { Pipe, PipeTransform } from '@angular/core';
import { TeamMember } from '../models/team-member.model';

@Pipe({
  name: 'sectionHeadFilter',
  standalone: true
})
export class SectionHeadFilterPipe implements PipeTransform {
  transform(members: TeamMember[]): TeamMember[] {
    return members.filter(member => 
      member.position === 'Section Head' && member.section !== 'Full-Stack'
    );
  }
}
