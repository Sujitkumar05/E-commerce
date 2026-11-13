import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BannerService, BannerItem, BannerSectionMeta } from '../../../../core/services/banner.service';
import { BentoGridService, BentoItem } from '../../../../core/services/bento-grid.service';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banners.html',
  styleUrl: './banners.scss',
})
export class AdminBanners {
  readonly bannerService = inject(BannerService);
  readonly bentoService = inject(BentoGridService);

  // Active View Tab: 'banners' | 'bento'
  activeTab: 'banners' | 'bento' = 'banners';

  // Bento Items State
  get bentoItems(): BentoItem[] {
    return this.bentoService.items();
  }

  targetBentoItem: BentoItem | null = null;
  editingBentoItem: BentoItem | null = null;
  bentoEditForm = {
    id: '',
    title: '',
    tagline: '',
    floatingTag: '',
    shopUrl: '',
    image: '',
  };

  // Search & Filters
  searchTerm: string = '';
  statusFilter: string = 'All Status';
  sectionFilter: string = 'All Sections';

  // Available sections from service
  get bannerSections(): BannerSectionMeta[] {
    return this.bannerService.bannerSections;
  }

  // Stats Counters from service
  get totalBanners(): number {
    return this.bannerService.totalBanners();
  }

  get activeBanners(): number {
    return this.bannerService.activeBanners();
  }

  get inactiveBanners(): number {
    return this.bannerService.inactiveBanners();
  }

  // All banners from service
  get banners(): BannerItem[] {
    return this.bannerService.banners();
  }

  // Select all checkbox
  selectAll: boolean = false;

  get hasSelectedBanners(): boolean {
    return this.filteredBanners.some((b) => b.selected);
  }

  // Edit / Create state
  isEditing: boolean = false;
  editingId: number | null = null;
  notificationMessage: string = '';

  // Preview Mode: 'desktop' | 'mobile'
  previewMode: 'desktop' | 'mobile' = 'desktop';

  // Banner Form Model
  bannerForm = {
    title: '',
    subtitle: '',
    section: 'Home Hero Carousel',
    categoryKey: 'wellness',
    targetPage: 'Home',
    image: 'images/hero-carousel/Ayurvedic.png',
    mobileImage: '',
    link: '',
    status: 'Active' as 'Active' | 'Inactive',
    sortOrder: 1,
    badgeText: '',
    accentColor: '#144927',
    scheduleStart: '',
    scheduleEnd: '',
  };

  // Quick Replace Modal / Context
  replaceTargetBanner: BannerItem | null = null;

  // Filtered banners
  get filteredBanners(): BannerItem[] {
    return this.banners.filter((banner) => {
      const search = this.searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        banner.title.toLowerCase().includes(search) ||
        (banner.subtitle && banner.subtitle.toLowerCase().includes(search)) ||
        banner.section.toLowerCase().includes(search) ||
        (banner.categoryKey && banner.categoryKey.toLowerCase().includes(search));

      const matchesStatus =
        this.statusFilter === 'All Status' || banner.status === this.statusFilter;

      const matchesSection =
        this.sectionFilter === 'All Sections' || banner.section === this.sectionFilter;

      return matchesSearch && matchesStatus && matchesSection;
    });
  }

  // Recommended size for currently selected form section
  get currentRecommendedSize(): string {
    const sec = this.bannerSections.find((s) => s.key === this.bannerForm.section);
    return sec ? sec.recommendedSize : '1920 × 600 px';
  }

  get currentSectionLocation(): string {
    const sec = this.bannerSections.find((s) => s.key === this.bannerForm.section);
    return sec ? sec.location : '';
  }

  toggleSelectAll(): void {
    this.filteredBanners.forEach((b) => (b.selected = this.selectAll));
  }

  checkIndividualSelection(): void {
    this.selectAll =
      this.filteredBanners.length > 0 && this.filteredBanners.every((b) => b.selected);
  }

  // Pre-fill "Add New Banner" with a selected section
  addBannerForSection(sectionName: string): void {
    this.resetForm();
    this.bannerForm.section = sectionName;
    const existing = this.bannerService.getBannersBySection(sectionName);
    this.bannerForm.sortOrder = existing.length + 1;

    // Default image suggestion based on section
    if (sectionName === 'Product Catalog Banners') {
      this.bannerForm.image = 'assets/images/product-catalog-banner/wellness-banner.jpg';
    } else if (sectionName === 'Home Wellness Banner') {
      this.bannerForm.image = '/images/wellness/wellness-banner.jpg';
    } else if (sectionName === 'Homeopathy Showcase Banner') {
      this.bannerForm.image = '/images/homeopathy/homeopathy-banner.jpg';
    } else {
      this.bannerForm.image = 'images/hero-carousel/Ayurvedic.png';
    }

    this.scrollToForm();
  }

