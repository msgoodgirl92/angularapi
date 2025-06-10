import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from './components/footer/footer.component';

interface Project {
  title: string;
  description: string;
  image: string;
  demoUrl: string;
  githubUrl: string;
  technologies: string[];
}

interface TechStack {
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isMobileMenuOpen = false;

  featuredProjects: Project[] = [
    {
      title: 'E-commerce Platform',
      description: 'A modern e-commerce platform built with Angular and Node.js, featuring real-time inventory management and secure payment processing.',
      image: 'assets/images/projects/ecommerce.jpg',
      demoUrl: 'https://demo-ecommerce.com',
      githubUrl: 'https://github.com/your-username/ecommerce',
      technologies: ['Angular', 'Node.js', 'MongoDB', 'Stripe']
    },
    {
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, team features, and progress tracking.',
      image: 'assets/images/projects/taskmanager.jpg',
      demoUrl: 'https://demo-taskmanager.com',
      githubUrl: 'https://github.com/your-username/taskmanager',
      technologies: ['Angular', 'Firebase', 'Material UI']
    },
    {
      title: 'Portfolio Website',
      description: 'A responsive portfolio website showcasing projects and skills with modern design and animations.',
      image: 'assets/images/projects/portfolio.jpg',
      demoUrl: 'https://your-portfolio.com',
      githubUrl: 'https://github.com/your-username/portfolio',
      technologies: ['Angular', 'SCSS', 'TypeScript']
    }
  ];

  techStack: TechStack[] = [
    {
      name: 'Angular',
      description: 'Modern web framework for building dynamic single-page applications',
      icon: 'assets/images/tech/angular.png'
    },
    {
      name: 'TypeScript',
      description: 'Strongly typed programming language that builds on JavaScript',
      icon: 'assets/images/tech/typescript.png'
    },
    {
      name: 'SCSS',
      description: 'Advanced CSS preprocessor for better styling and maintainability',
      icon: 'assets/images/tech/scss.png'
    },
    {
      name: 'Node.js',
      description: 'JavaScript runtime for building scalable server-side applications',
      icon: 'assets/images/tech/nodejs.png'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.isMobileMenuOpen = false;
  }

  navigateHome() {
    this.router.navigate(['']);
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
