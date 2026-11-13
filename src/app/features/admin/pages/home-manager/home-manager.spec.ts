import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminHomeManager } from './home-manager';
import { HomepageBuilderService } from '../../../../core/services/homepage-builder.service';
import { BannerService } from '../../../../core/services/banner.service';
import { ProductService } from '../../../../core/services/product.service';

describe('AdminHomeManager Component', () => {
  let component: AdminHomeManager;
  let fixture: ComponentFixture<AdminHomeManager>;
  let layoutService: HomepageBuilderService;

  beforeEach(async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    await TestBed.configureTestingModule({
      imports: [AdminHomeManager],
      providers: [
        provideHttpClient(),
        HomepageBuilderService,
        BannerService,
        ProductService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminHomeManager);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(HomepageBuilderService);
    fixture.detectChanges();
  });

  it('should create the AdminHomeManager component and load default sections', () => {
    expect(component).toBeTruthy();
    expect(component.sections.length).toBe(9);
    expect(component.activeCount).toBe(9);
    expect(component.inactiveCount).toBe(0);
    expect(component.hasUnsavedChanges).toBe(false);
  });

  it('should switch between builder and preview views', () => {
    expect(component.activeView).toBe('builder');
    component.activeView = 'preview';
    expect(component.activeView).toBe('preview');

    component.previewDevice = 'mobile';
    expect(component.previewDevice).toBe('mobile');
    component.previewDevice = 'tablet';
    expect(component.previewDevice).toBe('tablet');
  });

  it('should filter sections by search term', () => {
    component.searchTerm = 'Bento';
    const filtered = component.filteredSections;
    expect(filtered.length).toBe(1);
    expect(filtered[0].componentId).toBe('sec-bento-grid');

    component.searchTerm = 'NonExistentXYZ999';
    expect(component.filteredSections.length).toBe(0);
  });

  it('should move sections up and down', () => {
    const firstId = component.sections[0].id;
    const secondId = component.sections[1].id;

    component.moveUp(1);
    expect(component.sections[0].id).toBe(secondId);
    expect(component.sections[1].id).toBe(firstId);

    component.moveDown(0);
    expect(component.sections[0].id).toBe(firstId);
    expect(component.sections[1].id).toBe(secondId);
  });

  it('should toggle section visibility', () => {
    const sec = component.sections[0];
    component.toggleSectionEnabled(sec);
    expect(component.sections[0].enabled).toBe(false);
    expect(component.activeCount).toBe(8);
  });

  it('should open edit modal and save changes to draft', () => {
    const target = component.sections[0];
    component.openEditModal(target);
    expect(component.isModalOpen).toBe(true);
    expect(component.isEditing).toBe(true);

    component.currentSection.title = 'Updated Hero Title';
    component.saveSection();

    expect(component.isModalOpen).toBe(false);
    expect(component.sections[0].title).toBe('Updated Hero Title');
  });

  it('should open add modal and create a new section', () => {
    component.openAddModal();
    expect(component.isModalOpen).toBe(true);
    expect(component.isEditing).toBe(false);

    component.currentSection.name = 'New Organic Harvest';
    component.currentSection.title = 'Farm-to-Door Herbal Harvest';
    component.saveSection();

    expect(component.sections.length).toBe(10);
  });

  it('should duplicate a section', () => {
    const target = component.sections[0];
    component.duplicateSection(target);
    expect(component.sections.length).toBe(10);
  });

  it('should publish layout changes and sync live', () => {
    component.moveUp(1);
    component.publishLayout();
    expect(component.hasUnsavedChanges).toBe(false);
  });

  it('should handle drag and drop reordering', () => {
    const firstSec = component.sections[0];
    const secondSec = component.sections[1];

    const mockDragStartEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: () => {}
      }
    } as unknown as DragEvent;

    component.onDragStart(mockDragStartEvent, firstSec);
    expect(component.draggedId).toBe(firstSec.id);

    const mockDropEvent = {
      preventDefault: () => {}
    } as unknown as DragEvent;

    component.onDrop(mockDropEvent, secondSec);
    expect(component.sections[0].id).toBe(secondSec.id);
    expect(component.sections[1].id).toBe(firstSec.id);
  });
});