  // Set filter by section
  filterBySection(sectionName: string): void {
    this.sectionFilter = sectionName;
  }

  // Count active banners per section
  getCountForSection(sectionName: string): number {
    return this.bannerService.getActiveBannersBySection(sectionName).length;
  }

  // Banner Actions
  viewBanner(banner: BannerItem): void {
    alert(
      `Banner ID: ${banner.id}\nTitle: ${banner.title}\nSection: ${banner.section}\nStatus: ${banner.status}\nLink: ${banner.link || 'None'}\nImage: ${banner.image}`
    );
  }

  editBanner(banner: BannerItem): void {
    this.isEditing = true;
    this.editingId = banner.id;
    this.bannerForm = {
      title: banner.title,
      subtitle: banner.subtitle || '',
      section: banner.section,
      categoryKey: banner.categoryKey || 'wellness',
      targetPage: banner.targetPage || 'Home',
      image: banner.image,
      mobileImage: banner.mobileImage || '',
      link: banner.link || '',
      status: banner.status,
      sortOrder: banner.sortOrder,
      badgeText: banner.badgeText || '',
      accentColor: banner.accentColor || '#144927',
      scheduleStart: banner.scheduleStart || '',
      scheduleEnd: banner.scheduleEnd || '',
    };
    this.scrollToForm();
  }

  deleteBanner(banner: BannerItem): void {
    if (confirm(`Are you sure you want to delete banner "${banner.title}" from "${banner.section}"?`)) {
      this.bannerService.deleteBanner(banner.id);
      this.showNotification(`Banner "${banner.title}" removed successfully.`);
      if (this.isEditing && this.editingId === banner.id) {
        this.resetForm();
      }
    }
  }

  deleteSelectedBanners(): void {
    const selected = this.filteredBanners.filter((b) => b.selected);
    if (selected.length === 0) return;
    if (confirm(`Delete ${selected.length} selected banner(s)?`)) {
      this.bannerService.deleteMultiple(selected.map((b) => b.id));
      this.selectAll = false;
      this.showNotification(`${selected.length} banner(s) deleted.`);
    }
  }

  toggleBannerStatus(banner: BannerItem): void {
    this.bannerService.toggleStatus(banner.id);
    const newStatus = banner.status === 'Active' ? 'Inactive' : 'Active';
    this.showNotification(`Banner "${banner.title}" is now ${newStatus}.`);
  }

