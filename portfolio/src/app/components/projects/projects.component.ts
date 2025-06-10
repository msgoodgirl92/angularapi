import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoLink: string;
  githubLink: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatTabsModule,
    MatIconModule
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'A full-featured e-commerce platform with user authentication, product management, and payment integration.',
      image: 'assets/images/projects/ecommerce.jpg',
      technologies: ['Angular', 'Node.js', 'MongoDB', 'Stripe'],
      demoLink: 'https://demo-ecommerce.com',
      githubLink: 'https://github.com/username/ecommerce'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates and team features.',
      image: 'assets/images/projects/taskmanager.jpg',
      technologies: ['Angular', 'Firebase', 'Material UI'],
      demoLink: 'https://demo-taskmanager.com',
      githubLink: 'https://github.com/username/taskmanager'
    },
    {
      id: 3,
      title: 'Portfolio Website',
      description: 'A modern portfolio website showcasing projects and skills with smooth animations.',
      image: 'assets/images/projects/portfolio.jpg',
      technologies: ['Angular', 'SCSS', 'GSAP'],
      demoLink: 'https://portfolio-demo.com',
      githubLink: 'https://github.com/username/portfolio'
    }
  ];

  filteredProjects: Project[] = [];
  selectedTechnologies: string[] = [];
  allTechnologies: string[] = [];

  ngOnInit() {
    this.filteredProjects = [...this.projects];
    this.allTechnologies = [...new Set(this.projects.flatMap(p => p.technologies))];
  }

  toggleTechnology(tech: string) {
    const index = this.selectedTechnologies.indexOf(tech);
    if (index === -1) {
      this.selectedTechnologies.push(tech);
    } else {
      this.selectedTechnologies.splice(index, 1);
    }
    this.filterProjects();
  }

  filterProjects() {
    if (this.selectedTechnologies.length === 0) {
      this.filteredProjects = [...this.projects];
    } else {
      this.filteredProjects = this.projects.filter(project =>
        this.selectedTechnologies.every(tech => project.technologies.includes(tech))
      );
    }
  }

  isTechnologySelected(tech: string): boolean {
    return this.selectedTechnologies.includes(tech);
  }

  openDemo(url: string) {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }

  openGithub(url: string) {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }
}
