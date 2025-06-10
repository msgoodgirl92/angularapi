import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

interface Skill {
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'tools';
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule]
})
export class AboutComponent {
  skills: Skill[] = [
    { name: 'Angular', level: 90, category: 'frontend' },
    { name: 'TypeScript', level: 85, category: 'frontend' },
    { name: 'HTML/CSS', level: 95, category: 'frontend' },
    { name: 'JavaScript', level: 90, category: 'frontend' },
    { name: 'Node.js', level: 75, category: 'backend' },
    { name: 'MongoDB', level: 70, category: 'backend' },
    { name: 'Git', level: 85, category: 'tools' },
    { name: 'Figma', level: 80, category: 'tools' }
  ];

  experiences: Experience[] = [
    {
      title: 'Frontend Developer',
      company: 'Tech Solutions Inc.',
      period: '2022 - Present',
      description: 'Developing modern web applications using Angular and TypeScript. Collaborating with design and backend teams to create seamless user experiences.'
    },
    {
      title: 'Junior Developer',
      company: 'Digital Creations',
      period: '2020 - 2022',
      description: 'Worked on various web projects, focusing on responsive design and user interface development. Implemented new features and fixed bugs.'
    }
  ];

  get frontendSkills() {
    return this.skills.filter(skill => skill.category === 'frontend');
  }

  get backendSkills() {
    return this.skills.filter(skill => skill.category === 'backend');
  }

  get toolSkills() {
    return this.skills.filter(skill => skill.category === 'tools');
  }
}
