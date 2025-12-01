import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationDetailsDto } from '../../models/notification.model';

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.css']
})
export class NotificationCardComponent implements OnInit, OnDestroy {
  @Input() notification!: NotificationDetailsDto;
  @Input() autoClose: boolean = true;
  @Input() duration: number = 5000; // 5 seconds default

  isVisible: boolean = true;
  private audio?: HTMLAudioElement;
  private timeoutId?: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('🎴 Notification card initialized:', this.notification);
    
    // Play sound immediately
    setTimeout(() => {
      this.playNotificationSound();
    }, 50); // Small delay to ensure component is fully rendered
    
    if (this.autoClose) {
      this.timeoutId = setTimeout(() => {
        this.close();
      }, this.duration);
    }
    
    // Force visibility
    this.isVisible = true;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  playNotificationSound(): void {
    // Play sound immediately - don't wait for async operations
    this.playSoundImmediate();
  }

  private playSoundImmediate(): void {
    try {
      // Try the user's sound file first (most common paths)
      const soundPaths = [
        '/assets/sounds/notification.mp3',  // Absolute path
        'assets/sounds/notification.mp3',  // Relative path
        './assets/sounds/notification.mp3', // Current directory
        'assets/sounds/notification.wav',
        'assets/sounds/notification.ogg'
      ];
      
      let audioElement: HTMLAudioElement | null = null;
      let soundPlayed = false;
      
      // Try to play sound from file first
      for (const path of soundPaths) {
        try {
          audioElement = new Audio(path);
          audioElement.volume = 0.8; // Set volume to 80%
          audioElement.preload = 'auto';
          
          // Add error handler
          audioElement.onerror = () => {
            console.log(`Sound file not found at: ${path}`);
          };
          
          // Try to play
          const playPromise = audioElement.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                soundPlayed = true;
                console.log('🔔 Notification sound played successfully from:', path);
              })
              .catch(error => {
                console.log(`Could not play sound from ${path}:`, error.message);
                // Try next path
              });
          }
          
          // If sound started playing, break
          if (soundPlayed) {
            this.audio = audioElement;
            break;
          }
        } catch (e) {
          console.log(`Error loading sound from ${path}:`, e);
          // Continue to next path
        }
      }
      
      // If no sound file worked, use Web Audio API beep (always works)
      setTimeout(() => {
        if (!soundPlayed) {
          this.playBeepSound();
        }
      }, 100);
      
    } catch (error) {
      console.warn('Error in playSoundImmediate:', error);
      // Fallback to beep
      this.playBeepSound();
    }
  }

  private playBeepSound(): void {
    try {
      if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
        const AudioContextClass = AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        
        // Create a more pleasant notification sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Two-tone beep (more noticeable)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        console.log('🔔 Beep sound played (Web Audio API)');
      }
    } catch (e) {
      console.warn('Could not generate beep sound:', e);
    }
  }

  close(): void {
    this.isVisible = false;
    this.cdr.detectChanges();
    
    // Remove from DOM after animation
    setTimeout(() => {
      const element = document.querySelector(`[data-notification-id="${this.notification.notificationId}"]`);
      if (element) {
        element.remove();
      }
    }, 300);
  }

  formatDate(date: string | Date): string {
    if (!date) return 'Just now';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNotificationIcon(): string {
    const message = this.notification.message.toLowerCase();
    if (message.includes('appointment')) return '📅';
    if (message.includes('doctor')) return '👨‍⚕️';
    if (message.includes('nurse')) return '👩‍⚕️';
    if (message.includes('patient')) return '👤';
    if (message.includes('feedback')) return '💬';
    if (message.includes('report')) return '📊';
    if (message.includes('created') || message.includes('added')) return '✅';
    if (message.includes('updated') || message.includes('modified')) return '✏️';
    if (message.includes('deleted') || message.includes('removed')) return '🗑️';
    return '🔔';
  }
}

