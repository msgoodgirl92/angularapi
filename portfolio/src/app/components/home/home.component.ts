import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroComponent } from '../hero/hero.component';
import { FooterComponent } from '../footer/footer.component';
import { MatIconModule } from '@angular/material/icon';

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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, HeroComponent, FooterComponent, MatIconModule]
})
export class HomeComponent {
  featuredProjects: Project[] = [
    {
      title: 'Angular API Project',
      description: 'A modern web application built with Angular, featuring API integration and responsive design.',
      image: 'assets/images/projects/angular-api.jpg',
      demoUrl: 'https://msgoodgirl92.github.io/angularapi',
      githubUrl: 'https://github.com/msgoodgirl92/angularapi',
      technologies: ['Angular', 'TypeScript', 'SCSS', 'Material UI']
    },
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
}
