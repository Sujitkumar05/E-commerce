import { Component, AfterViewInit, ElementRef, HostListener, OnDestroy, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { BannerService } from '../../../../core/services/banner.service';

interface Slide {
  title: string;
  subtitle: string;
  image: string;
  description: string;
}

@Component({
  selector: 'app-hero-carousel',
  imports: [CommonModule],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.scss',
})
export class HeroCarousel implements AfterViewInit, OnDestroy {
  @ViewChildren('card') readonly cardElements!: QueryList<ElementRef<HTMLElement>>;

  activeIndex = 0;
  isPaused = false;
  isAnimating = false;
  isDragging = false;

  private autoplayId: ReturnType<typeof setInterval> | undefined;
  private startX = 0;
  private dragDistance = 0;
  private hasDragged = false;
  private readonly dragThreshold = 40;

  private readonly bannerService = inject(BannerService);

  private readonly fallbackSlides: Slide[] = [
    {
      title: 'Ayurvedic',
      subtitle: 'Pure Herbal Formulations for Balanced Living.',
      image: 'images/hero-carousel/Ayurvedic.png',
      description: '100% Herbal & Natural Extracts',
    },
    {
      title: 'Ethnic',
      subtitle: 'Timeless Craftsmanship and Heritage Fashion.',
      image: 'images/hero-carousel/Ethnic.png',
      description: 'Handcrafted Heritage Collection',
    },
    {
      title: 'Handicrafts & Spices',
      subtitle: 'Artisanal Treasures and Pure Exotic Flavors.',
      image: 'images/hero-carousel/Handicrafts & Spices.png',
      description: 'Authentic Crafts & Rich Spices',
    },
    {
      title: 'Homeopathy',
      subtitle: 'Gentle, Trusted Healing for the Entire Family.',
      image: 'images/hero-carousel/Homeopathy.png',
      description: 'Certified Natural Remedies',
    },
  ];

  get currentBaseSlides(): Slide[] {
    const banners = this.bannerService.getActiveBannersBySection('Home Hero Carousel');
    if (banners && banners.length > 0) {
      return banners.map((b) => ({
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        description: b.badgeText || b.subtitle,
      }));
    }
    return this.fallbackSlides;
  }

  // Duplicate slides for seamless infinite looping
  get slides(): Slide[] {
    const s = this.currentBaseSlides;
    return [...s, ...s];
  }

  ngAfterViewInit(): void {
    this.setInitialPositions();
    this.startAutoplay();
    this.cardElements.changes.subscribe(() => {
      this.setInitialPositions();
    });
  }

  // Calculate each card's relative position
  private getDelta(index: number): number {
    const total = this.slides.length;
    let delta = (index - this.activeIndex + total) % total;

    if (delta > total / 2) {
      delta -= total;
    }

    return delta;
  }

  isMain(index: number): boolean {
    return this.getDelta(index) === 0;
  }

  // Reference-style card positions with dynamic shape transitions
  private getPosition(delta: number): gsap.TweenVars {
    const positions: Record<number, gsap.TweenVars> = {
      0: {
        left: '12%',
        top: '4%',
        width: '56%',
        height: '92%',
        borderRadius: '24px',
        rotateY: 0,
        zIndex: 5,
        autoAlpha: 1,
      },

      1: {
        left: '64%',
        top: '12%',
        width: '17%',
        height: '78%',
        borderRadius: '34px',
        rotateY: -5,
        zIndex: 4,
        autoAlpha: 1,
      },

      2: {
        left: '76%',
        top: '19%',
        width: '13%',
        height: '65%',
        borderRadius: '26px',
        rotateY: -8,
        zIndex: 3,
        autoAlpha: 1,
      },

      3: {
        left: '84%',
        top: '26%',
        width: '10%',
        height: '52%',
        borderRadius: '20px',
        rotateY: -11,
        zIndex: 2,
        autoAlpha: 1,
      },
    };

    if (positions[delta]) {
      return positions[delta];
    }

    // Previous cards exit left
    if (delta < 0) {
      return {
        left: '-65%',
        top: '4%',
        width: '56%',
        height: '92%',
        borderRadius: '30px',
        rotateY: 6,
        zIndex: 0,
        autoAlpha: 0,
      };
    }

    // New cards enter from right
    return {
      left: '110%',
      top: '26%',
      width: '10%',
      height: '52%',
      borderRadius: '16px',
      rotateY: -12,
      zIndex: 0,
      autoAlpha: 0,
    };
  }

  private setInitialPositions(): void {
    this.cardElements.forEach((element, index) => {
      gsap.set(element.nativeElement, this.getPosition(this.getDelta(index)));
    });
  }

  // GSAP animation
  moveSlider(direction: number): void {
    if (this.isAnimating) return;

    this.isAnimating = true;

    const total = this.slides.length;
    this.activeIndex = (this.activeIndex + direction + total) % total;

    this.cardElements?.forEach((element) => {
      gsap.killTweensOf(element.nativeElement);
    });

    const timeline = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
      },
    });

    this.cardElements.forEach((element, index) => {
      const newPosition = this.getPosition(this.getDelta(index));

      timeline.to(
        element.nativeElement,
        {
          ...newPosition,
          duration: 0.65,
          ease: 'power2.out',
        },
        0,
      );
    });
  }

  nextSlide(event?: Event): void {
    event?.stopPropagation();
    this.moveSlider(1);
  }

  previousSlide(event?: Event): void {
    event?.stopPropagation();
    this.moveSlider(-1);
  }

  onCardClick(index: number): void {
    if (this.hasDragged) {
      this.hasDragged = false;
      return;
    }
    const delta = this.getDelta(index);
    if (delta !== 0) {
      this.moveSlider(delta > 0 ? 1 : -1);
    }
  }

  pauseSlider(): void {
    this.isPaused = true;
  }

  resumeSlider(): void {
    this.isPaused = false;
  }

  startAutoplay(): void {
    this.autoplayId = setInterval(() => {
      if (!this.isPaused && !this.isAnimating && !this.isDragging) {
        this.nextSlide();
      }
    }, 4000);
  }

  // Controlled, smooth mouse dragging
  private getPointerX(event: MouseEvent): number {
    return event.clientX;
  }

  onDragStart(event: MouseEvent): void {
    if (this.isAnimating) return;

    const target = event.target as HTMLElement;
    if (target?.closest('button, a')) {
      return;
    }

    event.preventDefault();

    this.isDragging = true;
    this.hasDragged = false;
    this.startX = this.getPointerX(event);
    this.dragDistance = 0;
    this.pauseSlider();
  }

  onDragMove(event: MouseEvent): void {
    if (!this.isDragging || this.isAnimating) return;

    const currentX = this.getPointerX(event);
    this.dragDistance = currentX - this.startX;

    if (Math.abs(this.dragDistance) > 8) {
      this.hasDragged = true;
    }

    if (Math.abs(this.dragDistance) >= this.dragThreshold) {
      if (this.dragDistance < 0) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
      this.isDragging = false;
    }
  }

  onDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.dragDistance = 0;
    setTimeout(() => {
      this.hasDragged = false;
    }, 100);
    this.resumeSlider();
  }

  onMouseLeave(): void {
    if (this.isDragging) {
      this.onDragEnd();
    }
    this.resumeSlider();
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.onDragMove(event);
    }
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    if (this.isDragging) {
      this.onDragEnd();
    }
  }

  ngOnDestroy(): void {
    if (this.autoplayId) {
      clearInterval(this.autoplayId);
    }

    this.cardElements?.forEach((element) => {
      gsap.killTweensOf(element.nativeElement);
    });
  }
}
