import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartToastComponent } from './shared/components/cart-toast/cart-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CartToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('E-comm');
}
