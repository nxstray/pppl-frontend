import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export enum ProjectCategory {
  WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
  MOBILE_APP = 'MOBILE_APP',
  UI_UX_DESIGN = 'UI_UX_DESIGN',
  DIGITAL_MARKETING = 'DIGITAL_MARKETING',
  AI_ML = 'AI_ML',
  CLOUD_INFRASTRUCTURE = 'CLOUD_INFRASTRUCTURE',
  OTHER = 'OTHER'
}

export interface ProjectDTO {
  idProject?: number;
  projectTitle: string;
  projectDescription?: string;
  projectCategory: ProjectCategory;
  projectImage?: string;
  projectClient?: string;
  projectYear?: number;
  projectTechnologies?: string[];
  projectUrl?: string;
  isFeatured?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  updatedByName?: string;
}

export interface ProjectSearchRequest {
  searchQuery?: string;
  category?: ProjectCategory;
  year?: number;
  page?: number;
  size?: number;
}

export interface ProjectSearchResponse {
  projects: ProjectDTO[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FilterOptions {
  categories: { value: string; label: string }[];
  years: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * PUBLIC METHODS - No auth required
   */

  getAllActiveProjects(): Observable<ApiResponse<ProjectDTO[]>> {
    return this.http.get<ApiResponse<ProjectDTO[]>>(
      `${this.apiUrl}/public/projects`
    );
  }

  getFeaturedProjects(): Observable<ApiResponse<ProjectDTO[]>> {
    return this.http.get<ApiResponse<ProjectDTO[]>>(
      `${this.apiUrl}/public/projects/featured`
    );
  }

  searchProjects(request: ProjectSearchRequest): Observable<ApiResponse<ProjectSearchResponse>> {
    return this.http.post<ApiResponse<ProjectSearchResponse>>(
      `${this.apiUrl}/public/projects/search`,
      request
    );
  }

  getFilterOptions(): Observable<ApiResponse<FilterOptions>> {
    return this.http.get<ApiResponse<FilterOptions>>(
      `${this.apiUrl}/public/projects/filter-options`
    );
  }

  /**
   * ADMIN METHODS - Auth required
   */

  getAllProjectsForAdmin(): Observable<ApiResponse<ProjectDTO[]>> {
    return this.http.get<ApiResponse<ProjectDTO[]>>(
      `${this.apiUrl}/admin/projects`
    );
  }

  getProjectById(id: number): Observable<ApiResponse<ProjectDTO>> {
    return this.http.get<ApiResponse<ProjectDTO>>(
      `${this.apiUrl}/admin/projects/${id}`
    );
  }

  createProject(project: ProjectDTO): Observable<ApiResponse<ProjectDTO>> {
    return this.http.post<ApiResponse<ProjectDTO>>(
      `${this.apiUrl}/admin/projects`,
      project
    );
  }

  updateProject(id: number, project: ProjectDTO): Observable<ApiResponse<ProjectDTO>> {
    return this.http.put<ApiResponse<ProjectDTO>>(
      `${this.apiUrl}/admin/projects/${id}`,
      project
    );
  }

  toggleActive(id: number): Observable<ApiResponse<ProjectDTO>> {
    return this.http.patch<ApiResponse<ProjectDTO>>(
      `${this.apiUrl}/admin/projects/${id}/toggle-active`,
      {}
    );
  }

  toggleFeatured(id: number): Observable<ApiResponse<ProjectDTO>> {
    return this.http.patch<ApiResponse<ProjectDTO>>(
      `${this.apiUrl}/admin/projects/${id}/toggle-featured`,
      {}
    );
  }

  deleteProject(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/admin/projects/${id}`
    );
  }

  /**
   * Helper method untuk get category display name
   */
  getCategoryDisplayName(category: ProjectCategory): string {
    const categoryMap: { [key in ProjectCategory]: string } = {
      [ProjectCategory.WEB_DEVELOPMENT]: 'Web Development',
      [ProjectCategory.MOBILE_APP]: 'Mobile Application',
      [ProjectCategory.UI_UX_DESIGN]: 'UI/UX Design',
      [ProjectCategory.DIGITAL_MARKETING]: 'Digital Marketing',
      [ProjectCategory.AI_ML]: 'AI & Machine Learning',
      [ProjectCategory.CLOUD_INFRASTRUCTURE]: 'Cloud Infrastructure',
      [ProjectCategory.OTHER]: 'Other'
    };
    return categoryMap[category];
  }
}