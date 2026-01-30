import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export enum PageName {
  LANDING = 'LANDING',
  WHAT_WE_DO = 'WHAT_WE_DO',
  WHO_WE_ARE = 'WHO_WE_ARE',
  OUR_WORK = 'OUR_WORK',
  BUILD_WITH_US = 'BUILD_WITH_US'
}

export enum ContentType {
  TEXT = 'TEXT',
  HTML = 'HTML',
  IMAGE_URL = 'IMAGE_URL',
  JSON = 'JSON',
  NUMBER = 'NUMBER'
}

export interface ContentPageDTO {
  idContent?: number;
  pageName: PageName;
  sectionKey: string;
  contentType: ContentType;
  contentValue: string;
  contentLabel: string;
  displayOrder: number;
  isActive: boolean;
  updatedByName?: string;
  updatedAt?: Date;
}

export interface UpdateContentRequest {
  pageName: PageName;
  sectionKey: string;
  contentType: ContentType;
  contentValue: string;
  contentLabel: string;
  displayOrder: number;
}

export interface PageContentResponse {
  pageName: string;
  content: Record<string, any>;
}

export interface UploadFileResponse {
  id: number;
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentPageService {
  private apiUrl = `${environment.apiUrl}/admin/content`;

  constructor(private http: HttpClient) { }

  // ============ PUBLIC API (Client Pages - No Auth) ============
  
  /**
   * Get page content untuk client pages
   */
  getPageContent(pageName: PageName): Observable<PageContentResponse> {
    return this.http.get<ApiResponse<PageContentResponse>>(
      `${environment.apiUrl}/public/content/pages/${pageName}`
    ).pipe(map(res => res.data));
  }

  // ============ ADMIN API (Dashboard - Requires Auth) ============
  
  /**
   * Get all content grouped by page
   */
  getAllContent(): Observable<ApiResponse<Record<string, ContentPageDTO[]>>> {
    return this.http.get<ApiResponse<Record<string, ContentPageDTO[]>>>(
      `${this.apiUrl}/all`
    );
  }

  /**
   * Get content for specific page (untuk admin edit)
   */
  getPageContentForAdmin(pageName: PageName): Observable<ApiResponse<ContentPageDTO[]>> {
    return this.http.get<ApiResponse<ContentPageDTO[]>>(
      `${this.apiUrl}/pages/${pageName}`
    );
  }

  /**
   * Create new content
   */
  createContent(request: UpdateContentRequest): Observable<ApiResponse<ContentPageDTO>> {
    return this.http.post<ApiResponse<ContentPageDTO>>(
      `${this.apiUrl}/content`, 
      request
    );
  }

  /**
   * Update existing content
   */
  updateContent(idContent: number, request: UpdateContentRequest): Observable<ApiResponse<ContentPageDTO>> {
    return this.http.put<ApiResponse<ContentPageDTO>>(
      `${this.apiUrl}/${idContent}`, 
      request
    );
  }

  /**
   * Bulk update content for a page
   */
  bulkUpdateContent(pageName: PageName, contents: UpdateContentRequest[]): Observable<ApiResponse<ContentPageDTO[]>> {
    return this.http.put<ApiResponse<ContentPageDTO[]>>(
      `${this.apiUrl}/pages/${pageName}/bulk`, 
      { contents }
    );
  }

  /**
   * Toggle active status
   */
  toggleActive(idContent: number): Observable<ApiResponse<ContentPageDTO>> {
    return this.http.patch<ApiResponse<ContentPageDTO>>(
      `${this.apiUrl}/${idContent}/toggle`, 
      {}
    );
  }

  /**
   * Delete content
   */
  deleteContent(idContent: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${idContent}`
    );
  }

  /**
   * Upload image untuk content page
   */
  uploadImage(formData: FormData) {
    return this.http.post<ApiResponse<UploadFileResponse>>(
      `${environment.apiUrl}/admin/upload/image`,
      formData
    );
  }
}