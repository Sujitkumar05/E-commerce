import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { StorefrontHeader } from './storefront-header';

describe('StorefrontHeader', () => {
  let component: StorefrontHeader;
  let fixture: ComponentFixture<StorefrontHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontHeader],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(StorefrontHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
