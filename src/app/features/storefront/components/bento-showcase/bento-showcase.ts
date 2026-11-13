import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BentoGridService, BentoItem } from '../../../../core/services/bento-grid.service';

export type { BentoItem };

@Component({
  selector: 'app-bento-showcase',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bento-showcase.html',
  styleUrl: './bento-showcase.scss',
})
export class BentoShowcase {
  private readonly bentoGridService = inject(BentoGridService);

  get col1Items(): BentoItem[] {
    return this.bentoGridService.col1Items();
  }

  get col2Items(): BentoItem[] {
    return this.bentoGridService.col2Items();
  }

  get col3Items(): BentoItem[] {
    return this.bentoGridService.col3Items();
  }
}
