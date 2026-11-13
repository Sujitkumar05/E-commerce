import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HomepageBuilderService,
  HomepageSection,
  SectionType,
} from '../../../../core/services/homepage-builder.service';
import { BannerService } from '../../../../core/services/banner.service';
import { ProductService, ProductDetailModel } from '../../../../core/services/product.service';
import { ExploreCategoryService, ExploreCategory } from '../../../../core/services/explore-category.service';

@Component({
  selector: 'app-admin-home-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-manager.html',
  styleUrl: './home-manager.scss',
})
export class AdminHomeManager {
  readonly homeLayoutService = inject(HomepageBuilderService);
  readonly bannerService = inject(BannerService);
  readonly exploreCategoryService = inject(ExploreCategoryService);
  private readonly productService = inject(ProductService);

  // Active Tab: 'builder' | 'preview' | 'categories'
  activeView: 'builder' | 'preview' | 'categories' = 'builder';

  // Preview Device Frame: 'desktop' | 'tablet' | 'mobile'
  previewDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop';

  // Search & Filter
  searchTerm: string = '';
  typeFilter: string = 'All';

  // Modal / Drawer state for Add/Edit Section
  isModalOpen: boolean = false;
  isEditing: boolean = false;
  activeModalTab: 'content' | 'styling' | 'products' = 'content';

  // Notification Toast Message
  notificationMessage: string = '';

  // Working Section Model for Edit/Add
  currentSection: HomepageSection = {
    id: '',
    componentId: 'sec-custom-collection',
    name: '',
    tag: '',
    title: '',
    subtitle: '',
    description: '',
    enabled: true,
    order: 1,
    type: 'Showcase',
    itemsCount: 4,
    previewImage: '/images/wellness/wellness-banner.jpg',
    lastUpdated: 'Just now',
    styling: {
      background: '#ffffff',
      textColor: '#17251c',
      padding: 'py-5',
      borderRadius: '16px',
      columns: 4,
    },
    productConfig: {
      source: 'all',
      categoryFilter: 'wellness',
      productLimit: 4,
      displayLayout: 'grid',
      cardStyle: 'standard',
    },
  };

  // Preset templates for creating new sections
  readonly sectionTemplates = [
    {
      id: 'sec-custom-collection',
      name: 'Custom Product Collection',
      tag: 'CURATED ESSENTIALS',
      type: 'Showcase' as SectionType,
      desc: 'Configurable product showcase with category filter, grid or carousel layout.',
      icon: 'bi-grid-3x3-gap-fill',
    },
    {
      id: 'sec-featured-products',
      name: 'Trending & Best Sellers',
      tag: 'TRENDING THIS WEEK',
      type: 'Showcase' as SectionType,
      desc: 'High-velocity featured products with quick Add-to-Cart actions.',
      icon: 'bi-fire',
    },
    {
      id: 'sec-bento-grid',
      name: 'Signature Picks Bento Grid',
      tag: 'SIGNATURE PICKS',
      type: 'Grid' as SectionType,
      desc: 'Mosaic bento box cards highlighting seasonal and artisanal collections.',
      icon: 'bi-boxes',
    },
    {
      id: 'sec-regional-specialities',
      name: 'Regional Specialities Bar',
      tag: 'AUTHORIZED PARTNERS',
      type: 'Showcase' as SectionType,
      desc: 'Logo and badge strip showcasing authentic GI-tagged regional brands.',
      icon: 'bi-geo-alt-fill',
    },
    {
      id: 'sec-wellness-showcase',
      name: 'Split Banner + Products Showcase',
      tag: 'HERBAL ESSENTIALS',
      type: 'Banner' as SectionType,
      desc: 'Hero vertical promotional banner on the left with horizontal scrollable products.',
      icon: 'bi-layout-sidebar-inset',
    },
    {
      id: 'sec-trust-features',
      name: 'Trust Badges & Value Bar',
      tag: 'SERVICE COMMITMENT',
      type: 'Features' as SectionType,
      desc: '4 horizontal customer commitment badges for shipping, purity, and support.',
      icon: 'bi-shield-check',
    },
  ];

  // Background color presets for visual styling
  readonly backgroundPresets = [
    { label: 'Clean White', value: '#ffffff', textColor: '#17251c' },
    { label: 'Slate Soft', value: '#f8fafc', textColor: '#17251c' },
    { label: 'Pastel Mint', value: '#f0fdf4', textColor: '#064e3b' },
    { label: 'Warm Cream', value: '#fefce8', textColor: '#713f12' },
    { label: 'Soft Blue', value: '#eff6ff', textColor: '#1e3a8a' },
    { label: 'Rose Blush', value: '#fff1f2', textColor: '#881337' },
    { label: 'Deep Heritage', value: '#0f172a', textColor: '#ffffff' },
  ];

