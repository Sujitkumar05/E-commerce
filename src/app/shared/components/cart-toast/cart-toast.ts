import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-toast',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-toast.html',
  styleUrl: './cart-toast.scss',
})
export class CartToastComponent {
  readonly cartService = inject(CartService);
}
