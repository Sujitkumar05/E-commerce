import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminBanners } from './banners';
import { BannerService } from '../../../../core/services/banner.service';

describe('AdminBanners Component', () => {
  let component: AdminBanners;
  let fixture: ComponentFixture<AdminBanners>;
  let bannerService: BannerService;

  beforeEach(async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    await TestBed.configureTestingModule({
      imports: [AdminBanners],
      providers: [BannerService],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBanners);
    component = fixture.componentInstance;
    bannerService = TestBed.inject(BannerService);
    fixture.detectChanges();
  });

  it('should create the AdminBanners component and bind banner metrics', () => {
    expect(component).toBeTruthy();
    expect(component.totalBanners).toBeGreaterThanOrEqual(15);
    expect(component.bannerSections.length).toBe(11);
    expect(component.activeBanners).toBeGreaterThan(0);
  });

  it('should filter banners by search term matching title or section', () => {
    component.searchTerm = 'Ayurvedic';
    const filtered = component.filteredBanners;
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some((b) => b.title.includes('Ayurvedic'))).toBe(true);

    component.searchTerm = 'NonExistentXYZ999';
    expect(component.filteredBanners.length).toBe(0);
  });

  it('should filter banners by section filter', () => {
    component.sectionFilter = 'Product Catalog Banners';
    const filtered = component.filteredBanners;
    expect(filtered.length).toBe(5);
    expect(filtered.every((b) => b.section === 'Product Catalog Banners')).toBe(true);
  });

  it('should filter banners by status filter', () => {
    component.statusFilter = 'Active';
    expect(component.filteredBanners.every((b) => b.status === 'Active')).toBe(true);
  });

  it('should prefill form when addBannerForSection is invoked', () => {
    component.addBannerForSection('Product Catalog Banners');
    expect(component.bannerForm.section).toBe('Product Catalog Banners');
    expect(component.bannerForm.image).toContain('wellness-banner.jpg');
    expect(component.isEditing).toBe(false);
  });

  it('should populate form and set editing mode when editBanner is called', () => {
    const target = component.banners[0];
    component.editBanner(target);

    expect(component.isEditing).toBe(true);
    expect(component.editingId).toBe(target.id);
    expect(component.bannerForm.title).toBe(target.title);
    expect(component.bannerForm.section).toBe(target.section);
  });

  it('should save a new banner via BannerService', () => {
    const prevCount = component.totalBanners;
    component.resetForm();
    component.bannerForm.title = 'New Test Banner';
    component.bannerForm.section = 'Home Hero Carousel';
    component.bannerForm.image = 'test-image.jpg';

    component.saveBanner();

    expect(component.totalBanners).toBe(prevCount + 1);
    const added = component.banners.find((b) => b.title === 'New Test Banner');
    expect(added).toBeDefined();
    expect(component.isEditing).toBe(false);
  });

  it('should update an existing banner when saveBanner is called in edit mode', () => {
    const target = component.banners[0];
    component.editBanner(target);
    component.bannerForm.title = 'Modified Brand Title';

    component.saveBanner();

    const updated = bannerService.getBannerById(target.id);
    expect(updated?.title).toBe('Modified Brand Title');
    expect(component.isEditing).toBe(false);
  });

  it('should toggle status of a banner', () => {
    const target = component.banners[0];
    const initialStatus = target.status;

    component.toggleBannerStatus(target);
    const updated = bannerService.getBannerById(target.id);
    expect(updated?.status).not.toBe(initialStatus);
  });

  it('should reset form state cleanly', () => {
    component.isEditing = true;
    component.editingId = 99;
    component.bannerForm.title = 'Temporary Dirty Title';

    component.resetForm();

    expect(component.isEditing).toBe(false);
    expect(component.editingId).toBeNull();
    expect(component.bannerForm.title).toBe('');
  });
});

