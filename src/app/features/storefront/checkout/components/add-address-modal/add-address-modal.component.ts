import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryAddress, AddressType } from '../../models/checkout.model';

@Component({
  selector: 'app-add-address-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-address-modal.component.html',
  styleUrl: './add-address-modal.component.scss'
})
export class AddAddressModalComponent implements OnInit {
  @Input() addressToEdit: DeliveryAddress | null = null;
  @Output() saveAddress = new EventEmitter<Omit<DeliveryAddress, 'id'>>();
  @Output() close = new EventEmitter<void>();

  // Form Fields
  name = '';
  phone = '';
  alternatePhone = '';
  pincode = '';
  houseAddress = '';
  locality = '';
  city = '';
  state = '';
  landmark = '';
  type: AddressType = 'Home';
  isDefault = false;

  // Validation Flags
  submitted = false;

  // Common Indian States for quick selection
  readonly stateList = [
    'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
    'Gujarat', 'Telangana', 'West Bengal', 'Rajasthan', 'Haryana',
    'Punjab', 'Madhya Pradesh', 'Kerala', 'Bihar', 'Andhra Pradesh'
  ];

  ngOnInit(): void {
    if (this.addressToEdit) {
      this.name = this.addressToEdit.name;
      this.phone = this.addressToEdit.phone;
      this.alternatePhone = this.addressToEdit.alternatePhone || '';
      this.pincode = this.addressToEdit.pincode;
      this.houseAddress = this.addressToEdit.houseAddress;
      this.locality = this.addressToEdit.locality;
      this.city = this.addressToEdit.city;
      this.state = this.addressToEdit.state;
      this.landmark = this.addressToEdit.landmark || '';
      this.type = this.addressToEdit.type;
      this.isDefault = !!this.addressToEdit.isDefault;
    }
  }

  onPincodeChange(): void {
    const pin = this.pincode.trim();
    if (pin.length === 6 && !this.city && !this.state) {
      if (pin.startsWith('11')) {
        this.city = 'New Delhi';
        this.state = 'Delhi';
      } else if (pin.startsWith('40')) {
        this.city = 'Mumbai';
        this.state = 'Maharashtra';
      } else if (pin.startsWith('56')) {
        this.city = 'Bengaluru';
        this.state = 'Karnataka';
      } else if (pin.startsWith('60')) {
        this.city = 'Chennai';
        this.state = 'Tamil Nadu';
      } else if (pin.startsWith('50')) {
        this.city = 'Hyderabad';
        this.state = 'Telangana';
      } else if (pin.startsWith('70')) {
        this.city = 'Kolkata';
        this.state = 'West Bengal';
      } else if (pin.startsWith('22') || pin.startsWith('20')) {
        this.city = 'Noida';
        this.state = 'Uttar Pradesh';
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (
      !this.name.trim() ||
      !this.phone.trim() ||
      !this.pincode.trim() ||
      !this.houseAddress.trim() ||
      !this.locality.trim() ||
      !this.city.trim() ||
      !this.state.trim()
    ) {
      return;
    }

    this.saveAddress.emit({
      name: this.name.trim(),
      phone: this.phone.trim(),
      alternatePhone: this.alternatePhone.trim() || undefined,
      pincode: this.pincode.trim(),
      houseAddress: this.houseAddress.trim(),
      locality: this.locality.trim(),
      city: this.city.trim(),
      state: this.state.trim(),
      landmark: this.landmark.trim() || undefined,
      type: this.type,
      isDefault: this.isDefault
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom')) {
      this.close.emit();
    }
  }
}

