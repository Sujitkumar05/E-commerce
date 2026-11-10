import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutService } from '../../services/checkout.service';
import { DeliveryAddress } from '../../models/checkout.model';
import { AddAddressModalComponent } from '../add-address-modal/add-address-modal.component';

@Component({
  selector: 'app-delivery-address',
  standalone: true,
  imports: [CommonModule, AddAddressModalComponent],
  templateUrl: './delivery-address.component.html',
  styleUrl: './delivery-address.component.scss'
})
export class DeliveryAddressComponent {
  readonly checkoutService = inject(CheckoutService);

  isModalOpen = false;
  editingAddress: DeliveryAddress | null = null;
  deleteError: string | null = null;

  openAddModal(): void {
    this.editingAddress = null;
    this.isModalOpen = true;
    this.deleteError = null;
  }

  openEditModal(address: DeliveryAddress, event: Event): void {
    event.stopPropagation();
    this.editingAddress = address;
    this.isModalOpen = true;
    this.deleteError = null;
  }

  onModalSave(data: Omit<DeliveryAddress, 'id'>): void {
    this.checkoutService.saveAddress(data, this.editingAddress?.id);
    this.isModalOpen = false;
    this.editingAddress = null;
  }

  onModalClose(): void {
    this.isModalOpen = false;
    this.editingAddress = null;
  }

  selectAddress(id: string): void {
    this.checkoutService.selectAddress(id);
    this.deleteError = null;
  }

  deleteAddress(id: string, event: Event): void {
    event.stopPropagation();
    const success = this.checkoutService.deleteAddress(id);
    if (!success) {
      this.deleteError = 'At least one delivery address is required for checkout.';
      setTimeout(() => {
        this.deleteError = null;
      }, 3500);
    }
  }

  continueToSummary(): void {
    if (!this.checkoutService.selectedAddress()) {
      return;
    }
    this.checkoutService.setStep('summary');
  }
}

