import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss']
})
export class LoadingOverlayComponent {
  @Input() show = false;
  @Input() title = 'Memproses...';
  @Input() message = 'Mohon tunggu sebentar';
  @Input() showProgress = false;
  @Input() progress = 0;
}