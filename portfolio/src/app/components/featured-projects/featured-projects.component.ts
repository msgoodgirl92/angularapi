import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Project {
  title: string;
  description: string;
  image: string;
  demoUrl: string;
  githubUrl: string;
  technologies: string[];
}

@Component({
  selector: 'app-featured-projects',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <section class="featured-projects">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        <mat-card *ngFor="let project of projects" class="project-card">
          <img mat-card-image [src]="project.image" [alt]="project.title">
          <mat-card-content>
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
            <div class="technologies">
              <span *ngFor="let tech of project.technologies" class="tech-tag">
                {{ tech }}
              </span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button [href]="project.demoUrl" target="_blank">
              <mat-icon>visibility</mat-icon>
              Live Demo
            </a>
            <a mat-button [href]="project.githubUrl" target="_blank">
              <mat-icon>code</mat-icon>
              Source Code
            </a>
          </mat-card-actions>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .featured-projects {
      padding: 4rem 2rem;
      background: #f8f9fa;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: #2d3436;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .project-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      }

      img {
        height: 200px;
        object-fit: cover;
      }

      h3 {
        font-size: 1.5rem;
        margin: 1rem 0;
        color: #2d3436;
      }

      p {
        color: #636e72;
        margin-bottom: 1rem;
      }
    }

    .technologies {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .tech-tag {
      background: #e9ecef;
      color: #2d3436;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
    }

    @media (max-width: 768px) {
      .featured-projects {
        padding: 2rem 1rem;
      }

      .section-title {
        font-size: 2rem;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FeaturedProjectsComponent {
  @Input() projects: Project[] = [];
}
