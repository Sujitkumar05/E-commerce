import { describe, it, expect, beforeEach } from 'vitest';
import { BannerService, BannerItem } from './banner.service';

describe('BannerService', () => {
  let service: BannerService;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    service = new BannerService();
  });

  it('should initialize with all 11 managed storefront sections', () => {
    expect(service.bannerSections.length).toBe(11);
    const keys = service.bannerSections.map((s) => s.key);
    expect(keys).toContain('Home Hero Carousel');
    expect(keys).toContain('Product Catalog Banners');
    expect(keys).toContain('Home Wellness Banner');
    expect(keys).toContain('Homeopathy Showcase Banner');
    expect(keys).toContain('Signature Picks Banners');
    expect(keys).toContain('Regional Banners');
    expect(keys).toContain('Product Collection Banners');
    expect(keys).toContain('Homeopathy Header Banner');
    expect(keys).toContain('Product Details Power Card');
    expect(keys).toContain('Top Announcement Bar');
    expect(keys).toContain('Footer Trust Banner');
  });

  it('should initialize with default registered banners across the store', () => {
    const banners = service.banners();
    expect(banners.length).toBeGreaterThanOrEqual(15);
    expect(service.totalBanners()).toBe(banners.length);
    expect(service.activeBanners()).toBeGreaterThan(0);
  });

  it('should filter banners by section correctly', () => {
    const heroSlides = service.getBannersBySection('Home Hero Carousel');
    expect(heroSlides.length).toBe(4);
    heroSlides.forEach((slide) => {
      expect(slide.section).toBe('Home Hero Carousel');
    });

    const catalogBanners = service.getBannersBySection('Product Catalog Banners');
    expect(catalogBanners.length).toBe(5);
  });

  it('should retrieve category-specific banner for product catalog', () => {
    const pantryBanner = service.getCategoryBanner('pantry');
    expect(pantryBanner).toBeDefined();
    expect(pantryBanner?.title).toContain('Food & Pantry');
    expect(pantryBanner?.image).toContain('pantry-banner.jpg');

    const wellnessBanner = service.getCategoryBanner('wellness');
    expect(wellnessBanner).toBeDefined();
    expect(wellnessBanner?.image).toContain('wellness-banner.jpg');
  });

  it('should add a new banner and assign unique ID', () => {
    const initialCount = service.totalBanners();
    const created = service.addBanner({
      title: 'Summer Flash Sale',
      subtitle: 'Up to 40% off on all organic spices',
      image: '/images/promo/summer-sale.jpg',
      section: 'Home Hero Carousel',
      status: 'Active',
      sortOrder: 10,
      link: '/products',
    });

    expect(created.id).toBeDefined();
    expect(service.totalBanners()).toBe(initialCount + 1);

    const retrieved = service.getBannerById(created.id);
    expect(retrieved?.title).toBe('Summer Flash Sale');
  });

  it('should update an existing banner in-place', () => {
    const target = service.banners()[0];
    const success = service.updateBanner(target.id, {
      title: 'Updated Title by Admin',
      subtitle: 'Updated Subtitle',
    });

    expect(success).toBe(true);
    const updated = service.getBannerById(target.id);
    expect(updated?.title).toBe('Updated Title by Admin');
    expect(updated?.subtitle).toBe('Updated Subtitle');
  });

  it('should replace a banner image directly', () => {
    const target = service.banners()[0];
    const success = service.replaceBannerImage(target.id, 'data:image/jpeg;base64,mockBase64Data');

    expect(success).toBe(true);
    const updated = service.getBannerById(target.id);
    expect(updated?.image).toBe('data:image/jpeg;base64,mockBase64Data');
  });

  it('should toggle active and inactive status', () => {
    const target = service.banners()[0];
    expect(target.status).toBe('Active');

    service.toggleStatus(target.id);
    expect(service.getBannerById(target.id)?.status).toBe('Inactive');

    service.toggleStatus(target.id);
    expect(service.getBannerById(target.id)?.status).toBe('Active');
  });

  it('should delete a banner by ID', () => {
    const target = service.banners()[0];
    const initialCount = service.totalBanners();

    const success = service.deleteBanner(target.id);
    expect(success).toBe(true);
    expect(service.totalBanners()).toBe(initialCount - 1);
    expect(service.getBannerById(target.id)).toBeUndefined();
  });

  it('should delete multiple banners by IDs', () => {
    const all = service.banners();
    const toDelete = [all[0].id, all[1].id];

    service.deleteMultiple(toDelete);
    expect(service.getBannerById(toDelete[0])).toBeUndefined();
    expect(service.getBannerById(toDelete[1])).toBeUndefined();
  });

  it('should reset all banners to default state', () => {
    // Delete some and add custom
    const first = service.banners()[0];
    service.deleteBanner(first.id);
    service.addBanner({
      title: 'Temporary Test',
      subtitle: 'Sub',
      image: 'img.jpg',
      section: 'Footer Trust Banner',
      status: 'Active',
      sortOrder: 99,
    });

    service.resetToDefaults();
    expect(service.totalBanners()).toBe(18);
    expect(service.getBannerById(first.id)).toBeDefined();
  });
});

