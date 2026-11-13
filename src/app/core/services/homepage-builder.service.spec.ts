import { describe, it, expect, beforeEach } from 'vitest';
import { HomepageBuilderService, HomepageSection } from './homepage-builder.service';

describe('HomepageBuilderService', () => {
  let service: HomepageBuilderService;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    service = new HomepageBuilderService();
  });

  it('should initialize with all 9 core homepage sections', () => {
    const published = service.publishedSections();
    expect(published.length).toBe(9);

    const componentIds = published.map((s) => s.componentId);
    expect(componentIds).toContain('sec-hero-banner');
    expect(componentIds).toContain('sec-shop-categories');
    expect(componentIds).toContain('sec-trust-features');
    expect(componentIds).toContain('sec-featured-products');
    expect(componentIds).toContain('sec-storefront-products');
    expect(componentIds).toContain('sec-bento-grid');
    expect(componentIds).toContain('sec-regional-specialities');
    expect(componentIds).toContain('sec-wellness-showcase');
    expect(componentIds).toContain('sec-homeopathy-showcase');
  });

  it('should calculate active sections correctly', () => {
    expect(service.activeSectionsCount()).toBe(9);
    expect(service.inactiveSectionsCount()).toBe(0);
    expect(service.activePublishedSections().length).toBe(9);
  });

  it('should move a section up and swap positions', () => {
    const initialFirst = service.workingSections()[0].id;
    const initialSecond = service.workingSections()[1].id;

    service.moveUp(1);

    const afterMove = service.workingSections();
    expect(afterMove[0].id).toBe(initialSecond);
    expect(afterMove[1].id).toBe(initialFirst);
  });

  it('should move a section down and swap positions', () => {
    const initialFirst = service.workingSections()[0].id;
    const initialSecond = service.workingSections()[1].id;

    service.moveDown(0);

    const afterMove = service.workingSections();
    expect(afterMove[0].id).toBe(initialSecond);
    expect(afterMove[1].id).toBe(initialFirst);
  });

  it('should toggle section visibility', () => {
    const target = service.workingSections()[0];
    expect(target.enabled).toBe(true);

    service.toggleVisibility(target.id);
    expect(service.workingSections()[0].enabled).toBe(false);
    expect(service.activeSectionsCount()).toBe(8);
    expect(service.inactiveSectionsCount()).toBe(1);
    expect(service.activePublishedSections().length).toBe(8);
  });

  it('should create a new custom section', () => {
    const created = service.createSection({
      id: 'sec-custom-monsoon',
      componentId: 'sec-custom-collection',
      name: 'Monsoon Wellness Essentials',
      tag: 'SEASONAL CURE',
      title: 'Monsoon Healing & Immunity',
      subtitle: 'Doctor-formulated teas and warm spices.',
      description: 'Special seasonal collection.',
      enabled: true,
      order: 10,
      type: 'Showcase',
      itemsCount: 4,
      previewImage: '/images/wellness/wellness-banner.jpg',
      lastUpdated: 'Just now',
      styling: {
        background: '#f0fdf4',
        textColor: '#064e3b',
        padding: 'py-5',
        borderRadius: '16px',
        columns: 4,
      },
      productConfig: {
        source: 'category',
        categoryFilter: 'wellness',
        productLimit: 4,
        displayLayout: 'grid',
        cardStyle: 'standard',
      },
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Monsoon Wellness Essentials');
    expect(service.workingSections().length).toBe(10);
  });

  it('should duplicate an existing section', () => {
    const target = service.workingSections()[0];
    const cloned = service.duplicateSection(target.id);

    expect(cloned).toBeDefined();
    expect(cloned?.name).toContain('(Copy)');
    expect(service.workingSections().length).toBe(10);
  });

  it('should update section properties in draft', () => {
    const target = service.workingSections()[0];
    const success = service.updateSection(target.id, {
      title: 'Brand New Dynamic Title',
      subtitle: 'Curated by Store Admin',
    });

    expect(success).toBe(true);
    const updated = service.getSectionById(target.id);
    expect(updated?.title).toBe('Brand New Dynamic Title');
    expect(updated?.subtitle).toBe('Curated by Store Admin');
  });

  it('should delete a section', () => {
    const target = service.workingSections()[0];
    const initialCount = service.workingSections().length;

    const success = service.deleteSection(target.id);
    expect(success).toBe(true);
    expect(service.workingSections().length).toBe(initialCount - 1);
  });

  it('should publish draft changes to live storefront and allow restore', () => {
    const target = service.workingSections()[0];
    service.toggleVisibility(target.id);
    expect(service.activePublishedSections().length).toBe(8);

    // Publish to live
    service.publishToLive();
    expect(service.activePublishedSections().length).toBe(8);

    // Reset restores defaults
    service.resetToDefaults();
    expect(service.activePublishedSections().length).toBe(9);
  });

  it('should reset all sections to default configuration', () => {
    service.deleteSection(service.workingSections()[0].id);
    expect(service.workingSections().length).toBe(8);

    service.resetToDefaults();
    expect(service.workingSections().length).toBe(9);
    expect(service.publishedSections().length).toBe(9);
    expect(service.hasUnsavedChanges()).toBe(false);
  });
});