  // Quick Replace Image from table
  quickReplaceImage(banner: BannerItem): void {
    this.replaceTargetBanner = banner;
    const input = document.getElementById('quickReplaceInput') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  onQuickImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file && this.replaceTargetBanner) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const dataUrl = e.target.result;
        this.bannerService.replaceBannerImage(this.replaceTargetBanner!.id, dataUrl);
        this.showNotification(`Image updated for "${this.replaceTargetBanner!.title}"!`);
        this.replaceTargetBanner = null;
      };
      reader.readAsDataURL(file);
    }
  }

  // Upload trigger for the form
  triggerImageUpload(): void {
    const input = document.getElementById('bannerImageInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.bannerForm.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Direct image URL update
  onImageUrlChange(url: string): void {
    if (url && url.trim()) {
      this.bannerForm.image = url.trim();
    }
  }

  triggerMobileImageUpload(): void {
    const input = document.getElementById('bannerMobileImageInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onMobileImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.bannerForm.mobileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.bannerForm = {
      title: '',
      subtitle: '',
      section: 'Home Hero Carousel',
      categoryKey: 'wellness',
      targetPage: 'Home',
      image: 'images/hero-carousel/Ayurvedic.png',
      mobileImage: '',
      link: '',
      status: 'Active',
      sortOrder: 1,
      badgeText: '',
      accentColor: '#144927',
      scheduleStart: '',
      scheduleEnd: '',
    };
  }

  saveBanner(): void {
    if (!this.bannerForm.title.trim()) {
      alert('Please enter a Banner Title');
      return;
    }
    if (!this.bannerForm.image.trim()) {
      alert('Please upload an image or provide an image URL');
      return;
    }

    if (this.isEditing && this.editingId !== null) {
      // Update existing
      this.bannerService.updateBanner(this.editingId, {
        title: this.bannerForm.title.trim(),
        subtitle: this.bannerForm.subtitle.trim(),
        section: this.bannerForm.section,
        categoryKey: this.bannerForm.categoryKey,
        targetPage: this.bannerForm.targetPage,
        image: this.bannerForm.image,
        mobileImage: this.bannerForm.mobileImage,
        link: this.bannerForm.link.trim(),
        status: this.bannerForm.status,
        sortOrder: this.bannerForm.sortOrder,
        badgeText: this.bannerForm.badgeText.trim(),
        accentColor: this.bannerForm.accentColor,
        scheduleStart: this.bannerForm.scheduleStart,
        scheduleEnd: this.bannerForm.scheduleEnd,
      });
      this.showNotification(`Banner "${this.bannerForm.title}" updated successfully!`);
    } else {
      // Create new
      this.bannerService.addBanner({
        title: this.bannerForm.title.trim(),
        subtitle: this.bannerForm.subtitle.trim(),
        section: this.bannerForm.section,
        categoryKey: this.bannerForm.categoryKey,
        targetPage: this.bannerForm.targetPage,
        image: this.bannerForm.image,
        mobileImage: this.bannerForm.mobileImage,
        link: this.bannerForm.link.trim(),
        status: this.bannerForm.status,
        sortOrder: this.bannerForm.sortOrder,
        badgeText: this.bannerForm.badgeText.trim(),
        accentColor: this.bannerForm.accentColor,
        scheduleStart: this.bannerForm.scheduleStart,
        scheduleEnd: this.bannerForm.scheduleEnd,
      });
      this.showNotification(`New banner added to "${this.bannerForm.section}"!`);
    }

    this.resetForm();
  }

  resetAllToDefaults(): void {
    if (
      confirm(
        'Are you sure you want to restore all website banners to their factory default images and settings? Any custom uploaded images will be reset.'
      )
    ) {
      this.bannerService.resetToDefaults();
      this.resetForm();
      this.showNotification('All website banners restored to default state.');
    }
  }

  // Bento Grid Showcase Image Management
  triggerBentoImageUpload(item: BentoItem): void {
    this.targetBentoItem = item;
    const input = document.getElementById('bentoFileInput') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  onBentoFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file && this.targetBentoItem) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const dataUrl = e.target.result;
        this.bentoService.updateImage(this.targetBentoItem!.id, dataUrl);
        this.showNotification(`Image updated for "${this.targetBentoItem!.title}"! Changes live on Home Page.`);
        this.targetBentoItem = null;
      };
      reader.readAsDataURL(file);
    }
  }

  updateBentoImageUrl(item: BentoItem, newUrl: string): void {
    if (!newUrl || !newUrl.trim()) return;
    this.bentoService.updateImage(item.id, newUrl.trim());
    this.showNotification(`Image updated for "${item.title}"! Changes live on Home Page.`);
  }

  openEditBento(item: BentoItem): void {
    this.editingBentoItem = item;
    this.bentoEditForm = {
      id: item.id,
      title: item.title,
      tagline: item.tagline,
      floatingTag: item.floatingTag || '',
      shopUrl: item.shopUrl,
      image: item.image,
    };
  }

  saveBentoEdit(): void {
    if (!this.editingBentoItem) return;
    if (!this.bentoEditForm.title.trim()) {
      alert('Please enter a card title');
      return;
    }
    if (!this.bentoEditForm.image.trim()) {
      alert('Please provide an image for this Bento card');
      return;
    }
    this.bentoService.updateItem(this.editingBentoItem.id, {
      title: this.bentoEditForm.title.trim(),
      tagline: this.bentoEditForm.tagline.trim(),
      floatingTag: this.bentoEditForm.floatingTag.trim(),
      shopUrl: this.bentoEditForm.shopUrl.trim(),
      image: this.bentoEditForm.image.trim(),
    });
    this.showNotification(`Bento card "${this.bentoEditForm.title}" updated successfully! Changes live on Home Page.`);
    this.editingBentoItem = null;
  }

  closeBentoEdit(): void {
    this.editingBentoItem = null;
  }

  triggerBentoFormImageUpload(): void {
    const input = document.getElementById('bentoFormImageInput') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  onBentoFormImageFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.bentoEditForm.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  resetBentoDefaults(): void {
    if (confirm('Are you sure you want to restore all 6 Bento Grid cards to their factory default images and settings?')) {
      this.bentoService.resetToDefaults();
      this.showNotification('Bento Grid cards restored to default images.');
    }
  }

  private showNotification(msg: string): void {
    this.notificationMessage = msg;
    setTimeout(() => {
      if (this.notificationMessage === msg) {
        this.notificationMessage = '';
      }
    }, 4500);
  }

  private scrollToForm(): void {
    if (typeof document !== 'undefined') {
      const formCard = document.querySelector('.form-card');
      if (formCard && typeof formCard.scrollIntoView === 'function') {
        formCard.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
