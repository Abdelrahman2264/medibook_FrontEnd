import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, delay } from 'rxjs';
import { 
  CreateFeedbackDto,
  FeedbackDetailsDto,
  Feedback,
  mapFeedbackDetailsDtoToFeedback,
  UpdateFeedbackDto,
  DoctorReplyDto
} from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbacksService {
  private readonly API_BASE_URL = 'http://localhost:5262/api';
  
  constructor(private http: HttpClient) {}

  // Enhanced error handler
  private handleError(operation: string, error: any): never {
    console.error(`❌ Error in ${operation}:`, error);
    
    let userMessage = 'An error occurred. Please try again.';
    
    if (error.status === 0) {
      userMessage = 'Network error - cannot connect to server.';
    } else if (error.status === 400) {
      userMessage = error.error?.message || 'Invalid request.';
    } else if (error.status === 404) {
      userMessage = 'Resource not found.';
    } else if (error.status === 500) {
      userMessage = 'Server error. Please try again later.';
    }
    
    throw { 
      message: userMessage,
      originalError: error 
    };
  }

  // Create feedback
  createFeedback(body: CreateFeedbackDto): Observable<any> {
    console.log('🔄 Creating feedback with data:', body);
    return this.http.post<any>(`${this.API_BASE_URL}/Feedbacks/create`, body).pipe(
      delay(400),
      map(response => {
        console.log('✅ Feedback created successfully:', response);
        return response;
      }),
      catchError(error => this.handleError('creating feedback', error))
    );
  }

  // Get all feedbacks
  getAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/Feedbacks/all`).pipe(
      delay(500),
      map(response => {
        console.log('📥 Raw feedbacks data from API:', response);
        
        const feedbacksArray = Array.isArray(response) ? response : 
                                response.data ? response.data : 
                                response;
        
        if (!Array.isArray(feedbacksArray)) {
          console.error('❌ Unexpected API response format:', response);
          throw new Error('Invalid API response format');
        }
        
        const mapped = feedbacksArray.map(dto => {
          const feedback = mapFeedbackDetailsDtoToFeedback(dto);
          console.log('✅ Mapped feedback:', { 
            feedbackId: feedback.feedbackId, 
            patientName: feedback.patientName 
          });
          return feedback;
        });
        
        console.log('📊 Total feedbacks mapped:', mapped.length);
        return mapped;
      }),
      catchError(error => this.handleError('fetching feedbacks', error))
    );
  }

  // Get feedback by ID
  getFeedbackById(id: number): Observable<Feedback> {
    console.log('🔍 Fetching feedback by ID:', id);
    return this.http.get<any>(`${this.API_BASE_URL}/Feedbacks/${id}`).pipe(
      delay(300),
      map(response => {
        console.log('📥 Raw feedback data from API:', response);
        
        const feedbackData = response.data || response;
        const feedback = mapFeedbackDetailsDtoToFeedback(feedbackData);
        
        if (feedback.feedbackId === 0 || !feedback.feedbackId) {
          console.error('❌ ERROR: Feedback ID is 0 or invalid after mapping!', { feedbackData, feedback });
          throw new Error('Invalid feedback ID received from server');
        }
        
        return feedback;
      }),
      catchError(error => this.handleError(`fetching feedback by ID ${id}`, error))
    );
  }

  // Get feedbacks by doctor ID
  getFeedbacksByDoctor(doctorId: number): Observable<Feedback[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/Feedbacks/doctor/${doctorId}`).pipe(
      delay(500),
      map(response => {
        console.log('📥 Raw doctor feedbacks data from API:', response);
        
        const feedbacksArray = Array.isArray(response) ? response : 
                                response.data ? response.data : 
                                response;
        
        if (!Array.isArray(feedbacksArray)) {
          console.error('❌ Unexpected API response format:', response);
          throw new Error('Invalid API response format');
        }
        
        const mapped = feedbacksArray.map(dto => mapFeedbackDetailsDtoToFeedback(dto));
        console.log('📊 Total doctor feedbacks mapped:', mapped.length);
        return mapped;
      }),
      catchError(error => this.handleError(`fetching feedbacks for doctor ${doctorId}`, error))
    );
  }

  // Get feedbacks by patient ID
  getFeedbacksByPatient(patientId: number): Observable<Feedback[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/Feedbacks/patient/${patientId}`).pipe(
      delay(500),
      map(response => {
        console.log('📥 Raw patient feedbacks data from API:', response);
        
        const feedbacksArray = Array.isArray(response) ? response : 
                                response.data ? response.data : 
                                response;
        
        if (!Array.isArray(feedbacksArray)) {
          console.error('❌ Unexpected API response format:', response);
          throw new Error('Invalid API response format');
        }
        
        const mapped = feedbacksArray.map(dto => mapFeedbackDetailsDtoToFeedback(dto));
        console.log('📊 Total patient feedbacks mapped:', mapped.length);
        return mapped;
      }),
      catchError(error => this.handleError(`fetching feedbacks for patient ${patientId}`, error))
    );
  }

  // Update feedback
  updateFeedback(body: UpdateFeedbackDto): Observable<any> {
    console.log('🔄 Updating feedback with data:', body);
    return this.http.put<any>(`${this.API_BASE_URL}/Feedbacks/update`, body).pipe(
      delay(400),
      map(response => {
        console.log('✅ Feedback updated successfully:', response);
        return response;
      }),
      catchError(error => this.handleError('updating feedback', error))
    );
  }

  // Add doctor reply
  addDoctorReply(body: DoctorReplyDto): Observable<any> {
    console.log('🔄 Adding doctor reply with data:', body);
    return this.http.put<any>(`${this.API_BASE_URL}/Feedbacks/add-doctor-reply`, body).pipe(
      delay(400),
      map(response => {
        console.log('✅ Doctor reply added successfully:', response);
        return response;
      }),
      catchError(error => this.handleError('adding doctor reply', error))
    );
  }

  // Toggle favourite
  toggleFavourite(feedbackId: number): Observable<any> {
    console.log('🔄 Toggling favourite for feedback:', feedbackId);
    return this.http.patch<any>(`${this.API_BASE_URL}/Feedbacks/${feedbackId}/toggle-favourite`, {}).pipe(
      delay(300),
      map(response => {
        console.log('✅ Favourite toggled successfully:', response);
        return response;
      }),
      catchError(error => this.handleError(`toggling favourite for feedback ${feedbackId}`, error))
    );
  }

  // Delete feedback
  deleteFeedback(feedbackId: number): Observable<any> {
    console.log('🔄 Deleting feedback:', feedbackId);
    return this.http.delete<any>(`${this.API_BASE_URL}/Feedbacks/${feedbackId}`).pipe(
      delay(400),
      map(response => {
        console.log('✅ Feedback deleted successfully:', response);
        return response;
      }),
      catchError(error => this.handleError(`deleting feedback ${feedbackId}`, error))
    );
  }
}