  // Working sections from service
  get sections(): HomepageSection[] {
    return this.homeLayoutService.workingSections();
  }

  get activeCount(): number {
    return this.homeLayoutService.activeSectionsCount();
  }

  get inactiveCount(): number {
    return this.homeLayoutService.inactiveSectionsCount();
  }

  get hasUnsavedChanges(): boolean {
    return this.homeLayoutService.hasUnsavedChanges();
  }

  get filteredSections(): HomepageSection[] {
    return this.sections
      .filter((s) => {
        const matchesSearch =
          !this.searchTerm.trim() ||
          s.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          s.tag.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          s.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          s.componentId.toLowerCase().includes(this.searchTerm.toLowerCase());

        const matchesType = this.typeFilter === 'All' || s.type === this.typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => a.order - b.order);
  }

  // Sample products for live preview
  get previewProducts(): ProductDetailModel[] {
    return this.productService.getAllProducts().slice(0, 8);
  }

  // DRAG & DROP REORDER STATE
  draggedId: string | null = null;
  dragOverId: string | null = null;

  onDragStart(event: DragEvent, sec: HomepageSection): void {
    this.draggedId = sec.id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', sec.id);
    }
  }

  onDragOver(event: DragEvent, sec: HomepageSection): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverId = sec.id;
  }

  onDragLeave(sec: HomepageSection): void {
    if (this.dragOverId === sec.id) {
      this.dragOverId = null;
    }
  }

  onDrop(event: DragEvent, targetSec: HomepageSection): void {
    event.preventDefault();
    if (this.draggedId && this.draggedId !== targetSec.id) {
      const fromIdx = this.sections.findIndex((s) => s.id === this.draggedId);
      const toIdx = this.sections.findIndex((s) => s.id === targetSec.id);
      if (fromIdx !== -1 && toIdx !== -1) {
        this.homeLayoutService.reorder(fromIdx, toIdx);
        this.showToast(`Moved "${this.sections[toIdx].name}" to position #${toIdx + 1}`);
      }
    }
    this.draggedId = null;
    this.dragOverId = null;
  }

  onDragEnd(): void {
    this.draggedId = null;
    this.dragOverId = null;
  }

  // REORDER CONTROLS
  moveUp(target: string | number): void {
    this.homeLayoutService.moveUp(target);
    this.showToast('Section moved up and synced to storefront');
  }

  moveDown(target: string | number): void {
    this.homeLayoutService.moveDown(target);
    this.showToast('Section moved down and synced to storefront');
  }

  // TOGGLE STATUS
  toggleSectionEnabled(section: HomepageSection): void {
    this.homeLayoutService.toggleVisibility(section.id);
    const newStatus = !section.enabled ? 'visible' : 'hidden';
    this.showToast(`Section "${section.name}" is now ${newStatus} on the website.`);
  }

  // DUPLICATE SECTION
  duplicateSection(section: HomepageSection): void {
    const cloned = this.homeLayoutService.duplicateSection(section.id);
    if (cloned) {
      this.showToast(`Duplicated section as "${cloned.name}"`);
    }
  }

  // ADD SECTION
  openAddModal(): void {
    this.isEditing = false;
    this.activeModalTab = 'content';
    this.currentSection = {
      id: 'sec-custom-' + Date.now(),
      componentId: 'sec-custom-collection',
      name: '',
      tag: 'NEW COLLECTION',
      title: 'Handpicked Picks for You',
      subtitle: 'Explore our latest curation of authentic wellness and everyday essentials.',
      description: 'Custom curated storefront section.',
      enabled: true,
      order: this.sections.length + 1,
      type: 'Showcase',
      itemsCount: 4,
      previewImage: '/images/wellness/wellness-banner.jpg',
      lastUpdated: 'Just now',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-5',
        borderRadius: '16px',
        columns: 4,
      },
      productConfig: {
        source: 'all',
        categoryFilter: 'wellness',
        productLimit: 4,
        displayLayout: 'grid',
        cardStyle: 'standard',
      },
    };
    this.isModalOpen = true;
  }

  // EDIT SECTION
  openEditModal(section: HomepageSection): void {
    this.isEditing = true;
    this.activeModalTab = 'content';
    this.currentSection = JSON.parse(JSON.stringify(section));
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  applyTemplate(tpl: (typeof this.sectionTemplates)[0]): void {
    this.currentSection.componentId = tpl.id;
    this.currentSection.name = tpl.name;
    this.currentSection.tag = tpl.tag;
    this.currentSection.type = tpl.type;
    this.currentSection.description = tpl.desc;
  }

  applyBackgroundPreset(preset: (typeof this.backgroundPresets)[0]): void {
    this.currentSection.styling.background = preset.value;
    this.currentSection.styling.textColor = preset.textColor;
  }

  saveSection(): void {
    if (!this.currentSection.name.trim()) {
      alert('Please provide a Section Name');
      return;
    }

    if (this.isEditing) {
      this.homeLayoutService.updateSection(this.currentSection.id, {
        ...this.currentSection,
      });
      this.showToast(`Section "${this.currentSection.name}" updated in draft!`);
    } else {
      this.homeLayoutService.createSection({
        ...this.currentSection,
      });
      this.showToast(`New section "${this.currentSection.name}" added to draft!`);
    }

    this.closeModal();
  }

  // DELETE SECTION
  deleteSection(section: HomepageSection): void {
    if (confirm(`Are you sure you want to permanently delete section "${section.name}"?`)) {
      this.homeLayoutService.deleteSection(section.id);
      this.showToast(`Section "${section.name}" deleted.`);
    }
  }

  // PUBLISH TO LIVE
  publishLayout(): void {
    this.homeLayoutService.publishToLive();
    this.showToast('Homepage layout successfully deployed live to the storefront!');
  }

  // RESTORE DRAFT TO PUBLISHED
  restorePublished(): void {
    if (confirm('Discard unsaved draft changes and restore the currently published layout?')) {
      this.homeLayoutService.restorePublished();
      this.showToast('Draft reverted to published layout.');
    }
  }

  // RESET ALL TO DEFAULTS
  resetAllToDefaults(): void {
    if (
      confirm(
        'Are you sure you want to reset all homepage sections to factory default configuration? Any custom sections will be removed.'
      )
    ) {
      this.homeLayoutService.resetToDefaults();
      this.showToast('All homepage sections restored to factory defaults.');
    }
  }

  // ---------------- EXPLORE BY CATEGORY MANAGEMENT ----------------
  get exploreCategories(): ExploreCategory[] {
    return this.exploreCategoryService.categories();
  }

  isCategoryModalOpen: boolean = false;
  isEditingCategory: boolean = false;
  editingCategoryId: string | null = null;
  targetCatForQuickReplace: ExploreCategory | null = null;

  categoryForm: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    bgGradient: string;
    arrowBg: string;
    arrowColor: string;
    categoryQuery: string;
    link: string;
  } = {
    id: '',
    title: '',
    subtitle: '',
    image: '/images/explore-category/image 38.png',
    bgGradient: 'linear-gradient(180deg, #fdf6ea 0%, #fbf0dc 100%)',
    arrowBg: '#faeed7',
    arrowColor: '#b45309',
    categoryQuery: 'wellness',
    link: '',
  };

  readonly categoryThemePresets = [
    {
      name: 'Amber Glow',
      gradient: 'linear-gradient(180deg, #fdf6ea 0%, #fbf0dc 100%)',
      arrowBg: '#faeed7',
      arrowColor: '#b45309',
    },
    {
      name: 'Rose Blush',
      gradient: 'linear-gradient(180deg, #fcf0f5 0%, #fae2ed 100%)',
      arrowBg: '#fce7f3',
      arrowColor: '#be185d',
    },
    {
      name: 'Indigo Sky',
      gradient: 'linear-gradient(180deg, #edf2fe 0%, #e1e9fd 100%)',
      arrowBg: '#e0e7ff',
      arrowColor: '#4338ca',
    },
    {
      name: 'Emerald Fresh',
      gradient: 'linear-gradient(180deg, #eefaf1 0%, #e1f5e6 100%)',
      arrowBg: '#dcfce7',
      arrowColor: '#15803d',
    },
    {
      name: 'Forest Herbal',
      gradient: 'linear-gradient(180deg, #eef7ed 0%, #e2f2e0 100%)',
      arrowBg: '#dcfce7',
      arrowColor: '#166534',
    },
    {
      name: 'Lavender Dusk',
      gradient: 'linear-gradient(180deg, #f3f0fd 0%, #e9e3fc 100%)',
      arrowBg: '#ede9fe',
      arrowColor: '#6d28d9',
    },
    {
      name: 'Sunset Peach',
      gradient: 'linear-gradient(180deg, #fff4ed 0%, #ffe7d6 100%)',
      arrowBg: '#ffedd5',
      arrowColor: '#c2410c',
    },
  ];

  applyCategoryPreset(preset: (typeof this.categoryThemePresets)[0]): void {
    this.categoryForm.bgGradient = preset.gradient;
    this.categoryForm.arrowBg = preset.arrowBg;
    this.categoryForm.arrowColor = preset.arrowColor;
  }

  openAddCategoryModal(): void {
    this.isEditingCategory = false;
    this.editingCategoryId = null;
    this.categoryForm = {
      id: '',
      title: '',
      subtitle: '',
      image: '/images/explore-category/image 38.png',
      bgGradient: 'linear-gradient(180deg, #fdf6ea 0%, #fbf0dc 100%)',
      arrowBg: '#faeed7',
      arrowColor: '#b45309',
      categoryQuery: 'wellness',
      link: '',
    };
    this.isCategoryModalOpen = true;
  }

  openEditCategoryModal(cat: ExploreCategory): void {
    this.isEditingCategory = true;
    this.editingCategoryId = cat.id;
    this.categoryForm = {
      id: cat.id,
      title: cat.title,
      subtitle: cat.subtitle,
      image: cat.image,
      bgGradient: cat.bgGradient,
      arrowBg: cat.arrowBg,
      arrowColor: cat.arrowColor,
      categoryQuery: cat.categoryQuery || '',
      link: cat.link || '',
    };
    this.isCategoryModalOpen = true;
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen = false;
    this.editingCategoryId = null;
  }

  saveCategory(): void {
    if (!this.categoryForm.title.trim()) {
      alert('Please enter a category title');
      return;
    }
    if (!this.categoryForm.image.trim()) {
      alert('Please upload or provide an image for this category');
      return;
    }

    if (this.isEditingCategory && this.editingCategoryId) {
      this.exploreCategoryService.updateCategory(this.editingCategoryId, {
        title: this.categoryForm.title.trim(),
        subtitle: this.categoryForm.subtitle.trim(),
        image: this.categoryForm.image.trim(),
        bgGradient: this.categoryForm.bgGradient,
        arrowBg: this.categoryForm.arrowBg,
        arrowColor: this.categoryForm.arrowColor,
        categoryQuery: this.categoryForm.categoryQuery.trim(),
        link: this.categoryForm.link.trim() || undefined,
      });
      this.showToast(`Category "${this.categoryForm.title}" updated successfully! Changes live on Home Page.`);
    } else {
      this.exploreCategoryService.addCategory({
        title: this.categoryForm.title.trim(),
        subtitle: this.categoryForm.subtitle.trim(),
        image: this.categoryForm.image.trim(),
        bgGradient: this.categoryForm.bgGradient,
        arrowBg: this.categoryForm.arrowBg,
        arrowColor: this.categoryForm.arrowColor,
        categoryQuery: this.categoryForm.categoryQuery.trim(),
        link: this.categoryForm.link.trim() || undefined,
      });
      this.showToast(`New category "${this.categoryForm.title}" added! Changes live on Home Page.`);
    }

    this.closeCategoryModal();
  }

  deleteExploreCategory(cat: ExploreCategory): void {
    if (confirm(`Are you sure you want to remove category "${cat.title}" from the Home Page?`)) {
      this.exploreCategoryService.deleteCategory(cat.id);
      this.showToast(`Category "${cat.title}" removed.`);
    }
  }

  triggerCatImageUpload(): void {
    const input = document.getElementById('catImageFileInput') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  onCatImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.categoryForm.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  quickReplaceCatImage(cat: ExploreCategory): void {
    this.targetCatForQuickReplace = cat;
    const input = document.getElementById('quickCatFileInput') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  onQuickCatImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file && this.targetCatForQuickReplace) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const dataUrl = e.target.result;
        this.exploreCategoryService.replaceImage(this.targetCatForQuickReplace!.id, dataUrl);
        this.showToast(`Image updated for "${this.targetCatForQuickReplace!.title}"! Changes live on Home Page.`);
        this.targetCatForQuickReplace = null;
      };
      reader.readAsDataURL(file);
    }
  }

  resetCategoriesToDefaults(): void {
    if (confirm('Restore "Explore by Category" to factory default categories and images?')) {
      this.exploreCategoryService.resetToDefaults();
      this.showToast('Categories restored to default configuration.');
    }
  }

  private showToast(msg: string): void {
    this.notificationMessage = msg;
    setTimeout(() => {
      if (this.notificationMessage === msg) {
        this.notificationMessage = '';
      }
    }, 4000);
  }
}
