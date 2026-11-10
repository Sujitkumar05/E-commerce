import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface ProductVariant {
  label: string;
  subLabel: string;
  price: number;
}

export interface BenefitItem {
  title: string;
  desc: string;
  icon: string;
}

export interface IngredientItem {
  name: string;
  amount: string;
  note: string;
}

export interface UsageStep {
  step: string;
  title: string;
  desc: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface TrustBadgeItem {
  icon: string;
  label: string;
}

export interface ProductDetailModel {
  id: string;
  name: string;
  brand: string;
  category?: string;
  categoryTag: string;
  categoryTitle: string;
  categorySubtitle: string;
  subtitle: string;
  aboutText: string;
  rating: number;
  reviewCount: number;
  price: number;
  image: string;
  galleryImages: string[];
  variants: ProductVariant[];
  badges: TrustBadgeItem[];
  aboutBadges: { title: string; icon: string }[];
  powerBanner: {
    title: string;
    subtitle: string;
    checkItems: string[];
    image: string;
  };
  benefits: BenefitItem[];
  ingredients: IngredientItem[];
  usageSteps: UsageStep[];
  reviews: ReviewItem[];
  isBestSeller?: boolean;
  categoryGroup?: string;
  originalPrice?: number;
  discountPercentage?: number;
  stock?: number;
  availabilityStatus?: string;
  sku?: string;
  tags?: string[];
  shippingInformation?: string;
  warrantyInformation?: string;
  returnPolicy?: string;
}

export interface DummyJsonReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface DummyJsonDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface DummyJsonProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions?: DummyJsonDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: DummyJsonReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  images: string[];
  thumbnail: string;
}

export interface DummyJsonResponse {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  public readonly apiUrl = 'https://dummyjson.com/products';

  // Reactive state for API products
  private apiProductsSubject = new BehaviorSubject<ProductDetailModel[]>([]);
  public apiProducts$: Observable<ProductDetailModel[]> = this.apiProductsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  private hasFetched = false;

  private readonly defaultBadges: TrustBadgeItem[] = [
    { icon: 'fa-leaf', label: '100% Organic' },
    { icon: 'fa-droplet', label: 'No Chemicals' },
    { icon: 'fa-shield-halved', label: 'Better Immunity' },
    { icon: 'fa-spa', label: 'Natural Healing' },
  ];

  private readonly catalog: Record<string, ProductDetailModel> = {
    // 1. Isha Life Neem & Turmeric (Screenshot Hero)
    'isha-neem-turmeric': {
      id: 'isha-neem-turmeric',
      name: 'Isha Life Neem and Turmeric Capsules',
      brand: 'ISHA LIFE',
      categoryTag: 'NATURAL SUPPLEMENTS',
      categoryTitle: 'Neem & Turmeric Capsules',
      categorySubtitle: 'Pure goodness of nature for a healthier you.',
      subtitle:
        'Natural care for your health, with the power of Neem & Turmeric. Helps support immunity, digestion and overall wellness.',
      aboutText:
        "Isha Life Neem and Turmeric Capsules are a powerful blend of nature's finest ingredients. Enriched with pure neem and turmeric extract, these capsules help support your immune system, improve digestion and promote overall wellness. With added black pepper extract for better absorption, you get the maximum benefits from every capsule.",
      rating: 5.0,
      reviewCount: 1064,
      price: 12.45,
      image: '/images/wellness/neem-turmeric.jpg',
      galleryImages: [
        '/images/wellness/neem-turmeric.jpg',
        '/images/wellness/turmeric-bowl-thumb.jpg',
        '/images/wellness/supplement-facts.svg',
        '/images/wellness/neem-bottle-nature.jpg',
      ],
      variants: [
        { label: '60 Caps', subLabel: '(1 Pack)', price: 12.45 },
        { label: '120 Caps', subLabel: '(2 Pack)', price: 22.99 },
        { label: '180 Caps', subLabel: '(3 Pack)', price: 31.99 },
      ],
      badges: [
        { icon: 'fa-leaf', label: '100% Organic' },
        { icon: 'fa-droplet', label: 'No Chemicals' },
        { icon: 'fa-shield-halved', label: 'Better Immunity' },
        { icon: 'fa-spa', label: 'Natural Healing' },
      ],
      aboutBadges: [
        { title: 'Boosts Immunity', icon: 'fa-shield-halved' },
        { title: 'Supports Digestion', icon: 'fa-dna' },
        { title: 'Anti-Inflammatory Properties', icon: 'fa-leaf' },
        { title: 'Overall Wellness', icon: 'fa-spa' },
      ],
      powerBanner: {
        title: 'The Power of\nNeem & Turmeric',
        subtitle: 'Ancient wisdom, Modern wellness.',
        checkItems: ['Pure & Natural Ingredients', 'No Artificial Additives', 'Sourced from Trusted Farms'],
        image: '/images/wellness/turmeric-bowl-thumb.jpg',
      },
      benefits: [
        {
          title: 'Immune Barrier Defense',
          desc: 'Antiviral neem combined with antioxidant curcumin reinforces white blood cell vitality.',
          icon: 'fa-shield-virus',
        },
        {
          title: 'Deep Gastrointestinal Cleansing',
          desc: 'Flushes metabolic waste (ama) and balances intestinal microbiome acidity.',
          icon: 'fa-dna',
        },
        {
          title: 'Cellular Inflammation Soother',
          desc: 'Enhanced with 95% Piperine for up to 2000% higher curcumin absorption.',
          icon: 'fa-hand-holding-medical',
        },
        {
          title: 'Blood Purification & Radiant Skin',
          desc: 'Draws out dermal toxins for balanced melanin glow and clean cellular respiration.',
          icon: 'fa-spa',
        },
      ],
      ingredients: [
        { name: 'Organic Neem Leaf Extract (Azadirachta indica)', amount: '250 mg', note: 'Standardized pure bitter actives' },
        { name: 'Organic Turmeric Rhizome Extract (Curcuma longa)', amount: '250 mg', note: 'Standardized to 95% curcuminoids' },
        { name: 'Organic Black Pepper Extract (Piper nigrum)', amount: '5 mg', note: 'Standardized to 95% Piperine for enhanced absorption' },
        { name: 'Plant-derived Cellulose Capsule', amount: 'Vegetable Shell', note: '100% Vegan & Non-GMO' },
      ],
      usageSteps: [
        {
          step: '1',
          title: 'Optimal Morning Timing',
          desc: 'Take 2 capsules once daily in the morning on an empty stomach with a glass of lukewarm water or light honey water.',
        },
        {
          step: '2',
          title: 'Yogic Sadhana Alignment',
          desc: 'Neem and turmeric dilate cellular structures, boosting the body’s pranic energy before yoga or meditation.',
        },
        {
          step: '3',
          title: '60 to 90 Day Consistency',
          desc: 'For lasting vitality, consume consistently for at least 60-90 days. Store in a dry place away from heat.',
        },
      ],
      reviews: [
        {
          id: 'rev-1',
          author: 'Aarav Sharma',
          rating: 5,
          date: 'October 14, 2026',
          title: 'Life changing morning routine!',
          comment: 'Taking neem and turmeric on an empty stomach has completely transformed my digestion and alertness. Outstanding purity!',
          verified: true,
        },
        {
          id: 'rev-2',
          author: 'Priya Venkatesh',
          rating: 5,
          date: 'September 28, 2026',
          title: 'Purest organic extract in the market',
          comment: 'Isha Life never compromises on authenticity. The black pepper extract ensures high absorption without stomach irritation.',
          verified: true,
        },
      ],
      isBestSeller: true,
    },

    // 2. Ashwagandha Capsules
    'ashwagandha-capsules': {
      id: 'ashwagandha-capsules',
      name: 'Organic Ashwagandha Capsules',
      brand: 'ISHA LIFE',
      categoryTag: 'ADAPTOGENIC WELLNESS',
      categoryTitle: 'Organic Ashwagandha Capsules',
      categorySubtitle: 'Calm the mind, restore vitality, and build inner strength.',
      subtitle: 'Certified Organic KSM-66 root extract to support stress relief, deep sleep, and muscular rejuvenation.',
      aboutText:
        'Sourced from certified organic ashwagandha roots, these capsules deliver pure withanolides that regulate cortisol levels, relieve nervous fatigue, and support adrenal balance. Revered in Ayurveda as a premier Rasayana herb.',
      rating: 5.0,
      reviewCount: 1054,
      price: 14.99,
      image: '/images/wellness/ashwagandha.jpg',
      galleryImages: [
        '/images/wellness/ashwagandha.jpg',
        '/images/wellness/supplement-facts.svg',
        '/images/wellness/wellness-banner.jpg',
      ],
      variants: [
        { label: '60 Caps', subLabel: '(1 Pack)', price: 14.99 },
        { label: '120 Caps', subLabel: '(2 Pack)', price: 27.99 },
        { label: '180 Caps', subLabel: '(3 Pack)', price: 38.99 },
      ],
      badges: [
        { icon: 'fa-brain', label: 'Stress Relief' },
        { icon: 'fa-moon', label: 'Restful Sleep' },
        { icon: 'fa-dumbbell', label: 'Strength' },
        { icon: 'fa-leaf', label: '100% Organic' },
      ],
      aboutBadges: [
        { title: 'Cortisol Balance', icon: 'fa-heart-pulse' },
        { title: 'Sustained Energy', icon: 'fa-bolt' },
        { title: 'Cognitive Clarity', icon: 'fa-brain' },
        { title: 'Restful Sleep', icon: 'fa-moon' },
      ],
      powerBanner: {
        title: 'Ancient Strength of\nAshwagandha',
        subtitle: 'The royal adaptogen of Indian tradition.',
        checkItems: ['Standardized Withanolides', 'Supports Nervous System', 'Non-Habit Forming Herb'],
        image: '/images/wellness/ashwagandha.jpg',
      },
      benefits: [
        { title: 'Adrenal Support', desc: 'Promotes healthy adrenal function and normalizes stress response.', icon: 'fa-heart-pulse' },
        { title: 'Muscle Recovery', desc: 'Accelerates muscular repair and physical stamina post-exercise.', icon: 'fa-dumbbell' },
        { title: 'Deep REM Sleep', desc: 'Soothes restless mind chatter for restful natural sleep.', icon: 'fa-moon' },
        { title: 'Vitality & Ojas', desc: 'Replenishes deep tissue vitality and reproductive wellness.', icon: 'fa-spa' },
      ],
      ingredients: [
        { name: 'Organic Ashwagandha Root Extract (Withania somnifera)', amount: '500 mg', note: 'Standardized to >5% Withanolides' },
        { name: 'Organic Black Pepper Extract (BioPerine)', amount: '5 mg', note: 'High bioavailability absorption catalyst' },
        { name: 'Vegetable Cellulose', amount: 'Capsule Shell', note: '100% Plant-Derived' },
      ],
      usageSteps: [
        { step: '1', title: 'Evening Dosage', desc: 'Take 1 to 2 capsules with warm milk or water 30 minutes before sleep.' },
        { step: '2', title: 'Daily Consistency', desc: 'Experience cumulative benefits with consistent 60-day use.' },
        { step: '3', title: 'Mindful Breathing', desc: 'Pair with gentle yogic breathing (Nadi Shuddhi) for deep relaxation.' },
      ],
      reviews: [
        {
          id: 'ash-1',
          author: 'Kavita Menon',
          rating: 5,
          date: 'September 12, 2026',
          title: 'Deep calm and better sleep',
          comment: 'Zero morning grogginess! My deep sleep scores on my fitness tracker have increased significantly.',
          verified: true,
        },
      ],
      isBestSeller: true,
    },

    // 3. Amla Vitamin C Capsules
    'amla-capsules': {
      id: 'amla-capsules',
      name: 'Amla Vitamin C Capsules',
      brand: 'ISHA LIFE',
      categoryTag: 'ORGANIC VITAMIN C',
      categoryTitle: 'Amla Vitamin C Capsules',
      categorySubtitle: 'Nature’s richest bioavailable source of natural Vitamin C.',
      subtitle: 'Pure wild-harvested Indian Gooseberry extract for radiant skin, strong hair roots, and seasonal resistance.',
      aboutText:
        'Wild-crafted Indian Amla (Amalaki) is packed with bio-flavonoids and natural ascorbic acid that will not acidify the gut. Enhances iron absorption and builds cellular defenses against pollution and oxidative stress.',
      rating: 5.0,
      reviewCount: 756,
      price: 11.99,
      image: '/images/wellness/amla-capsules.jpg',
      galleryImages: ['/images/wellness/amla-capsules.jpg', '/images/wellness/supplement-facts.svg'],
      variants: [
        { label: '60 Caps', subLabel: '(1 Pack)', price: 11.99 },
        { label: '120 Caps', subLabel: '(2 Pack)', price: 21.99 },
        { label: '180 Caps', subLabel: '(3 Pack)', price: 30.99 },
      ],
      badges: [
        { icon: 'fa-sun', label: 'Natural Vit C' },
        { icon: 'fa-sparkles', label: 'Collagen Glow' },
        { icon: 'fa-shield-halved', label: 'Immunity' },
        { icon: 'fa-leaf', label: '100% Organic' },
      ],
      aboutBadges: [
        { title: 'Natural Antioxidant', icon: 'fa-shield-virus' },
        { title: 'Collagen Synthesis', icon: 'fa-spa' },
        { title: 'Hair & Scalp Health', icon: 'fa-seedling' },
        { title: 'Cellular Defense', icon: 'fa-dna' },
      ],
      powerBanner: {
        title: 'The Rejuvenating\nPower of Amla',
        subtitle: 'Pure Indian Gooseberry heritage.',
        checkItems: ['High Bioflavonoid Content', 'Gentle on Sensitive Stomachs', 'Protects from Free Radicals'],
        image: '/images/wellness/amla-capsules.jpg',
      },
      benefits: [
        { title: 'Pure Vitamin C Complex', desc: 'Natural whole-food ascorbic acid bound to polyphenols for maximum retention.', icon: 'fa-shield-halved' },
        { title: 'Glowing Complexion', desc: 'Stimulates natural pro-collagen enzymes to preserve skin elasticity.', icon: 'fa-spa' },
        { title: 'Strong Roots', desc: 'Strengthens hair follicles and prevents premature aging and dullness.', icon: 'fa-seedling' },
      ],
      ingredients: [
        { name: 'Organic Amla Fruit Extract (Phyllanthus emblica)', amount: '500 mg', note: 'Standardized to 40% Tannins & Natural Vit C' },
        { name: 'Vegetable Cellulose', amount: 'Capsule Shell', note: 'Vegan Friendly' },
      ],
      usageSteps: [
        { step: '1', title: 'Daily Intake', desc: 'Take 1 capsule twice daily with meals or warm water.' },
        { step: '2', title: 'Hydration', desc: 'Drink plenty of water throughout the day for maximum antioxidant flushing.' },
      ],
      reviews: [
        {
          id: 'amla-1',
          author: 'Rohit Verma',
          rating: 5,
          date: 'October 2, 2026',
          title: 'Real natural vitamin C',
          comment: 'No synthetic ascorbic acid stomach upset. Very gentle and gives real daily energy.',
          verified: true,
        },
      ],
    },

    // 4. Tulsi Immunity Capsules
    'tulsi-capsules': {
      id: 'tulsi-capsules',
      name: 'Tulsi Immunity Capsules',
      brand: 'ISHA LIFE',
      categoryTag: 'RESPIRATORY & IMMUNITY',
      categoryTitle: 'Tulsi Immunity Capsules',
      categorySubtitle: 'The Queen of Herbs for clear lungs and tranquil mind.',
      subtitle: 'Pure Holy Basil leaf extract to clear seasonal congestion, soothe bronchial airways, and fortify respiratory resilience.',
      aboutText:
        'Holy Basil (Tulsi) has been revered for thousands of years as the "Incomparable One". Rich in eugenol and adaptogenic phytonutrients, these capsules soothe throat discomfort, purify respiratory channels, and provide gentle mental clarity.',
      rating: 5.0,
      reviewCount: 642,
      price: 13.99,
      image: '/images/wellness/tulsi-capsules.jpg',
      galleryImages: ['/images/wellness/tulsi-capsules.jpg', '/images/wellness/supplement-facts.svg'],
      variants: [
        { label: '60 Caps', subLabel: '(1 Pack)', price: 13.99 },
        { label: '120 Caps', subLabel: '(2 Pack)', price: 24.99 },
        { label: '180 Caps', subLabel: '(3 Pack)', price: 34.99 },
      ],
      badges: [
        { icon: 'fa-lungs', label: 'Clear Airways' },
        { icon: 'fa-shield-halved', label: 'Lung Immunity' },
        { icon: 'fa-wind', label: 'Decongestant' },
        { icon: 'fa-leaf', label: '100% Organic' },
      ],
      aboutBadges: [
        { title: 'Bronchial Comfort', icon: 'fa-lungs' },
        { title: 'Immune Defense', icon: 'fa-shield-halved' },
        { title: 'Antiviral Eugenol', icon: 'fa-leaf' },
        { title: 'Stress Calming', icon: 'fa-spa' },
      ],
      powerBanner: {
        title: 'The Divine Herb\nHoly Basil (Tulsi)',
        subtitle: 'Ancient respiratory sanctuary.',
        checkItems: ['High Eugenol Content', 'Supports Mucous Cleansing', 'Pure Organic Holy Basil'],
        image: '/images/wellness/tulsi-capsules.jpg',
      },
      benefits: [
        { title: 'Respiratory Cleansing', desc: 'Promotes open bronchial passages and clear nasal breathing.', icon: 'fa-lungs' },
        { title: 'Natural Antiviral Barrier', desc: 'Reinforces the upper respiratory immune lining against seasonal bugs.', icon: 'fa-shield-virus' },
      ],
      ingredients: [
        { name: 'Organic Holy Basil Leaf Extract (Ocimum sanctum)', amount: '500 mg', note: 'Standardized to 2.5% Ursolic Acid' },
      ],
      usageSteps: [
        { step: '1', title: 'Daily Routine', desc: 'Take 1 to 2 capsules in the morning with warm water.' },
      ],
      reviews: [
        {
          id: 'tul-1',
          author: 'Meera Iyer',
          rating: 5,
          date: 'September 19, 2026',
          title: 'Immediate relief in seasonal changes',
          comment: 'Whenever the weather changes, this protects my throat and sinuses completely.',
          verified: true,
        },
      ],
    },

    // 5. Triphala Detox Capsules
    'triphala-capsules': {
      id: 'triphala-capsules',
      name: 'Triphala Detox Capsules',
      brand: 'ISHA LIFE',
      categoryTag: 'GENTLE DIGESTIVE DETOX',
      categoryTitle: 'Triphala Detox Capsules',
      categorySubtitle: 'Three sacred fruits for daily digestive rhythm and colon vitality.',
      subtitle: 'Synergistic formulation of Amla, Haritaki, and Bibhitaki for gentle, non-habit forming colon cleansing and gut balance.',
      aboutText:
        'Triphala is the cornerstone of Ayurvedic digestive wellness. Formulated with equal parts of three sacred fruits, it gently cleanses the colon, tones the intestinal walls, supports nutrient absorption, and relieves occasional sluggishness.',
      rating: 5.0,
      reviewCount: 918,
      price: 12.99,
      image: '/images/wellness/triphala-capsules.jpg',
      galleryImages: ['/images/wellness/triphala-capsules.jpg', '/images/wellness/supplement-facts.svg'],
      variants: [
        { label: '60 Caps', subLabel: '(1 Pack)', price: 12.99 },
        { label: '120 Caps', subLabel: '(2 Pack)', price: 23.99 },
        { label: '180 Caps', subLabel: '(3 Pack)', price: 32.99 },
      ],
      badges: [
        { icon: 'fa-dna', label: 'Gut Rhythm' },
        { icon: 'fa-broom', label: 'Gentle Detox' },
        { icon: 'fa-apple-whole', label: 'Colon Health' },
        { icon: 'fa-leaf', label: '100% Organic' },
      ],
      aboutBadges: [
        { title: 'Gentle Colon Cleanse', icon: 'fa-dna' },
        { title: 'Nutrient Absorption', icon: 'fa-wheat-awn' },
        { title: 'Antioxidant Detox', icon: 'fa-shield-halved' },
        { title: 'Non-Habit Forming', icon: 'fa-circle-check' },
      ],
      powerBanner: {
        title: 'The Sacred Three Fruits\nof Triphala',
        subtitle: 'Haritaki, Bibhitaki, and Amalaki.',
        checkItems: ['Balances All Three Doshas', 'Supports Healthy Elimination', 'Tones Intestinal Linings'],
        image: '/images/wellness/triphala-capsules.jpg',
      },
      benefits: [
        { title: 'Regular Elimination', desc: 'Encourages smooth, regular digestive motility without cramps or laxative dependency.', icon: 'fa-dna' },
        { title: 'Metabolic Detox', desc: 'Assists liver and colon in processing accumulated toxins.', icon: 'fa-broom' },
      ],
      ingredients: [
        { name: 'Organic Triphala Blend (Amalaki, Haritaki, Bibhitaki)', amount: '500 mg', note: 'Equal 1:1:1 traditional ratio' },
      ],
      usageSteps: [
        { step: '1', title: 'Bedtime Dose', desc: 'Take 2 capsules with warm water right before going to bed.' },
      ],
      reviews: [
        {
          id: 'tri-1',
          author: 'Arjun Das',
          rating: 5,
          date: 'August 30, 2026',
          title: 'The best digestive regulator',
          comment: 'Gentle, natural, and leaves you feeling light and energized every single morning.',
          verified: true,
        },
      ],
    },

    // 6. Patanjali Giloy Ghanvati
    'patanjali-giloy': {
      id: 'patanjali-giloy',
      name: 'Patanjali Giloy Ghanvati',
      brand: 'PATANJALI',
      categoryTag: 'HERBAL AYURVEDA',
      categoryTitle: 'Patanjali Giloy Ghanvati',
      categorySubtitle: 'Amrita — the nectar of immortality for deep cellular immunity.',
      subtitle: 'Pure Guduchi stem extract for chronic fever resistance, white blood cell activation, and metabolic detox.',
      aboutText:
        'Patanjali Giloy Ghanvati is prepared from pure aqueous extract of Giloy (Tinospora cordifolia). Known in classical texts as Amrita, it strengthens the body’s innate defense mechanism, supports liver function, and purifies the bloodstream.',
      rating: 4.8,
      reviewCount: 227,
      price: 5.0,
      image: '/images/wellness/patanjali-giloy.jpg',
      galleryImages: ['/images/wellness/patanjali-giloy.jpg', '/images/wellness/supplement-facts.svg'],
      variants: [
        { label: '60 Tabs', subLabel: '(1 Pack)', price: 5.0 },
        { label: '120 Tabs', subLabel: '(2 Pack)', price: 9.5 },
        { label: '180 Tabs', subLabel: '(3 Pack)', price: 13.99 },
      ],
      badges: [
        { icon: 'fa-shield-halved', label: 'Immunity Boost' },
        { icon: 'fa-temperature-arrow-down', label: 'Fever Relief' },
        { icon: 'fa-heart-pulse', label: 'Platelet Support' },
        { icon: 'fa-leaf', label: '100% Ayurvedic' },
      ],
      aboutBadges: [
        { title: 'Fever Resilience', icon: 'fa-shield-virus' },
        { title: 'Immune Vitality', icon: 'fa-shield-halved' },
        { title: 'Liver Cleansing', icon: 'fa-dna' },
        { title: 'General Tonic', icon: 'fa-spa' },
      ],
      powerBanner: {
        title: 'The Protective Shield\nof Giloy (Amrita)',
        subtitle: 'Ayurvedic Rasayana for supreme immunity.',
        checkItems: ['Pure Tinospora Cordifolia', 'Clinically Tested Quality', 'High Bioactive Potency'],
        image: '/images/wellness/patanjali-giloy.jpg',
      },
      benefits: [
        { title: 'Platelet Protection', desc: 'Promotes healthy blood cell counts and seasonal resilience.', icon: 'fa-heart-pulse' },
        { title: 'Deep Detoxification', desc: 'Cleanses deep tissues of metabolic byproducts.', icon: 'fa-broom' },
      ],
      ingredients: [
        { name: 'Giloy Extract (Tinospora cordifolia)', amount: '500 mg', note: 'Pure Aqueous Extract' },
      ],
      usageSteps: [
        { step: '1', title: 'Daily Dose', desc: 'Take 1 tablet twice daily with water after meals.' },
      ],
      reviews: [
        { id: 'gil-1', author: 'Suresh Nair', rating: 5, date: 'September 5, 2026', title: 'Immunity booster for family', comment: 'A staple in our household during flu season.', verified: true },
      ],
      isBestSeller: true,
    },

    // 7. Himalaya Liv.52 Herbal Supplement Tablets
    'himalaya-liv52': {
      id: 'himalaya-liv52',
      name: 'Himalaya Liv.52 Herbal Supplement Tablets',
      brand: 'HIMALAYA',
      categoryTag: 'HEPATIC & METABOLIC CARE',
      categoryTitle: 'Himalaya Liv.52 Tablets',
      categorySubtitle: 'Globally celebrated hepatic care and metabolic defense.',
      subtitle: 'Clinically proven herbal formulation of Himsra and Kasani to protect hepatic parenchyma and optimize digestion.',
      aboutText:
        'Himalaya Liv.52 has been the world’s trusted liver care supplement for over 65 years. Supported by over 300 clinical trials, it protects liver cells against dietary toxins, restores appetite, and promotes rapid cellular regeneration.',
      rating: 4.8,
      reviewCount: 249,
      price: 8.58,
      image: '/images/wellness/himalaya-liv52.jpg',
      galleryImages: ['/images/wellness/himalaya-liv52.jpg', '/images/wellness/supplement-facts.svg'],
      variants: [
        { label: '100 Tabs', subLabel: '(1 Pack)', price: 8.58 },
        { label: '200 Tabs', subLabel: '(2 Pack)', price: 16.5 },
        { label: '300 Tabs', subLabel: '(3 Pack)', price: 23.99 },
      ],
      badges: [
        { icon: 'fa-shield-halved', label: 'Liver Defense' },
        { icon: 'fa-utensils', label: 'Appetite Boost' },
        { icon: 'fa-flask', label: 'Clinically Proven' },
        { icon: 'fa-leaf', label: 'Herbal Formula' },
      ],
      aboutBadges: [
        { title: 'Hepatic Protection', icon: 'fa-shield-halved' },
        { title: 'Digestive Fire', icon: 'fa-fire' },
        { title: 'Enzyme Balance', icon: 'fa-dna' },
        { title: 'Toxin Elimination', icon: 'fa-broom' },
      ],
      powerBanner: {
        title: '65 Years of Trusted\nHepatic Health',
        subtitle: 'The golden standard in liver care.',
        checkItems: ['Himsra & Kasani Extracts', 'Protects Against Toxins', 'Restores Digestive Rhythm'],
        image: '/images/wellness/himalaya-liv52.jpg',
      },
      benefits: [
        { title: 'Hepatocyte Protection', desc: 'Shields liver parenchyma against modern oxidative stress and alcohol byproducts.', icon: 'fa-shield-virus' },
        { title: 'Healthy Appetite', desc: 'Stimulates bile production and smooth nutrient metabolism.', icon: 'fa-utensils' },
      ],
      ingredients: [
        { name: 'Caper Bush (Himsra - Capparis spinosa)', amount: '65 mg', note: 'Standardized Hepatic Extract' },
        { name: 'Wild Chicory (Kasani - Cichorium intybus)', amount: '65 mg', note: 'Potent Antiperoxidative' },
      ],
      usageSteps: [
        { step: '1', title: 'Recommended Intake', desc: 'Take 2 tablets twice daily with water before meals.' },
      ],
      reviews: [
        { id: 'liv-1', author: 'Vikram Joshi', rating: 5, date: 'October 1, 2026', title: 'Noticeable difference in digestion', comment: 'Liver enzyme levels improved within 4 weeks of consistent use.', verified: true },
      ],
      isBestSeller: true,
    },

    // 8. Dabur Chyawanprash
    'dabur-chyawanprash': {
      id: 'dabur-chyawanprash',
      name: 'Dabur Chyawanprash Immunity Booster - 1kg',
      brand: 'DABUR',
      categoryTag: 'CLASSICAL AYURVEDA RASAYANA',
      categoryTitle: 'Dabur Chyawanprash 1kg',
      categorySubtitle: '40+ potent Ayurvedic herbs and rich Amla for whole-family vitality.',
      subtitle: 'Time-tested Ayurvedic formulation with 2X immunity power, fortified with Amla, Ashwagandha, Pippali, and pure honey.',
      aboutText:
        'Dabur Chyawanprash is formulated following the ancient recipe recorded in the Charaka Samhita. Enriched with more than 40 revered herbs, it stimulates antibodies, combats common infections, energizes daily stamina, and cleanses respiratory pathways.',
      rating: 4.9,
      reviewCount: 852,
      price: 9.2,
      image: '/images/wellness/dabur-chyawanprash.jpg',
      galleryImages: ['/images/wellness/dabur-chyawanprash.jpg', '/images/wellness/supplement-facts.svg'],
      variants: [
        { label: '1 kg', subLabel: '(1 Pack)', price: 9.2 },
        { label: '500 g', subLabel: '(1 Pack)', price: 5.5 },
        { label: '2 kg', subLabel: '(Family Pack)', price: 17.5 },
      ],
      badges: [
        { icon: 'fa-shield-halved', label: '2X Immunity' },
        { icon: 'fa-bolt', label: 'Stamina & Energy' },
        { icon: 'fa-leaf', label: '40+ Herbs' },
        { icon: 'fa-users', label: 'Family Safe' },
      ],
      aboutBadges: [
        { title: '2X Immunity', icon: 'fa-shield-halved' },
        { title: 'Respiratory Vigor', icon: 'fa-lungs' },
        { title: 'Daily Stamina', icon: 'fa-bolt' },
        { title: 'Memory & Alertness', icon: 'fa-brain' },
      ],
      powerBanner: {
        title: 'The Ancient Elixir\nof Sage Chyavana',
        subtitle: 'Authentic 40-herb Rasayana.',
        checkItems: ['Pure Amla Base & Honey', 'Supports Natural Antibody Formation', 'Loved by Millions Globally'],
        image: '/images/wellness/dabur-chyawanprash.jpg',
      },
      benefits: [
        { title: 'Antibody Support', desc: 'Clinically shown to boost internal defense cells against seasonal illness.', icon: 'fa-shield-virus' },
        { title: 'All-Day Stamina', desc: 'Herbal tonics nourish the seven Dhatus (tissues) for enduring strength.', icon: 'fa-bolt' },
      ],
      ingredients: [
        { name: 'Fresh Amla Pulp (Emblica officinalis)', amount: '35%', note: 'Natural Vitamin C powerhouse' },
        { name: 'Ayurvedic Compound Decoctions (Ashwagandha, Pippali, Karkatshringi, etc.)', amount: '65%', note: 'Synergistic classical matrix' },
      ],
      usageSteps: [
        { step: '1', title: 'Morning Spoonful', desc: 'Adults: 1 teaspoonful (12g) twice daily with warm milk or lukewarm water.' },
      ],
      reviews: [
        { id: 'chya-1', author: 'Anita Roy', rating: 5, date: 'September 15, 2026', title: 'Authentic taste and real immunity', comment: 'We give this to our kids every morning with warm milk before school.', verified: true },
      ],
      isBestSeller: true,
    },

    // 9. Daily Balance Blend (Trending)
    'daily-balance-blend': {
      id: 'daily-balance-blend',
      name: 'Daily Balance Blend',
      brand: 'YOUR STORE CURATED',
      categoryTag: 'CURATED SUPERFOODS',
      categoryTitle: 'Daily Balance Blend',
      categorySubtitle: 'Holistic daily nourishment for modern, fast-paced lifestyles.',
      subtitle: 'Artisanal daily wellness adaptogen powder combining roasted seeds, whole superfood extracts, and prebiotic fiber.',
      aboutText:
        'Daily Balance Blend is carefully crafted by Your Store nutritionists to fill essential micronutrient gaps. Featuring cold-pressed seeds, ceremonial spices, and wild botanicals, it effortlessly mixes into morning smoothies or warm oats.',
      rating: 4.8,
      reviewCount: 384,
      price: 24.0,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&auto=format&fit=crop&q=80',
        '/images/wellness/supplement-facts.svg',
      ],
      variants: [
        { label: '250 g', subLabel: '(1 Pouch)', price: 24.0 },
        { label: '500 g', subLabel: '(2 Pouches)', price: 44.0 },
        { label: '1 kg', subLabel: '(Value Jar)', price: 79.0 },
      ],
      badges: [
        { icon: 'fa-seedling', label: 'Plant Based' },
        { icon: 'fa-wheat-awn', label: 'Gluten Free' },
        { icon: 'fa-globe', label: 'Global Ship' },
        { icon: 'fa-heart', label: 'Zero Refined Sugar' },
      ],
      aboutBadges: [
        { title: 'Sustained Energy', icon: 'fa-bolt' },
        { title: 'Prebiotic Fiber', icon: 'fa-dna' },
        { title: 'Anti-Bloat', icon: 'fa-leaf' },
        { title: 'Micro-Nutrients', icon: 'fa-apple-whole' },
      ],
      powerBanner: {
        title: 'Modern Balance,\nAncient Ingredients',
        subtitle: 'Effortless daily wellness.',
        checkItems: ['Clean Plant Nutrition', 'Non-GMO Certified', 'Mixes in 10 Seconds'],
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Steady Blood Sugar', desc: 'Slow-release fiber prevents afternoon energy crashes.', icon: 'fa-chart-line' },
      ],
      ingredients: [
        { name: 'Organic Chia & Flax Seed Powder', amount: '40%', note: 'Omega-3 rich' },
        { name: 'Raw Cacao & Cardamom Extract', amount: '30%', note: 'Natural Polyphenols' },
      ],
      usageSteps: [
        { step: '1', title: 'Mix & Sip', desc: 'Add 1 scoop (15g) to water, almond milk, or your favorite smoothie.' },
      ],
      reviews: [
        { id: 'bal-1', author: 'Sarah Jenkins', rating: 5, date: 'October 8, 2026', title: 'Tastes amazing and keeps me full', comment: 'Replaced my breakfast coffee with this and feel energized all morning.', verified: true },
      ],
    },

    // 10. Saffron Glow Ritual (Trending)
    'saffron-glow-ritual': {
      id: 'saffron-glow-ritual',
      name: 'Saffron Glow Ritual',
      brand: 'YOUR STORE CURATED',
      categoryTag: 'KASHMIRI BOTANICALS',
      categoryTitle: 'Saffron Glow Ritual',
      categorySubtitle: 'Grade-A Mongra Kashmiri Saffron for radiant dermal cellular renewal.',
      subtitle: 'Pure all-red stigmas handpicked from the valleys of Pampore, paired with sweet almond essence for luminous glow.',
      aboutText:
        'Saffron Glow Ritual brings the royal opulence of pure Kashmiri saffron straight to your skincare and wellness regimen. High in crocin and safranal, it evens skin tone, improves blood circulation, and uplifts your emotional mood.',
      rating: 4.8,
      reviewCount: 412,
      price: 38.0,
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=700&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=700&auto=format&fit=crop&q=80',
        '/images/wellness/supplement-facts.svg',
      ],
      variants: [
        { label: '2 g Jar', subLabel: '(Single Origin)', price: 38.0 },
        { label: '5 g Jar', subLabel: '(Reserve Pack)', price: 79.0 },
      ],
      badges: [
        { icon: 'fa-certificate', label: 'GI Tagged' },
        { icon: 'fa-gem', label: 'Grade A Mongra' },
        { icon: 'fa-sparkles', label: 'Cellular Glow' },
        { icon: 'fa-leaf', label: '100% Pure' },
      ],
      aboutBadges: [
        { title: 'High Crocin Value', icon: 'fa-certificate' },
        { title: 'Melanin Balance', icon: 'fa-spa' },
        { title: 'Mood Elevation', icon: 'fa-sun' },
        { title: 'Antioxidant Riches', icon: 'fa-shield-halved' },
      ],
      powerBanner: {
        title: 'The Crimson Gold\nof Pampore',
        subtitle: 'Direct from heritage mountain farmers.',
        checkItems: ['All-Red Stigmas Only', 'Laboratory Verified Crocin Level', 'Eco-friendly Glass Keepsake'],
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Luminous Glow', desc: 'Promotes microcapillary circulation for a natural rosy skin flush.', icon: 'fa-spa' },
      ],
      ingredients: [
        { name: '100% Pure Kashmiri Saffron (Crocus sativus L.)', amount: '100%', note: 'ISO 3632 Category I Certified' },
      ],
      usageSteps: [
        { step: '1', title: 'Infuse', desc: 'Steep 4-6 threads in warm milk, rose water, or herbal tea for 15 minutes.' },
      ],
      reviews: [
        { id: 'saf-1', author: 'Elena Rostova', rating: 5, date: 'September 22, 2026', title: 'Unmatched aroma and color', comment: 'The real deal. Beautiful golden color and deeply therapeutic fragrance.', verified: true },
      ],
    },

    // 11. Regional Pantry Box (Trending)
    'regional-pantry-box': {
      id: 'regional-pantry-box',
      name: 'Regional Pantry Box',
      brand: 'YOUR STORE CURATED',
      categoryTag: 'HERITAGE STAPLES',
      categoryTitle: 'Regional Pantry Box',
      categorySubtitle: 'A curated discovery chest of India’s finest regional spices and condiments.',
      subtitle: 'Complete kitchen pantry kit featuring single-origin Malabar black pepper, Alleppey turmeric, Guntur chillies, and stone-ground garam masala.',
      aboutText:
        'The Regional Pantry Box is a celebratory collection of terroir-driven staples. Directly sourced from artisanal cooperatives, each batch is freshly milled and airtight sealed to preserve peak volatile essential oils.',
      rating: 4.8,
      reviewCount: 295,
      price: 29.0,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
      ],
      variants: [
        { label: '4-Piece Box', subLabel: '(Starter Pack)', price: 29.0 },
        { label: '8-Piece Box', subLabel: '(Chef Edition)', price: 54.0 },
      ],
      badges: [
        { icon: 'fa-seedling', label: 'Single Origin' },
        { icon: 'fa-mortar-pestle', label: 'Stone Ground' },
        { icon: 'fa-box', label: 'Gift Ready' },
        { icon: 'fa-globe', label: 'Ships Worldwide' },
      ],
      aboutBadges: [
        { title: 'Fresh Milled', icon: 'fa-mortar-pestle' },
        { title: 'Single Terroir', icon: 'fa-map-pin' },
        { title: 'Zero Fillers', icon: 'fa-shield-halved' },
        { title: 'Pure Aromatics', icon: 'fa-leaf' },
      ],
      powerBanner: {
        title: 'Authentic Flavors,\nZero Compromise',
        subtitle: 'Experience true Indian culinary terroir.',
        checkItems: ['Heritage Spice Varieties', 'Fair Trade Cooperative Farmed', 'Small Batch Roasted'],
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Peak Antioxidants', desc: 'Unadulterated whole spices retain essential oils for maximum digestive fire.', icon: 'fa-fire' },
      ],
      ingredients: [
        { name: 'Malabar Black Peppercorns, Alleppey Curcuma, Guntur Sannam Chillies', amount: '100 g each', note: 'Single Origin' },
      ],
      usageSteps: [
        { step: '1', title: 'Culinary Use', desc: 'Freshly crush or temper in warm ghee to release rich volatile aromatics.' },
      ],
      reviews: [
        { id: 'pan-1', author: 'Chef Marcus Lee', rating: 5, date: 'October 11, 2026', title: 'Sensational depth of flavor', comment: 'You immediately smell the difference compared to supermarket spices.', verified: true },
      ],
    },

    // 12. Artisan Serve Set (Trending)
    'artisan-serve-set': {
      id: 'artisan-serve-set',
      name: 'Artisan Serve Set',
      brand: 'YOUR STORE CURATED',
      categoryTag: 'CRAFT & LIVING',
      categoryTitle: 'Artisan Serve Set',
      categorySubtitle: 'Hand-hammered brass and kansa tableware crafted by master coppersmiths.',
      subtitle: 'Traditional Kansa (bronze) dining ensemble celebrated in Ayurveda for balancing dietary acidity and digestive wellbeing.',
      aboutText:
        'Kansa is an ancient bell-metal alloy of copper and tin prized in Ayurveda for its alkalizing properties. Handcrafted by heritage artisans, this serve set elevates everyday mindful dining into an authentic sensory ritual.',
      rating: 4.8,
      reviewCount: 168,
      price: 52.0,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=700&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=700&auto=format&fit=crop&q=80',
      ],
      variants: [
        { label: '3-Piece Set', subLabel: '(Bowl & Spoons)', price: 52.0 },
        { label: '6-Piece Set', subLabel: '(Full Dinner Set)', price: 98.0 },
      ],
      badges: [
        { icon: 'fa-hand-sparkles', label: 'Handcrafted' },
        { icon: 'fa-shield-halved', label: 'Pure Kansa' },
        { icon: 'fa-leaf', label: 'Ayurvedic Metal' },
        { icon: 'fa-gift', label: 'Artisan Box' },
      ],
      aboutBadges: [
        { title: 'Alkalizing Metal', icon: 'fa-spa' },
        { title: 'Heirloom Quality', icon: 'fa-award' },
        { title: 'Zero Lead / Nickel', icon: 'fa-shield-halved' },
        { title: 'Heritage Craft', icon: 'fa-hands-holding' },
      ],
      powerBanner: {
        title: 'Heirloom Kansa\nMetal Craft',
        subtitle: 'Ancient wisdom in modern dining.',
        checkItems: ['78% Copper & 22% Pure Tin', 'Hand-hammered by Artisans', 'Naturally Antibacterial Surface'],
        image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Dietary Acidity Reducer', desc: 'Eating from Kansa stabilizes pH balance of warm wholesome food.', icon: 'fa-shield-halved' },
      ],
      ingredients: [
        { name: 'Pure Bronze Alloy (78% Copper, 22% Tin)', amount: '100%', note: 'Food Grade & Heavy Metal Tested' },
      ],
      usageSteps: [
        { step: '1', title: 'Care Instructions', desc: 'Wash with mild natural soap and lemon or tamarind paste. Dry immediately.' },
      ],
      reviews: [
        { id: 'art-1', author: 'Sunita Rao', rating: 5, date: 'September 20, 2026', title: 'Exquisite craftsmanship', comment: 'Heavy, premium feel. Makes our dinner table look truly royal.', verified: true },
      ],
    },

    // 13. Two Brothers Cultured Ghee (Regional Specialities)
    'ghee': {
      id: 'ghee',
      name: 'Two Brothers A2 Cultured Ghee',
      brand: 'TWO BROTHERS',
      categoryTag: 'HERITAGE PANTRY',
      categoryTitle: 'Two Brothers A2 Cultured Ghee',
      categorySubtitle: 'Bilona churned from indigenous Gir cow curd.',
      subtitle: 'Traditional wood-churned Vedic A2 cultured ghee made in small batches over open firewood. Rich in butyric acid and gut-nourishing fats.',
      aboutText:
        'Two Brothers Organic Farms A2 Cultured Ghee is crafted using the ancient Bilona method. Whole A2 milk from free-grazing indigenous Gir cows is cultured into curd and hand-churned in wooden churns to separate white butter, which is slow-simmered over firewood into liquid gold.',
      rating: 4.9,
      reviewCount: 342,
      price: 18.5,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
      ],
      variants: [
        { label: '500 ml', subLabel: '(Glass Jar)', price: 18.5 },
        { label: '1000 ml', subLabel: '(Value Jar)', price: 34.0 },
      ],
      badges: [
        { icon: 'fa-cow', label: 'A2 Gir Cow' },
        { icon: 'fa-fire', label: 'Bilona Churned' },
        { icon: 'fa-dna', label: 'Gut Microbiome' },
        { icon: 'fa-leaf', label: '100% Organic' },
      ],
      aboutBadges: [
        { title: 'High Smoke Point', icon: 'fa-fire' },
        { title: 'Rich in Butyrate', icon: 'fa-dna' },
        { title: 'Vitamins A, D, E, K', icon: 'fa-shield-halved' },
        { title: 'Lactose & Casein Free', icon: 'fa-circle-check' },
      ],
      powerBanner: {
        title: 'Liquid Gold of the\nVedic Bilona Method',
        subtitle: 'From pasture-raised Gir cows.',
        checkItems: ['Cultured from Curd, Not Cream', 'Slow Cooked on Firewood', 'No Added Flavors or Preservatives'],
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Gut Lining Repair', desc: 'Natural butyric acid provides primary fuel for colon mucosal cells.', icon: 'fa-dna' },
      ],
      ingredients: [
        { name: '100% Cultured A2 Cow Milk Fat', amount: '100%', note: 'No chemicals, coloring, or preservatives' },
      ],
      usageSteps: [
        { step: '1', title: 'Culinary & Wellness', desc: 'Consume 1 teaspoon with warm water in the morning or drizzle over hot rice and rotis.' },
      ],
      reviews: [
        { id: 'ghe-1', author: 'Devendra K.', rating: 5, date: 'October 16, 2026', title: 'The real aroma of village ghee', comment: 'Grainy texture, heavenly aroma, easily the best ghee in the market.', verified: true },
      ],
    },

    // 14. Sweets (Regional Specialities)
    'sweets': {
      id: 'sweets',
      name: 'Anand Royal Kaju Katli & Mithai Box',
      brand: 'ANAND SWEETS',
      categoryTag: 'ARTISANAL CONFECTIONS',
      categoryTitle: 'Anand Royal Kaju Katli',
      categorySubtitle: 'Pure Goan cashews ground with pure silver vark and cardamom.',
      subtitle: 'Iconic royal Indian sweet made with slow-cooked cashew paste, saffron hints, and zero artificial essences.',
      aboutText:
        'Anand Sweets has delighted dessert connoisseurs for over 35 years. Their signature Kaju Katli is made exclusively from select whole Goan cashews, melted pure sugar syrup, and fragrant crushed green cardamom.',
      rating: 4.9,
      reviewCount: 512,
      price: 16.0,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80',
      ],
      variants: [
        { label: '500 g', subLabel: '(Sweet Box)', price: 16.0 },
        { label: '1 kg', subLabel: '(Gift Box)', price: 29.5 },
      ],
      badges: [
        { icon: 'fa-cookie', label: '100% Cashew' },
        { icon: 'fa-award', label: 'Master Confectioners' },
        { icon: 'fa-ban', label: 'No Palm Oil' },
        { icon: 'fa-gift', label: 'Festive Box' },
      ],
      aboutBadges: [
        { title: 'Zero Adulteration', icon: 'fa-circle-check' },
        { title: 'Melt-in-Mouth', icon: 'fa-cookie-bite' },
        { title: 'Fresh Daily', icon: 'fa-clock' },
        { title: 'Authentic Recipe', icon: 'fa-award' },
      ],
      powerBanner: {
        title: 'Royal Flavors of\nOld World Mithai',
        subtitle: 'Crafted with royal passion.',
        checkItems: ['Select Grade Cashews', 'Pure Vegetarian Silver Vark', 'Fresh Daily Batches'],
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Wholesome Cashews', desc: 'Natural cashew energy and dietary minerals without heavy syrups.', icon: 'fa-bolt' },
      ],
      ingredients: [
        { name: 'Cashew Nuts (70%), Sugar, Green Cardamom, Vegetarian Silver Foil', amount: '500 g', note: 'No Preservatives' },
      ],
      usageSteps: [
        { step: '1', title: 'Serving Tip', desc: 'Serve at room temperature. Best enjoyed within 15 days of dispatch.' },
      ],
      reviews: [
        { id: 'swt-1', author: 'Ritu Agarwal', rating: 5, date: 'October 12, 2026', title: 'Melt in mouth perfection', comment: 'Super fresh, not overly sweet, real cashew richness.', verified: true },
      ],
    },

    // 15. Snacks (Regional Specialities)
    'snacks': {
      id: 'snacks',
      name: 'Grand Sweets Heritage Murukku & Mixture',
      brand: 'GRAND SWEETS',
      categoryTag: 'SOUTH INDIAN SAVORIES',
      categoryTitle: 'Grand Sweets Kai Murukku',
      categorySubtitle: 'Traditional rice & urad dal crunch made in pure groundnut oil.',
      subtitle: 'Legendary Chennai hand-twisted crispy snacks seasoned with hing (asafoetida), sesame seeds, and fragrant curry leaves.',
      aboutText:
        'The Grand Sweets and Snacks brings authentic Tamil Nadu tea-time crunch to your home. Hand-pressed by veteran culinary artists, each piece delivers an unmistakable crunch that has made it an institution since 1982.',
      rating: 4.8,
      reviewCount: 240,
      price: 9.5,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
      ],
      variants: [
        { label: '350 g', subLabel: '(Airtight Pouch)', price: 9.5 },
        { label: '700 g', subLabel: '(Twin Pack)', price: 17.5 },
      ],
      badges: [
        { icon: 'fa-bowl-rice', label: 'Hand Pressed' },
        { icon: 'fa-seedling', label: 'Groundnut Oil' },
        { icon: 'fa-check', label: 'Zero Trans Fat' },
        { icon: 'fa-leaf', label: 'Authentic Heritage' },
      ],
      aboutBadges: [
        { title: 'Hand Twist Tradition', icon: 'fa-hands' },
        { title: 'Crispy Lightness', icon: 'fa-feather' },
        { title: 'Authentic Spices', icon: 'fa-mortar-pestle' },
        { title: 'Fresh Sealed', icon: 'fa-box' },
      ],
      powerBanner: {
        title: 'Chennai’s Renowned\nTea Time Crunch',
        subtitle: 'Since 1982 in Mylapore.',
        checkItems: ['Cold-Pressed Groundnut Oil', 'Crispy Golden Texture', 'Generous Fragrant Spices'],
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Clean Savory Crunch', desc: 'Fried in pure single-press groundnut oil with natural antioxidant spices.', icon: 'fa-shield-halved' },
      ],
      ingredients: [
        { name: 'Rice Flour, Urad Dal, Cumin, Sesame Seeds, Cold-Pressed Groundnut Oil, Salt', amount: '100%', note: 'Zero Palm Oil' },
      ],
      usageSteps: [
        { step: '1', title: 'Tea-time Delight', desc: 'Pair with hot South Indian filter coffee or ginger chai.' },
      ],
      reviews: [
        { id: 'snk-1', author: 'Narayanan S.', rating: 5, date: 'October 5, 2026', title: 'Tastes like home', comment: 'Crispy, non-greasy, and exactly how my grandmother used to make it.', verified: true },
      ],
    },

    // 16. Health Drinks (Regional Specialities)
    'health-drinks': {
      id: 'health-drinks',
      name: 'Kapiva Wild Amla & Aloe Vera Juice',
      brand: 'KAPIVA AYURVEDA',
      categoryTag: 'AYURVEDIC HEALTH DRINKS',
      categoryTitle: 'Kapiva Wild Amla Juice 1L',
      categorySubtitle: 'Cold-pressed wild Pratapgarh amla with zero added water.',
      subtitle: 'Pure cold-pressed Ayurvedic health elixir for gut digestion, metabolic vitality, and hair root nourishment.',
      aboutText:
        'Kapiva Wild Amla Juice is made from small, wild amlas collected from the forests of Pratapgarh, Uttar Pradesh. Cold-pressed within hours of harvest to retain raw enzyme vitality, it contains 4X the Vitamin C of common store-bought juices.',
      rating: 4.8,
      reviewCount: 180,
      price: 11.5,
      image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '1000 ml', subLabel: '(Glass Bottle)', price: 11.5 },
        { label: '2000 ml', subLabel: '(Twin Pack)', price: 20.99 },
      ],
      badges: [
        { icon: 'fa-bottle-droplet', label: '100% Raw Juice' },
        { icon: 'fa-ban', label: 'Zero Added Water' },
        { icon: 'fa-seedling', label: 'Cold Pressed' },
        { icon: 'fa-shield-halved', label: 'Natural Immunity' },
      ],
      aboutBadges: [
        { title: 'Cold-Pressed Extraction', icon: 'fa-bottle-droplet' },
        { title: 'Wild Forest Sourced', icon: 'fa-tree' },
        { title: 'Zero Sugar / Flavors', icon: 'fa-ban' },
        { title: 'Gut Harmonizer', icon: 'fa-dna' },
      ],
      powerBanner: {
        title: 'Raw Forest Purity in\nEvery Daily Sip',
        subtitle: 'Pratapgarh wild amla heritage.',
        checkItems: ['Cold-Pressed Within 48 Hours', 'High Enzymatic Vitality', 'No Artificial Sweeteners'],
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Enzyme Activation', desc: 'Promotes rapid metabolic detoxification and clear glowing skin.', icon: 'fa-spa' },
      ],
      ingredients: [
        { name: '100% Wild Amla Fruit Juice (Phyllanthus emblica)', amount: '1000 ml', note: 'Cold Pressed, Zero Water' },
      ],
      usageSteps: [
        { step: '1', title: 'Morning Glass', desc: 'Dilute 30ml of juice in 100ml warm water and drink first thing in the morning.' },
      ],
      reviews: [
        { id: 'drk-1', author: 'Dr. Neha B.', rating: 5, date: 'October 3, 2026', title: 'Potent and pure', comment: 'You can feel the raw amla sourness and natural potency immediately.', verified: true },
      ],
    },

    // 17. Pickles (Regional Specialities)
    'pickles': {
      id: 'pickles',
      name: "Mother's Recipe Traditional Mango Pickle",
      brand: "MOTHER'S RECIPE",
      categoryTag: 'REGIONAL PICKLES',
      categoryTitle: "Traditional Mango Pickle 500g",
      categorySubtitle: 'Sun-cured raw mango slices with mustard oil and fenugreek.',
      subtitle: 'Homestyle spicy and tangy raw mango pickle prepared with crushed spices, aromatic mustard oil, and Himalayan pink salt.',
      aboutText:
        "Mother's Recipe Mango Pickle captures the authentic warmth of traditional Indian granny kitchens. Made with hand-selected firm green mangoes and aged in earthen jars under the sun for natural fermentation.",
      rating: 4.8,
      reviewCount: 215,
      price: 6.99,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '500 g', subLabel: '(Glass Jar)', price: 6.99 },
        { label: '1 kg', subLabel: '(Value Jar)', price: 11.99 },
      ],
      badges: [
        { icon: 'fa-sun', label: 'Sun Matured' },
        { icon: 'fa-jar', label: 'Earthen Aged' },
        { icon: 'fa-pepper-hot', label: 'Authentic Spice' },
        { icon: 'fa-leaf', label: 'Mustard Oil' },
      ],
      aboutBadges: [
        { title: 'Sun Fermented', icon: 'fa-sun' },
        { title: 'Crisp Mango Cuts', icon: 'fa-leaf' },
        { title: 'Mustard Seeds', icon: 'fa-seedling' },
        { title: 'Digestive Probiotic', icon: 'fa-dna' },
      ],
      powerBanner: {
        title: 'Authentic Sun-Cured\nHomestyle Pickle',
        subtitle: 'The timeless flavor of grandma’s pantry.',
        checkItems: ['Cold-Pressed Mustard Oil', 'Aged in Earthen Bharanis', 'Zero Artificial Preservatives'],
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Digestive Stimulation', desc: 'Fenugreek and mustard seed enzymes stimulate natural gastric digestive fire.', icon: 'fa-fire' },
      ],
      ingredients: [
        { name: 'Raw Green Mangoes, Mustard Oil, Fenugreek, Mustard Seeds, Red Chilli, Salt', amount: '500 g', note: 'Authentic Recipe' },
      ],
      usageSteps: [
        { step: '1', title: 'Traditional Pairing', desc: 'Enjoy a spoonful alongside curd rice, parathas, or dal chawal.' },
      ],
      reviews: [
        { id: 'pck-1', author: 'Aarti Saxena', rating: 5, date: 'September 28, 2026', title: 'Tangy and flavorful', comment: 'Just the right amount of mustard oil and crunch in the mango pieces.', verified: true },
      ],
    },

    // 18. Millets (Regional Specialities)
    'millets': {
      id: 'millets',
      name: '24 Mantra Organic Ancient Foxtail Millets',
      brand: '24 MANTRA ORGANIC',
      categoryTag: 'HERITAGE GRAINS',
      categoryTitle: '24 Mantra Organic Foxtail Millets 1kg',
      categorySubtitle: 'Unpolished ancient grains with low glycemic index.',
      subtitle: 'Sustainably farmed unpolished foxtail millets packed with complex dietary fiber, plant protein, and iron.',
      aboutText:
        '24 Mantra Organic Foxtail Millets are grown without synthetic pesticides by certified smallholder organic farmers. A wonderful nutritious rice substitute that promotes sustained metabolic energy and healthy glucose levels.',
      rating: 4.7,
      reviewCount: 130,
      price: 7.5,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '1 kg', subLabel: '(Cloth Pack)', price: 7.5 },
        { label: '2 kg', subLabel: '(Twin Pack)', price: 13.99 },
      ],
      badges: [
        { icon: 'fa-wheat-awn', label: 'Unpolished' },
        { icon: 'fa-chart-line', label: 'Low GI' },
        { icon: 'fa-seedling', label: 'Fiber Rich' },
        { icon: 'fa-leaf', label: '100% Organic' },
      ],
      aboutBadges: [
        { title: 'Low Glycemic Index', icon: 'fa-chart-line' },
        { title: 'Gluten Free Grains', icon: 'fa-wheat-awn' },
        { title: 'Plant Iron & Calcium', icon: 'fa-shield-halved' },
        { title: 'Smallholder Farmed', icon: 'fa-hands-holding' },
      ],
      powerBanner: {
        title: 'Ancient Climate-Resilient\nNutrition for Today',
        subtitle: 'Sustainably farmed supergrains.',
        checkItems: ['100% Certified Organic', 'Slow-Release Carbs', 'Rich in Iron & Magnesium'],
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Blood Sugar Regulation', desc: 'Lowers glycemic spikes and keeps gut satiety high for hours.', icon: 'fa-chart-line' },
      ],
      ingredients: [
        { name: '100% Organic Foxtail Millet (Setaria italica)', amount: '1 kg', note: 'Unpolished & Whole Grain' },
      ],
      usageSteps: [
        { step: '1', title: 'Cooking Guide', desc: 'Rinse and soak for 30 minutes, then cook in 2 cups of boiling water for 12 minutes.' },
      ],
      reviews: [
        { id: 'mil-1', author: 'Raghavan P.', rating: 5, date: 'October 8, 2026', title: 'Excellent rice substitute', comment: 'Fluffy texture, clean taste, and easy to digest.', verified: true },
      ],
    },

    // 19. Dry Fruits (Regional Specialities)
    'dry-fruits': {
      id: 'dry-fruits',
      name: 'Nutty Gritties Jumbo California Almonds',
      brand: 'NUTTY GRITTIES',
      categoryTag: 'PREMIUM DRY FRUITS',
      categoryTitle: 'Jumbo California Almonds 500g',
      categorySubtitle: 'Single-grade slow roasted nuts with natural crunch.',
      subtitle: 'Whole premium jumbo almonds, zero oil roasted, and packed with Vitamin E, protein, and heart-healthy unsaturated fats.',
      aboutText:
        'Nutty Gritties hand-selects only the top 5% harvest of California nonpareil almonds. Crisp, naturally sweet, and vacuum-sealed in resealable pouches to preserve peak crunch and nutrient density.',
      rating: 4.9,
      reviewCount: 420,
      price: 15.0,
      image: 'https://images.unsplash.com/photo-1508061252224-46b7372d68e3?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1508061252224-46b7372d68e3?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '500 g', subLabel: '(Airtight Pouch)', price: 15.0 },
        { label: '1 kg', subLabel: '(Value Pack)', price: 28.5 },
      ],
      badges: [
        { icon: 'fa-cubes-stacked', label: 'Jumbo Grade' },
        { icon: 'fa-heart', label: 'Heart Healthy' },
        { icon: 'fa-ban', label: 'Zero Added Oil' },
        { icon: 'fa-leaf', label: '100% Natural' },
      ],
      aboutBadges: [
        { title: 'Natural Vitamin E', icon: 'fa-sun' },
        { title: 'Plant Protein', icon: 'fa-dumbbell' },
        { title: 'Magnesium Power', icon: 'fa-shield-halved' },
        { title: 'Vacuum Freshness', icon: 'fa-box' },
      ],
      powerBanner: {
        title: 'Nutrient-Dense\nCalifornia Harvest',
        subtitle: 'Peak crunch and wholesome health.',
        checkItems: ['Top 5% Handpicked Grade', 'Raw & Unsalted Options', 'Resealable Freshness Pouch'],
        image: 'https://images.unsplash.com/photo-1508061252224-46b7372d68e3?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Brain & Heart Health', desc: 'High monounsaturated fats support arterial elasticity and cognitive focus.', icon: 'fa-heart' },
      ],
      ingredients: [
        { name: '100% Whole California Almonds (Prunus dulcis)', amount: '500 g', note: 'Nonpareil Supreme Grade' },
      ],
      usageSteps: [
        { step: '1', title: 'Soaked Overnight', desc: 'Soak 6-8 almonds overnight in water and peel in the morning for best enzymatic absorption.' },
      ],
      reviews: [
        { id: 'dry-1', author: 'Sonal G.', rating: 5, date: 'October 14, 2026', title: 'Top tier crunch', comment: 'Every single almond is huge and fresh without any bitter ones.', verified: true },
      ],
    },

    // 20. Tea & Coffee (Regional Specialities)
    'tea-coffee': {
      id: 'tea-coffee',
      name: 'Cafe Niloufer Royal Blend Chai & Filter Coffee',
      brand: 'CAFE NILOUFER',
      categoryTag: 'ROYAL BREWS',
      categoryTitle: 'Cafe Niloufer Royal Chai 500g',
      categorySubtitle: 'Iconic Hyderabad Irani chai blend with golden CTC leaves.',
      subtitle: 'Legendary Hyderabad tea recipe combining malty Assam CTC leaves with aromatic Darjeeling orthodox accents.',
      aboutText:
        'Since 1978, Cafe Niloufer has defined Hyderabad’s cherished Irani chai culture. Masterfully blended from whole tea gardens of upper Assam, this blend yields a deep coppery brew with unmatched rich maltiness.',
      rating: 4.8,
      reviewCount: 198,
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '500 g', subLabel: '(Tin Canister)', price: 8.99 },
        { label: '1 kg', subLabel: '(Airtight Bag)', price: 16.5 },
      ],
      badges: [
        { icon: 'fa-mug-hot', label: 'Irani Chai' },
        { icon: 'fa-leaf', label: 'Assam CTC' },
        { icon: 'fa-award', label: 'Since 1978' },
        { icon: 'fa-globe', label: 'Ships Globally' },
      ],
      aboutBadges: [
        { title: 'Rich Golden Liquor', icon: 'fa-mug-hot' },
        { title: 'Upper Assam Estate', icon: 'fa-leaf' },
        { title: 'Creamy Milk Pairing', icon: 'fa-droplet' },
        { title: 'Iconic Heritage', icon: 'fa-landmark' },
      ],
      powerBanner: {
        title: 'The Legend of\nHyderabadi Irani Chai',
        subtitle: 'Brews of royal Nawabi tradition.',
        checkItems: ['High Malty CTC Granules', 'Rich Caramel Color in Milk', 'Signature Aromatic Blend'],
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Mental Clarity', desc: 'Smooth theanine and natural caffeine awaken morning alertness without jitters.', icon: 'fa-brain' },
      ],
      ingredients: [
        { name: '100% Pure Black CTC & Orthodox Tea Leaves', amount: '500 g', note: 'Assam & Darjeeling Origin' },
      ],
      usageSteps: [
        { step: '1', title: 'Boil & Brew', desc: 'Simmer 1 tsp of tea in water and whole milk for 4-5 minutes until rich amber brown.' },
      ],
      reviews: [
        { id: 'tea-1', author: 'Faizan A.', rating: 5, date: 'October 17, 2026', title: 'Best chai in the world', comment: 'Brings back fond memories of sitting at Cafe Niloufer in Lakdikapul.', verified: true },
      ],
    },

    // 21. Masala Powders (Bento)
    'masala-powders': {
      id: 'masala-powders',
      name: 'Authentic Stone-Ground Masala Powders',
      brand: 'YOUR STORE CURATED',
      categoryTag: 'TRADITIONAL SPICE BLENDS',
      categoryTitle: 'Stone-Ground Masala Powders 400g',
      categorySubtitle: 'Roasted whole spices ground slowly on stone granite mills.',
      subtitle: 'Artisanal spice blend prepared with roasted coriander, cumin, black cardamom, star anise, and mace.',
      aboutText:
        'Slowly milled at low temperatures on natural stone chakkis to preserve delicate essential oils. Imparts deep authentic fragrance and complex layered warmth to vegetarian curries and lentil stews.',
      rating: 4.8,
      reviewCount: 310,
      price: 12.0,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '400 g', subLabel: '(Airtight Tin)', price: 12.0 },
        { label: '800 g', subLabel: '(Twin Tin)', price: 22.0 },
      ],
      badges: [
        { icon: 'fa-mortar-pestle', label: 'Stone Ground' },
        { icon: 'fa-fire', label: 'Slow Roasted' },
        { icon: 'fa-ban', label: 'No Colorants' },
        { icon: 'fa-leaf', label: '100% Pure' },
      ],
      aboutBadges: [
        { title: 'Cold-Milled Retention', icon: 'fa-mortar-pestle' },
        { title: 'Zero Starch Fillers', icon: 'fa-ban' },
        { title: 'Whole Spice Aroma', icon: 'fa-leaf' },
        { title: 'Small Batch Crafted', icon: 'fa-box' },
      ],
      powerBanner: {
        title: 'Cold-Milled Stone\nSpice Secrets',
        subtitle: 'Ancient kitchen traditions.',
        checkItems: ['Low Heat Stone Churning', 'Retains Natural Essential Oils', 'Sealed in Recyclable Tin'],
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Metabolic Digestive Fire', desc: 'Natural spices activate amylase and lipase enzymes for healthy digestion.', icon: 'fa-fire' },
      ],
      ingredients: [
        { name: 'Coriander Seeds, Cumin, Black Pepper, Cinnamon, Cardamom, Cloves, Bay Leaf, Nutmeg', amount: '400 g', note: '100% Natural' },
      ],
      usageSteps: [
        { step: '1', title: 'Finishing Touch', desc: 'Sprinkle half a teaspoon during the final 3 minutes of cooking.' },
      ],
      reviews: [
        { id: 'mas-1', author: 'Pooja T.', rating: 5, date: 'October 15, 2026', title: 'Incredible fragrance', comment: 'You only need a pinch and the whole kitchen smells divine.', verified: true },
      ],
    },

    // 22. Chocolates (Bento)
    'chocolates': {
      id: 'chocolates',
      name: 'Artisan Couverture Chocolates & Truffles',
      brand: 'YOUR STORE CURATED',
      categoryTag: 'SINGLE ORIGIN CACAO',
      categoryTitle: 'Artisan Couverture Chocolates',
      categorySubtitle: '70% Indian cacao conched with palm jaggery and roasted hazelnuts.',
      subtitle: 'Bean-to-bar dark chocolates made from Idukki and Anaimalai valley cacao beans, slow conched for 48 hours for velvet silk texture.',
      aboutText:
        'Crafted in micro-batches with direct-trade South Indian cacao. Free from palm oil and artificial emulsifiers, sweetened naturally with slow-evaporated palm jaggery.',
      rating: 4.9,
      reviewCount: 375,
      price: 18.0,
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '200 g Box', subLabel: '(Assorted)', price: 18.0 },
        { label: '400 g Box', subLabel: '(Deluxe Box)', price: 34.0 },
      ],
      badges: [
        { icon: 'fa-cookie', label: '70% Single Origin' },
        { icon: 'fa-ban', label: 'No Palm Oil' },
        { icon: 'fa-leaf', label: 'Direct Trade' },
        { icon: 'fa-gift', label: 'Artisan Box' },
      ],
      aboutBadges: [
        { title: 'Bean to Bar', icon: 'fa-seedling' },
        { title: '48hr Stone Conched', icon: 'fa-clock' },
        { title: 'Jaggery Sweetened', icon: 'fa-sun' },
        { title: 'Zero Soy Lecithin', icon: 'fa-ban' },
      ],
      powerBanner: {
        title: 'Single-Origin Idukki\nValley Cacao',
        subtitle: 'Pure dark bean-to-bar alchemy.',
        checkItems: ['Pure Cacao Butter Only', 'Naturally Polyphenol Rich', 'Direct Trade with Farmers'],
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Brain & Mood Lift', desc: 'Natural theobromine and flavonoids stimulate endorphin and serotonin synthesis.', icon: 'fa-brain' },
      ],
      ingredients: [
        { name: 'Organic Cacao Beans, Cocoa Butter, Organic Palm Sugar, Natural Vanilla', amount: '200 g', note: 'Vegan Dark Chocolate' },
      ],
      usageSteps: [
        { step: '1', title: 'Tasting Note', desc: 'Let a piece melt slowly on the tongue to appreciate berry and oak notes.' },
      ],
      reviews: [
        { id: 'choc-1', author: 'Liam S.', rating: 5, date: 'October 13, 2026', title: 'World class Indian chocolate', comment: 'Rich, smooth, complex, and not overly sweet at all.', verified: true },
      ],
    },

    // 23. Spreads (Bento)
    'spreads': {
      id: 'spreads',
      name: 'Slow-Roasted Nut Butters & Spreads',
      brand: 'YOUR STORE CURATED',
      categoryTag: 'CLEAN NUT BUTTERS',
      categoryTitle: 'Slow-Roasted Almond Butter 300g',
      categorySubtitle: '100% California almonds slow roasted and stone milled.',
      subtitle: 'Clean, velvety nut butter made solely from slow-roasted whole nuts and pink salt. Free from palm oils, hydrogenated fats, or added sugars.',
      aboutText:
        'Packed with natural monounsaturated fats, dietary fiber, and plant protein. Stone-ground in small batches to preserve smooth spreadability and roasted aroma.',
      rating: 4.8,
      reviewCount: 210,
      price: 14.5,
      image: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '300 g Jar', subLabel: '(Single Jar)', price: 14.5 },
        { label: '600 g Pack', subLabel: '(Twin Jar)', price: 26.0 },
      ],
      badges: [
        { icon: 'fa-jar', label: '100% Nuts' },
        { icon: 'fa-ban', label: 'Zero Palm Oil' },
        { icon: 'fa-dumbbell', label: 'Plant Protein' },
        { icon: 'fa-leaf', label: 'Keto Friendly' },
      ],
      aboutBadges: [
        { title: 'Zero Added Sugar', icon: 'fa-ban' },
        { title: 'Creamy Slow-Milled', icon: 'fa-jar' },
        { title: 'High Monounsaturated', icon: 'fa-heart' },
        { title: 'Pink Salt Hint', icon: 'fa-cubes' },
      ],
      powerBanner: {
        title: 'Pure Whole Nuts,\nNothing Else Added',
        subtitle: 'Wholesome everyday clean energy.',
        checkItems: ['100% Single-Ingredient', 'Zero Hydrogenated Oil', 'Glass Jar Packaging'],
        image: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Sustained Satiety', desc: 'Keeps cravings at bay and stabilizes insulin levels throughout the morning.', icon: 'fa-chart-line' },
      ],
      ingredients: [
        { name: '100% Whole Roasted California Almonds, Himalayan Pink Salt', amount: '300 g', note: 'Gluten Free' },
      ],
      usageSteps: [
        { step: '1', title: 'How to Enjoy', desc: 'Stir well before use. Spread on toast, apples, or swirl into oatmeal.' },
      ],
      reviews: [
        { id: 'spr-1', author: 'Karan D.', rating: 5, date: 'October 9, 2026', title: 'Creamiest nut butter ever', comment: 'You can tell it is 100% pure almonds with zero weird oils.', verified: true },
      ],
    },

    // 24. Biscuits & Cookies (Bento)
    'biscuits-cookies': {
      id: 'biscuits-cookies',
      name: 'Handcrafted Biscuits & Artisan Cookies',
      brand: 'YOUR STORE CURATED',
      categoryTag: 'BAKERY DELIGHTS',
      categoryTitle: 'Artisan Butter Cookies 300g',
      categorySubtitle: 'Golden baked with cultured A2 butter and roasted almonds.',
      subtitle: 'Melt-in-mouth traditional bakery shortbread cookies made with slow-churned butter, whole wheat flour, and fragrant cardamom.',
      aboutText:
        'Crafted following old Parsi and Anglo-Indian bakery recipes. Baked slowly in small ovens to achieve that fragile, crumbly perfection with every bite.',
      rating: 4.8,
      reviewCount: 265,
      price: 11.0,
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '300 g Box', subLabel: '(Bakery Box)', price: 11.0 },
        { label: '600 g Box', subLabel: '(Family Box)', price: 19.99 },
      ],
      badges: [
        { icon: 'fa-cookie-bite', label: 'A2 Butter' },
        { icon: 'fa-ban', label: 'No Palm Oil' },
        { icon: 'fa-wheat-awn', label: 'Whole Wheat' },
        { icon: 'fa-leaf', label: 'Artisan Baked' },
      ],
      aboutBadges: [
        { title: 'Cultured Butter Base', icon: 'fa-cookie-bite' },
        { title: 'Zero Artificial Vanilla', icon: 'fa-ban' },
        { title: 'Delicate Crumb', icon: 'fa-sparkles' },
        { title: 'Eco-Tin Sealed', icon: 'fa-box' },
      ],
      powerBanner: {
        title: 'Old-School Bakery\nWarmth & Nostalgia',
        subtitle: 'Authentic heritage shortbread recipes.',
        checkItems: ['Pure Cow Butter', 'Crunchy Roasted Almond Slivers', 'Sealed For Oven Freshness'],
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Comforting Indulgence', desc: 'Wholesome whole grains and pure dairy butter without trans-fats.', icon: 'fa-heart' },
      ],
      ingredients: [
        { name: 'Whole Wheat Flour, Pure Cow Butter, Raw Cane Sugar, Roasted Almonds, Green Cardamom', amount: '300 g', note: 'Zero Preservatives' },
      ],
      usageSteps: [
        { step: '1', title: 'Tea Companion', desc: 'Dip lightly into hot milk tea or black filter coffee.' },
      ],
      reviews: [
        { id: 'bis-1', author: 'Monika K.', rating: 5, date: 'October 4, 2026', title: 'Takes you back in time', comment: 'Reminds me of the legendary old bakery biscuits from Pune.', verified: true },
      ],
    },

    // 25. Drinks (Bento)
    'drinks': {
      id: 'drinks',
      name: 'Nourishing Shakes & Elixirs',
      brand: 'YOUR STORE CURATED',
      categoryTag: 'VITALITY ELIXIRS',
      categoryTitle: 'Golden Turmeric & Ashwagandha Elixir',
      categorySubtitle: 'Instant golden milk latte blend with warming spices.',
      subtitle: 'Velvety soothing nightcap blend of organic turmeric, adaptogenic ashwagandha, Ceylon cinnamon, ginger, and black pepper.',
      aboutText:
        'A modern elevated take on the timeless Haldi Doodh ritual. Crafted to calm evening cortisol, ease tight muscles, and promote restorative regenerative rest.',
      rating: 4.8,
      reviewCount: 190,
      price: 16.0,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80'],
      variants: [
        { label: '200 g Jar', subLabel: '(30 Servings)', price: 16.0 },
        { label: '400 g Jar', subLabel: '(60 Servings)', price: 29.0 },
      ],
      badges: [
        { icon: 'fa-mug-hot', label: 'Golden Milk' },
        { icon: 'fa-moon', label: 'Restful Sleep' },
        { icon: 'fa-shield-halved', label: 'Anti-Inflammatory' },
        { icon: 'fa-leaf', label: '100% Organic' },
      ],
      aboutBadges: [
        { title: 'Curcumin + Piperine', icon: 'fa-shield-halved' },
        { title: 'KSM-66 Ashwagandha', icon: 'fa-moon' },
        { title: 'Ceylon Cinnamon', icon: 'fa-leaf' },
        { title: 'Zero Added Sugar', icon: 'fa-ban' },
      ],
      powerBanner: {
        title: 'Restorative Golden\nNighttime Ritual',
        subtitle: 'Ancient Haldi Doodh perfection.',
        checkItems: ['High Bioavailable Curcumin', 'Soothes Evening Stress', 'Delicious in Warm Plant Milk'],
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
      },
      benefits: [
        { title: 'Deep Sleep & Joint Comfort', desc: 'Calms inflammatory pathways while helping the brain transition into restful sleep.', icon: 'fa-moon' },
      ],
      ingredients: [
        { name: 'Organic Alleppey Turmeric (6% Curcumin), Ashwagandha, Ceylon Cinnamon, Ginger, Black Pepper', amount: '200 g', note: '100% Organic' },
      ],
      usageSteps: [
        { step: '1', title: 'Evening Whisk', desc: 'Whisk 1 teaspoon into warm oat, almond, or dairy milk. Add honey if desired.' },
      ],
      reviews: [
        { id: 'drk-2', author: 'Jessica W.', rating: 5, date: 'October 16, 2026', title: 'My sacred bedtime drink', comment: 'So soothing and delicious. Best sleep quality ever.', verified: true },
      ],
    },

    // 26. Dr. Reckeweg R1 Drops (Indian Homeopathy)
    'reckeweg-r1': {
      id: 'reckeweg-r1',
      name: 'Dr. Reckeweg R1 Inflammation & Tonsillitis Drops',
      brand: 'Dr. Reckeweg',
      categoryTag: 'HOMEOPATHIC MEDICINE',
      categoryGroup: 'homeopathy',
      categoryTitle: 'Inflammation & Acute Infection Drops',
      categorySubtitle: 'Original German formulation distributed across India for fast anti-inflammatory healing.',
      subtitle: 'Trusted homeopathic drops for local acute & chronic inflammations, tonsillitis, and glandular swelling.',
      aboutText: "Dr. Reckeweg R1 is the world-renowned homeopathic formulation trusted for generations across India. Indicated for acute and chronic local inflammation, tonsillitis, furuncles, pharyngitis, and glandular swellings. Made with classic homeopathic potencies of Apis mellifica, Belladonna, Calcium iodatum, and Hepar sulphuris.",
      rating: 4.9,
      reviewCount: 1420,
      price: 14.50,
      image: '/images/homeopathy/reckeweg-r1.jpg',
      galleryImages: ['/images/homeopathy/reckeweg-r1.jpg', '/images/homeopathy/homeopathy-banner.jpg'],
      variants: [
        { label: '22 ml', subLabel: 'Standard Dropper', price: 14.50 },
        { label: '50 ml', subLabel: 'Value Pack', price: 24.90 },
        { label: 'Pack of 3', subLabel: '3 x 22 ml', price: 39.50 },
      ],
      badges: [
        { icon: 'fa-shield-halved', label: 'Anti-Inflammatory' },
        { icon: 'fa-droplet', label: 'Pure Dilution' },
        { icon: 'fa-certificate', label: '100% Genuine' },
        { icon: 'fa-flask', label: 'German Precision' },
      ],
      aboutBadges: [
        { title: 'Tonsils & Throat', icon: 'fa-head-side-cough' },
        { title: 'Reduces Swelling', icon: 'fa-shield-halved' },
        { title: 'No Side Effects', icon: 'fa-leaf' },
        { title: 'Fast Absorption', icon: 'fa-bolt' },
      ],
      powerBanner: {
        title: 'Dr. Reckeweg R1\nInflammation Relief',
        subtitle: 'Targeted biological homeopathic healing.',
        checkItems: ['Original German Formula', 'Clinically Trusted in 100+ Countries', 'Safe for All Ages'],
        image: '/images/homeopathy/reckeweg-r1.jpg',
      },
      benefits: [
        { title: 'Soothes Acute Inflammation', desc: 'Relieves heat, pain, and congestion in tonsils, throat, and mucous membranes.', icon: 'fa-shield-halved' },
        { title: 'Cellular Drainage', desc: 'Aids lymphatic drainage and speeds up recovery from localized infections.', icon: 'fa-droplet' },
      ],
      ingredients: [
        { name: 'Apis mellifica D4, Belladonna D4, Calcium iodatum D4, Hepar sulph. D12, Kalium bichromicum D4, Marum verum D6, Mercurius solubilis D8, Phytolacca D4', amount: '22 ml', note: 'Alcohol 36% vol.' },
      ],
      usageSteps: [
        { step: '1', title: 'Dosage', desc: 'In acute conditions, take 10-15 drops in water every 1-2 hours. In chronic cases, 10-15 drops 3 times daily before meals.' },
      ],
      reviews: [
        { id: 'r1-rev-1', author: 'Dr. A. Verma', rating: 5, date: 'October 18, 2026', title: 'Indispensable homeopathic remedy', comment: 'Always keep R1 in our family medicine cabinet. Cuts down throat infection within 24 hours.', verified: true },
        { id: 'r1-rev-2', author: 'Kavita M.', rating: 5, date: 'October 12, 2026', title: 'Amazing for tonsillitis', comment: 'Instant relief from sore throat and swelling without needing harsh antibiotics.', verified: true },
      ],
      isBestSeller: true,
    },

    // 27. SBL Scalptone Tablets
    'sbl-scalptone': {
      id: 'sbl-scalptone',
      name: 'SBL Scalptone Tablets for Hair Fall & Dandruff',
      brand: 'SBL Homeopathy',
      categoryTag: 'HOMEOPATHIC REMEDY',
      categoryGroup: 'homeopathy',
      categoryTitle: 'Hair Care & Scalp Health',
      categorySubtitle: 'India’s premier homeopathic hair revitalization and anti-dandruff therapy.',
      subtitle: 'Promotes natural hair growth, strengthens weak hair roots, and halts premature greying.',
      aboutText: 'SBL Scalptone Tablets are a clinically proven, side-effect-free homeopathic formulation designed to treat excessive hair loss, dandruff, thinning, and irritated scalps. Combines Acidum phosphoricum, Lycopodium, and Silicea to nourish roots and improve micro-circulation to hair follicles.',
      rating: 4.8,
      reviewCount: 890,
      price: 8.95,
      image: '/images/homeopathy/sbl-scalptone.jpg',
      galleryImages: ['/images/homeopathy/sbl-scalptone.jpg', '/images/homeopathy/homeopathy-banner.jpg'],
      variants: [
        { label: '25 g', subLabel: '100 Tablets', price: 8.95 },
        { label: '2 Pack', subLabel: '2 x 25 g', price: 16.50 },
        { label: '450 g', subLabel: 'Family Pack', price: 29.90 },
      ],
      badges: [
        { icon: 'fa-shield-halved', label: 'Clinically Proven' },
        { icon: 'fa-leaf', label: 'Non-Hormonal' },
        { icon: 'fa-check', label: 'Zero Side Effects' },
        { icon: 'fa-spa', label: 'Nourishes Roots' },
      ],
      aboutBadges: [
        { title: 'Controls Hair Fall', icon: 'fa-shield-halved' },
        { title: 'Eliminates Dandruff', icon: 'fa-snowflake' },
        { title: 'Delays Greying', icon: 'fa-clock' },
        { title: 'Strengthens Roots', icon: 'fa-tree' },
      ],
      powerBanner: {
        title: 'SBL Scalptone\nHolistic Hair Therapy',
        subtitle: 'Root-level nourishment without harsh chemicals.',
        checkItems: ['Controls Severe Hair Loss', 'Balances Scalp Sebum', 'Safe for Long Term Use'],
        image: '/images/homeopathy/sbl-scalptone.jpg',
      },
      benefits: [
        { title: 'Micro-Circulation Support', desc: 'Improves blood supply to hair papilla, promoting thick regrowth.', icon: 'fa-spa' },
        { title: 'Anti-Flake Action', desc: 'Clears stubborn dry or oily dandruff while conditioning itchy scalp.', icon: 'fa-leaf' },
      ],
      ingredients: [
        { name: 'Acidum fluoricum 6x, Acidum phosphoricum 3x, Natrum muriaticum 3x, Calcarea phosphorica 3x, Badiaga 6x', amount: '25 g Tablets', note: 'Homeopathic pharmacopoeia standard' },
      ],
      usageSteps: [
        { step: '1', title: 'Dosage', desc: 'Adults: 4 tablets, 4-6 times daily. Children: 2 tablets, 4-6 times daily or as prescribed by physician.' },
      ],
      reviews: [
        { id: 'scl-1', author: 'Rohan Sharma', rating: 5, date: 'October 19, 2026', title: 'Noticeable reduction in hair fall', comment: 'Saw big improvement within 3 weeks of regular use. Comb hair with confidence now.', verified: true },
      ],
      isBestSeller: true,
    },

    // 28. Dr. Willmar Schwabe Cineraria Maritima Eye Drops
    'schwabe-cineraria': {
      id: 'schwabe-cineraria',
      name: 'Dr. Willmar Schwabe Cineraria Maritima Eye Drops',
      brand: 'Dr. Willmar Schwabe',
      categoryTag: 'HEALTHCARE PRODUCTS',
      categoryGroup: 'homeopathy',
      categoryTitle: 'Ophthalmic Care & Eye Health',
      categorySubtitle: 'Alcohol-free German soothing sterile drops for clear vision and digital strain relief.',
      subtitle: 'Relieves tired eyes, dry eye syndrome, early cataract stages, and screen fatigue.',
      aboutText: 'Schwabe Cineraria Maritima Eye Drops are an alcohol-free, isotonic, sterile ophthalmic preparation formulated by Dr. Willmar Schwabe Germany. Excellent for preventing early clouding of the lens (cataracts), soothing strained eyes from computers and mobile screens, and clearing irritation.',
      rating: 4.9,
      reviewCount: 1650,
      price: 11.20,
      image: '/images/homeopathy/schwabe-cineraria.jpg',
      galleryImages: ['/images/homeopathy/schwabe-cineraria.jpg', '/images/homeopathy/homeopathy-banner.jpg'],
      variants: [
        { label: '10 ml', subLabel: 'Sterile Dropper', price: 11.20 },
        { label: '2 Pack', subLabel: '2 x 10 ml', price: 20.50 },
        { label: '3 Pack', subLabel: '3 x 10 ml', price: 28.90 },
      ],
      badges: [
        { icon: 'fa-eye', label: 'Alcohol-Free' },
        { icon: 'fa-droplet', label: 'Sterile Isotonic' },
        { icon: 'fa-shield-halved', label: 'Safe Daily Use' },
        { icon: 'fa-certificate', label: 'German Standard' },
      ],
      aboutBadges: [
        { title: 'Soothes Dry Eyes', icon: 'fa-eye' },
        { title: 'Digital Screen Relief', icon: 'fa-laptop' },
        { title: 'Early Cataract Care', icon: 'fa-shield-halved' },
        { title: 'Zero Irritation', icon: 'fa-feather' },
      ],
      powerBanner: {
        title: 'Gentle Vision Care\nBy Schwabe Germany',
        subtitle: 'Natural, stinging-free ocular rejuvenation.',
        checkItems: ['100% Alcohol-Free Formulation', 'Safe with Contact Lenses', 'Sterile Dropper Bottle'],
        image: '/images/homeopathy/schwabe-cineraria.jpg',
      },
      benefits: [
        { title: 'Lens Clarity Support', desc: 'Supports metabolic nourishment to the crystalline lens tissues.', icon: 'fa-eye' },
        { title: 'Computer Strain Relief', desc: 'Moisturizes tired, burning, red eyes from prolonged reading and device usage.', icon: 'fa-laptop' },
      ],
      ingredients: [
        { name: 'Senecio cineraria (Cineraria maritima) D2, Isotonic excipients, sterile aqueous vehicle', amount: '10 ml', note: 'Non-irritating alcohol-free solution' },
      ],
      usageSteps: [
        { step: '1', title: 'Application', desc: 'Instill 1-2 drops into each eye, 2 to 3 times daily or as directed by an ophthalmologist.' },
      ],
      reviews: [
        { id: 'cin-1', author: 'Anita G.', rating: 5, date: 'October 15, 2026', title: 'Does not sting at all!', comment: 'Work 10 hours daily on computers. These eye drops give instant soothing relief.', verified: true },
      ],
      isBestSeller: true,
    },

    // 29. SBL Alfalfa Tonic with Ginseng
    'sbl-alfalfa': {
      id: 'sbl-alfalfa',
      name: 'SBL Alfalfa Tonic with Ginseng Energy Restorative',
      brand: 'SBL Homeopathy',
      categoryTag: 'HEALTHCARE PRODUCTS',
      categoryGroup: 'homeopathy',
      categoryTitle: 'Restorative Vitality & Stamina',
      categorySubtitle: 'Enriched with Medicago sativa, Avena, Ginseng and natural minerals for whole-body vitality.',
      subtitle: 'Natural stamina and appetite booster for physical exhaustion, nervousness, and recovery.',
      aboutText: 'SBL Alfalfa Tonic with Ginseng is a premier natural health restorative. Combining the rejuvenating powers of Alfalfa and Ginseng with Hydrastis and Cinchona, this invigorating tonic combats fatigue, enhances nutrient absorption, stimulates appetite, and revitalizes the nervous system.',
      rating: 4.8,
      reviewCount: 1120,
      price: 9.80,
      image: '/images/homeopathy/sbl-alfalfa.jpg',
      galleryImages: ['/images/homeopathy/sbl-alfalfa.jpg', '/images/homeopathy/homeopathy-banner.jpg'],
      variants: [
        { label: '180 ml', subLabel: 'Single Bottle', price: 9.80 },
        { label: '500 ml', subLabel: 'Economy Family Size', price: 19.50 },
        { label: '2 Pack', subLabel: '2 x 180 ml', price: 17.90 },
      ],
      badges: [
        { icon: 'fa-bolt', label: 'Boosts Energy' },
        { icon: 'fa-heart', label: 'Improves Appetite' },
        { icon: 'fa-leaf', label: 'Pure Botanicals' },
        { icon: 'fa-shield-halved', label: 'Immunity Tonic' },
      ],
      aboutBadges: [
        { title: 'Combats Fatigue', icon: 'fa-bolt' },
        { title: 'Revitalizes Appetite', icon: 'fa-utensils' },
        { title: 'Mental Sharpness', icon: 'fa-brain' },
        { title: 'Speeds Recovery', icon: 'fa-heart-pulse' },
      ],
      powerBanner: {
        title: 'Natural Strength &\nVitality with Ginseng',
        subtitle: 'Replenish vigor after illness or stress.',
        checkItems: ['High Nutrient Bioavailability', 'Safe for Growing Children & Elderly', 'Pleasant Natural Taste'],
        image: '/images/homeopathy/sbl-alfalfa.jpg',
      },
      benefits: [
        { title: 'Physical & Mental Stamina', desc: 'Reduces burnout and enhances daily vitality through adaptogenic botanical herbs.', icon: 'fa-bolt' },
        { title: 'Healthy Appetite & Digestion', desc: 'Promotes wholesome appetite and improves nutrient assimilation in underweight individuals.', icon: 'fa-utensils' },
      ],
      ingredients: [
        { name: 'Alfalfa (Medicago sativa) Q, Avena sativa Q, Ginseng Q, Cinchona officinalis Q, Hydrastis canadensis Q, Kalium phosphoricum 3x, Ferrum phosphoricum 3x', amount: '180 ml', note: 'Syrup base with natural fruit essence' },
      ],
      usageSteps: [
        { step: '1', title: 'Dosage', desc: 'Adults: 1 tablespoonful, 3 times a day before meals. Children: 1 teaspoonful, 3 times a day before meals.' },
      ],
      reviews: [
        { id: 'alf-1', author: 'Meera K.', rating: 5, date: 'October 17, 2026', title: 'Great energy boost', comment: 'Helped my mother regain appetite and strength post flu recovery. Excellent authentic Indian homeopathy tonic.', verified: true },
      ],
      isBestSeller: true,
    },

    // 30. SBL Arnica Montana Mother Tincture Q
    'sbl-arnica': {
      id: 'sbl-arnica',
      name: 'SBL Arnica Montana Mother Tincture Q',
      brand: 'SBL Homeopathy',
      categoryTag: 'HOMEOPATHIC MEDICINE',
      categoryGroup: 'homeopathy',
      categoryTitle: 'Mother Tincture & Trauma Care',
      categorySubtitle: 'Pure botanical extraction for muscular pain, trauma, sprains, and hair follicle care.',
      subtitle: 'Gold standard remedy for trauma, aching muscles, joint tenderness, and scalp stimulation.',
      aboutText: 'SBL Arnica Montana Q is manufactured using genuine European mountain arnica flower heads. A premier homeopathic medicine renowned for accelerating healing in blunt injuries, sprains, post-exercise soreness, bruised sensations, and stimulating strong, healthy hair follicles.',
      rating: 5.0,
      reviewCount: 2100,
      price: 7.50,
      image: '/images/homeopathy/sbl-arnica.jpg',
      galleryImages: ['/images/homeopathy/sbl-arnica.jpg', '/images/homeopathy/homeopathy-banner.jpg'],
      variants: [
        { label: '30 ml', subLabel: 'Tincture Bottle', price: 7.50 },
        { label: '100 ml', subLabel: 'Value Bottle', price: 16.20 },
        { label: '2 Pack', subLabel: '2 x 30 ml', price: 13.90 },
      ],
      badges: [
        { icon: 'fa-leaf', label: '100% Pure Q' },
        { icon: 'fa-dumbbell', label: 'Muscle Recovery' },
        { icon: 'fa-shield-halved', label: 'Anti-Bruise' },
        { icon: 'fa-spa', label: 'Hair Root Care' },
      ],
      aboutBadges: [
        { title: 'Soothes Muscle Sprains', icon: 'fa-dumbbell' },
        { title: 'Dissolves Bruises', icon: 'fa-shield-halved' },
        { title: 'Follicle Rejuvenation', icon: 'fa-spa' },
        { title: 'Joint Soreness Relief', icon: 'fa-bone' },
      ],
      powerBanner: {
        title: 'Arnica Montana Q\nNature’s Trauma Healer',
        subtitle: 'Authentic high-potency mother tincture.',
        checkItems: ['Cold Maceration Extraction', 'Rich in Active Sesquiterpene Lactones', 'Dual Internal & External Application'],
        image: '/images/homeopathy/sbl-arnica.jpg',
      },
      benefits: [
        { title: 'Trauma & Bruise Absorption', desc: 'Stimulates venous absorption and reduces blood stasis caused by shocks and falls.', icon: 'fa-shield-halved' },
        { title: 'Scalp Massage Booster', desc: 'Can be blended with carrier oil to invigorate dormant hair roots and relieve tension.', icon: 'fa-spa' },
      ],
      ingredients: [
        { name: 'Arnica montana plant extract in extra neutral alcohol vehicle (alcohol 60% v/v)', amount: '30 ml', note: 'Homoeopathic Pharmacopoeia of India (HPI)' },
      ],
      usageSteps: [
        { step: '1', title: 'Oral Use', desc: 'Take 10-15 drops in half a cup of water, 2-3 times daily or as prescribed.' },
        { step: '2', title: 'External Hair Use', desc: 'Mix 10-20 drops in coconut or almond oil for scalp massage.' },
      ],
      reviews: [
        { id: 'arn-1', author: 'Vikram Joshi', rating: 5, date: 'October 14, 2026', title: 'Purest Arnica available', comment: 'Always keep this for workout recovery and sprains. Top quality from SBL.', verified: true },
      ],
      isBestSeller: true,
    },

    // 31. Dr. Reckeweg R89 Lipocol Hair Care Drops
    'reckeweg-r89': {
      id: 'reckeweg-r89',
      name: 'Dr. Reckeweg R89 Lipocol Hair Care & Alopecia Drops',
      brand: 'Dr. Reckeweg',
      categoryTag: 'HOMEOPATHIC REMEDY',
      categoryGroup: 'homeopathy',
      categoryTitle: 'Alopecia & Scalp Rejuvenation',
      categorySubtitle: 'Specialist German formula for persistent hair thinning, patchy hair loss, and hormonal baldness.',
      subtitle: 'Advanced bio-therapeutic drops combating excessive hair fall and scalp weakness.',
      aboutText: 'Dr. Reckeweg R89 Lipocol is an acclaimed therapeutic complex targeting constitutional hair loss, baldness patches (alopecia areata), and premature greying. Balances metabolic root function and supports cellular keratin replenishment.',
      rating: 4.7,
      reviewCount: 760,
      price: 18.90,
      image: '/images/homeopathy/reckeweg-r1.jpg',
      galleryImages: ['/images/homeopathy/reckeweg-r1.jpg', '/images/homeopathy/homeopathy-banner.jpg'],
      variants: [
        { label: '30 ml', subLabel: 'Standard Dropper', price: 18.90 },
        { label: 'Pack of 2', subLabel: '2 x 30 ml', price: 34.50 },
      ],
      badges: [
        { icon: 'fa-shield-halved', label: 'Clinically Acclaimed' },
        { icon: 'fa-spa', label: 'Scalp Detox' },
        { icon: 'fa-check', label: 'Regrowth Formula' },
        { icon: 'fa-flask', label: 'Made in Germany' },
      ],
      aboutBadges: [
        { title: 'Alopecia Support', icon: 'fa-shield-halved' },
        { title: 'Hormonal Balance', icon: 'fa-dna' },
        { title: 'Root Revitalization', icon: 'fa-spa' },
        { title: 'Stops Thinning', icon: 'fa-arrow-down' },
      ],
      powerBanner: {
        title: 'German Biological\nHair Regeneration',
        subtitle: 'Targeted R89 complex for stubborn thinning.',
        checkItems: ['Dual Internal & Topical Action', 'German Quality Assurance', 'Combats Stress Hair Fall'],
        image: '/images/homeopathy/reckeweg-r1.jpg',
      },
      benefits: [
        { title: 'Root Vitality', desc: 'Supplies biological stimulus to exhausted follicle bulbs.', icon: 'fa-spa' },
      ],
      ingredients: [
        { name: 'Alfalfa D3, Hypophysis D30, Juglans D12, Kalium phosphoricum D4, Polysorbatum D3, Testes D30', amount: '30 ml', note: 'Homeopathic active dilution' },
      ],
      usageSteps: [
        { step: '1', title: 'Dosage', desc: 'Take 20-30 drops, 3 times daily in water after meals. Also rub 20-30 drops vigorously into scalp at bedtime.' },
      ],
      reviews: [
        { id: 'r89-1', author: 'Amit Saxena', rating: 5, date: 'October 11, 2026', title: 'Saved my receding hairline', comment: 'R89 actually worked where other supplements failed. Steady progress over 2 months.', verified: true },
      ],
      isBestSeller: false,
    },

    // 32. Bakson Rheum Aid Oil & Tablets
    'bakson-rheum': {
      id: 'bakson-rheum',
      name: 'Bakson Rheum Aid Pain Relief Oil & Tablets',
      brand: "Bakson's Homeopathy",
      categoryTag: 'HEALTHCARE PRODUCTS',
      categoryGroup: 'homeopathy',
      categoryTitle: 'Arthritis & Joint Mobility',
      categorySubtitle: 'Dual-action herbal homeopathic combo for stiffness, sciatica, and chronic joint ache.',
      subtitle: 'Penetrating natural action soothing muscular rheumatism and joint inflammation.',
      aboutText: "Bakson Rheum Aid combines time-tested homeopathic herbal actives (Arnica, Cantharis, Gaultheria, Rhus tox) in a high-absorption carrier base. Delivers rapid ease for joint soreness, neck stiffness, backache, and rheumatic discomfort.",
      rating: 4.8,
      reviewCount: 640,
      price: 10.50,
      image: '/images/homeopathy/sbl-arnica.jpg',
      galleryImages: ['/images/homeopathy/sbl-arnica.jpg', '/images/homeopathy/homeopathy-banner.jpg'],
      variants: [
        { label: '60 ml Oil', subLabel: 'Topical Application', price: 10.50 },
        { label: 'Combo Kit', subLabel: '60 ml Oil + 75 Tabs', price: 17.50 },
        { label: '100 ml Oil', subLabel: 'Family Size', price: 15.20 },
      ],
      badges: [
        { icon: 'fa-bone', label: 'Joint Mobility' },
        { icon: 'fa-spa', label: 'Quick Relief' },
        { icon: 'fa-leaf', label: 'Herbal Blend' },
        { icon: 'fa-shield-halved', label: 'Pain Free Movement' },
      ],
      aboutBadges: [
        { title: 'Eases Joint Pain', icon: 'fa-bone' },
        { title: 'Soothes Sciatica', icon: 'fa-bolt' },
        { title: 'Fast Absorption Oil', icon: 'fa-droplet' },
        { title: 'Non-Greasy Formula', icon: 'fa-feather' },
      ],
      powerBanner: {
        title: 'Deep Penetrating\nArthritis Relief',
        subtitle: 'Natural ease for aching knees, spine, and fingers.',
        checkItems: ['Quick Transdermal Absorption', 'Non-Staining Formula', 'Complementary Oral & Topical Therapy'],
        image: '/images/homeopathy/sbl-arnica.jpg',
      },
      benefits: [
        { title: 'Mobility & Flexibility', desc: 'Promotes joint lubrication and relaxes stiff connective tendons.', icon: 'fa-bone' },
      ],
      ingredients: [
        { name: 'Arnica montana, Cantharis, Gaultheria procumbens, Rhus toxicodendron, Sesame oil base', amount: '60 ml', note: 'Topical herbal homeopathic formulation' },
      ],
      usageSteps: [
        { step: '1', title: 'Application', desc: 'Apply gently on affected joints and muscles, massage lightly 2-3 times daily.' },
      ],
      reviews: [
        { id: 'bks-1', author: 'Suresh Menon', rating: 5, date: 'October 13, 2026', title: 'Great for knee pain', comment: 'Gives warmth and relief within minutes. My 68 year old father loves this oil.', verified: true },
      ],
      isBestSeller: false,
    },

    // 33. Wheezal WL-16 Joint Pain Relief Drops
    'wheezal-wl16': {
      id: 'wheezal-wl16',
      name: 'Wheezal WL-16 Joint Pain Relief Drops',
      brand: 'Wheezal Homeopathy',
      categoryTag: 'HOMEOPATHIC REMEDY',
      categoryGroup: 'homeopathy',
      categoryTitle: 'Rheumatic & Joint Care',
      categorySubtitle: 'Specialized drops for knee swelling, sciatica twinges, and musculoskeletal stiffness.',
      subtitle: 'Clinical formulation restoring joint flexibility and easing muscular stiffness.',
      aboutText: 'Wheezal WL-16 Joint Pain Relief Drops provide holistic support for arthritic flare-ups, lumbago, shoulder rigidity, and knee discomfort. Prepared following pharmacopoeial standards with Colchicum, Bryonia, and Kalmia.',
      rating: 4.7,
      reviewCount: 530,
      price: 7.90,
      image: '/images/homeopathy/reckeweg-r1.jpg',
      galleryImages: ['/images/homeopathy/reckeweg-r1.jpg', '/images/homeopathy/homeopathy-banner.jpg'],
      variants: [
        { label: '30 ml', subLabel: 'Dropper Bottle', price: 7.90 },
        { label: 'Pack of 2', subLabel: '2 x 30 ml', price: 14.50 },
      ],
      badges: [
        { icon: 'fa-bone', label: 'Cartilage Care' },
        { icon: 'fa-droplet', label: 'Liquid Dropper' },
        { icon: 'fa-shield-halved', label: 'Anti-Rheumatic' },
        { icon: 'fa-certificate', label: 'GMP Certified' },
      ],
      aboutBadges: [
        { title: 'Joint Comfort', icon: 'fa-bone' },
        { title: 'Spine Flexibility', icon: 'fa-person-walking' },
        { title: 'Zero Gastric Irritation', icon: 'fa-shield-halved' },
        { title: 'Easy Liquid Drops', icon: 'fa-droplet' },
      ],
      powerBanner: {
        title: 'Wheezal WL-16\nActive Joint Recovery',
        subtitle: 'Pure liquid drops for chronic rheumatism.',
        checkItems: ['Gentle on Stomach', 'Non-Drowsy Formula', 'High Bioactivity'],
        image: '/images/homeopathy/reckeweg-r1.jpg',
      },
      benefits: [
        { title: 'Joint Pain Mitigation', desc: 'Addresses uric acid stiffness, knee inflammation, and tendon tightness.', icon: 'fa-bone' },
      ],
      ingredients: [
        { name: 'Bryonia alba 3x, Colchicum autumnale 3x, Kalmia latifolia 3x, Guaiacum 3x, Sticta pulmonaria 3x', amount: '30 ml', note: 'Standardized dilution in alcohol base' },
      ],
      usageSteps: [
        { step: '1', title: 'Dosage', desc: '10 to 15 drops in half a cup of water, 3 to 4 times daily before meals.' },
      ],
      reviews: [
        { id: 'whz-1', author: 'Geeta Nair', rating: 5, date: 'October 10, 2026', title: 'Very helpful drops', comment: 'Relieved morning stiffness in finger joints and knees. Genuine homeopathic medicine.', verified: true },
      ],
      isBestSeller: false,
    },
  };

  /**
   * Get product by ID or slug.
   * If not directly matching, tries normalized matching or falls back to 'isha-neem-turmeric'.
   */
  constructor() {
    // Initial fetch from DummyJSON Products API
    this.fetchProductsFromApi(100).subscribe({
      error: () => {
        // Error state handled in errorSubject
      }
    });
  }

  /**
   * Helper to capitalize words
   */
  public capitalize(str: string): string {
    if (!str) return '';
    return str
      .split(' ')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
      .join(' ');
  }

  /**
   * Maps DummyJSON category slug to Storefront category group
   */
  public mapDummyJsonCategoryToGroup(cat: string): string {
    const c = (cat || '').toLowerCase().trim();
    if (['beauty', 'skin-care', 'fragrances'].includes(c)) {
      return 'beauty';
    }
    if (['laptops', 'smartphones', 'tablets', 'mobile-accessories'].includes(c)) {
      return 'electronics';
    }
    if ([
      'mens-shirts',
      'mens-shoes',
      'mens-watches',
      'womens-bags',
      'womens-dresses',
      'womens-jewellery',
      'womens-shoes',
      'womens-watches',
      'sunglasses',
      'tops'
    ].includes(c)) {
      return 'fashion';
    }
    if (['groceries'].includes(c)) {
      return 'pantry';
    }
    if (['furniture', 'home-decoration', 'kitchen-accessories'].includes(c)) {
      return 'craft-living';
    }
    if (['sports-accessories', 'motorcycle', 'vehicle'].includes(c)) {
      return 'craft-living';
    }
    return c || 'craft-living';
  }

  /**
   * Maps DummyJSON product payload to internal ProductDetailModel
   */
  public mapDummyJsonToProduct(item: DummyJsonProduct): ProductDetailModel {
    const originalPrice =
      item.discountPercentage && item.discountPercentage > 0
        ? +(item.price / (1 - item.discountPercentage / 100)).toFixed(2)
        : undefined;

    const brandName =
      item.brand && item.brand.trim()
        ? item.brand
        : this.capitalize(item.category.replace(/-/g, ' '));

    const defaultImages =
      item.images && item.images.length > 0 ? item.images : [item.thumbnail];
    const image =
      item.thumbnail ||
      defaultImages[0] ||
      `https://dummyjson.com/image/400x400?text=${encodeURIComponent(item.title)}`;

    const variants: ProductVariant[] = [
      {
        label: 'Standard',
        subLabel: '1 Unit',
        price: item.price
      }
    ];

    if (item.stock > 1) {
      variants.push({
        label: 'Bundle Pack',
        subLabel: 'Pack of 2',
        price: +(item.price * 1.85).toFixed(2)
      });
    }

    const reviews: ReviewItem[] = (item.reviews || []).map((r, idx) => ({
      id: `rev-${item.id}-${idx}`,
      author: r.reviewerName || 'Verified Buyer',
      rating: r.rating || 5,
      date: r.date
        ? new Date(r.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'Recent',
      title: r.comment
        ? r.comment.length > 30
          ? r.comment.substring(0, 30) + '...'
          : r.comment
        : 'High Quality Product',
      comment: r.comment || 'Verified authentic product from world market.',
      verified: true
    }));

    const benefits: BenefitItem[] = (item.tags || []).map((tag) => ({
      title: this.capitalize(tag),
      desc: `High quality standard guaranteed for ${tag}.`,
      icon: 'fa-circle-check'
    }));

    if (item.shippingInformation) {
      benefits.push({
        title: 'Global Delivery',
        desc: item.shippingInformation,
        icon: 'fa-truck-fast'
      });
    }

    if (item.warrantyInformation) {
      benefits.push({
        title: 'Warranty Support',
        desc: item.warrantyInformation,
        icon: 'fa-shield-halved'
      });
    }

    const ingredients: IngredientItem[] = [
      {
        name: 'SKU Code',
        amount: item.sku || `DJ-${item.id}`,
        note: 'Official Product Barcode'
      },
      {
        name: 'Availability',
        amount: item.availabilityStatus || (item.stock > 0 ? 'In Stock' : 'Low Stock'),
        note: `${item.stock} units currently available`
      },
      {
        name: 'Weight',
        amount: `${item.weight || 1} kg`,
        note: 'Packaged parcel weight'
      },
      {
        name: 'Return Policy',
        amount: item.returnPolicy || '30 days standard',
        note: 'Hassle-free global returns'
      }
    ];

    const usageSteps: UsageStep[] = [
      {
        step: '01',
        title: 'Unpack Safely',
        desc: 'Inspect original sealed packaging upon arrival.'
      },
      {
        step: '02',
        title: 'Read Specifications',
        desc: item.shippingInformation || 'Follow manufacturer user instructions.'
      },
      {
        step: '03',
        title: 'Warranty Coverage',
        desc: item.warrantyInformation || 'Reach out to support anytime for warranty claims.'
      }
    ];

    return {
      id: String(item.id),
      name: item.title,
      brand: brandName,
      category: item.category,
      categoryTag: (item.category || 'General').toUpperCase().replace(/-/g, ' '),
      categoryTitle: item.title,
      categorySubtitle: item.shippingInformation || item.warrantyInformation || 'Quality tested and guaranteed.',
      subtitle: item.description,
      aboutText: item.description,
      rating: item.rating ? Number(item.rating.toFixed(1)) : 4.5,
      reviewCount: reviews.length
        ? reviews.length * 15 + (item.id % 20)
        : Math.floor((item.rating || 4.5) * 45) + 10,
      price: item.price,
      originalPrice,
      discountPercentage: item.discountPercentage,
      image,
      galleryImages: defaultImages,
      variants,
      badges: [
        { icon: 'fa-shield-halved', label: item.warrantyInformation || 'Verified Authenticity' },
        { icon: 'fa-truck-fast', label: item.shippingInformation || 'Fast Delivery' },
        { icon: 'fa-award', label: `★ ${item.rating || 4.5} Rating` },
        { icon: 'fa-box', label: item.availabilityStatus || 'Stock Verified' }
      ],
      aboutBadges: [
        { title: 'Verified Quality', icon: 'fa-circle-check' },
        { title: item.availabilityStatus || 'Ready to Ship', icon: 'fa-box-open' },
        { title: 'Global Warranty', icon: 'fa-shield-halved' },
        { title: 'Eco Safe Packaging', icon: 'fa-leaf' }
      ],
      powerBanner: {
        title: item.title,
        subtitle: item.shippingInformation || 'Sourced directly and authenticated.',
        checkItems: [
          item.warrantyInformation || '100% Guaranteed',
          item.returnPolicy || 'Return friendly policy',
          'Fast express shipping available'
        ],
        image: defaultImages[1] || image
      },
      benefits,
      ingredients,
      usageSteps,
      reviews,
      isBestSeller: Boolean(item.rating >= 4.5 || ((item.discountPercentage ?? 0) > 12)),
      categoryGroup: this.mapDummyJsonCategoryToGroup(item.category),
      stock: item.stock,
      availabilityStatus: item.availabilityStatus || (item.stock > 0 ? 'In Stock' : 'Low Stock'),
      sku: item.sku,
      tags: item.tags || []
    };
  }

  /**
   * Fetches products from DummyJSON Products API
   */
  public fetchProductsFromApi(limit: number = 30, forceRefresh: boolean = false): Observable<ProductDetailModel[]> {
    if (!forceRefresh && this.hasFetched && this.apiProductsSubject.value.length > 0) {
      return of(this.apiProductsSubject.value);
    }

    this.isLoadingSubject.next(true);
    this.errorSubject.next(null);

    const url = limit > 0 ? `${this.apiUrl}?limit=${limit}` : this.apiUrl;
    return this.http.get<DummyJsonResponse>(url).pipe(
      map((response) => {
        const mappedProducts = (response.products || []).map((p) =>
          this.mapDummyJsonToProduct(p)
        );

        // Store into internal catalog dictionary for fast direct ID lookup
        mappedProducts.forEach((p) => {
          this.catalog[p.id] = p;
          const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          this.catalog[slug] = p;
        });

        this.apiProductsSubject.next(mappedProducts);
        this.isLoadingSubject.next(false);
        this.hasFetched = true;
        return mappedProducts;
      }),
      catchError((err) => {
        console.error('Failed to fetch from DummyJSON Products API', err);
        const errorMsg = 'Failed to load live products from DummyJSON API. Please check your network connection and try again.';
        this.errorSubject.next(errorMsg);
        this.isLoadingSubject.next(false);
        return of([]);


      })
    );
  }

  /**
   * Fetch single product by ID (from cache or DummyJSON API)
   */
  public loadProductById(id: string): Observable<ProductDetailModel> {
    const existing = this.getProductById(id);
    if (existing && existing.id === id) {
      return of(existing);
    }

    // If ID is numeric, fetch directly from DummyJSON
    if (/^\d+$/.test(id)) {
      return this.http.get<DummyJsonProduct>(`${this.apiUrl}/${id}`).pipe(
        map((p) => {
          const mapped = this.mapDummyJsonToProduct(p);
          this.catalog[mapped.id] = mapped;
          return mapped;
        }),
        catchError(() => of(this.getProductById(id)))
      );
    }

    return of(existing);
  }

  /**
   * Get product by ID (synchronous from catalog dictionary)
   */
  public getProductById(id: string): ProductDetailModel {
    if (this.catalog[id]) {
      return this.catalog[id];
    }

    const inApi = this.apiProductsSubject.value.find((p) => p.id === String(id));
    if (inApi) {
      return inApi;
    }

    // Try finding by normalized key
    const normalizedKey = (id || '').toLowerCase().trim();
    if (this.catalog[normalizedKey]) {
      return this.catalog[normalizedKey];
    }

    // Try finding by slug without trailing s or with hyphens
    const found = Object.values(this.catalog).find(
      (p) =>
        p.id.toLowerCase() === normalizedKey ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedKey
    );
    if (found) {
      return found;
    }

    // Return first product in API or default hero product
    const all = this.getAllProducts();
    return all.length > 0 ? all[0] : this.catalog['isha-neem-turmeric'];
  }

  /**
   * Get category group for a given product
   */
  public getCategoryGroup(product: ProductDetailModel): string {
    if (product.categoryGroup) {
      return product.categoryGroup;
    }
    const tag = (product.categoryTag || '').toLowerCase();
    const id = (product.id || '').toLowerCase();

    if (
      tag.includes('beauty') ||
      tag.includes('skin') ||
      tag.includes('fragrance') ||
      tag.includes('cosmetic')
    ) {
      return 'beauty';
    }

    if (
      tag.includes('laptop') ||
      tag.includes('smart') ||
      tag.includes('phone') ||
      tag.includes('tablet') ||
      tag.includes('electronic') ||
      tag.includes('mobile')
    ) {
      return 'electronics';
    }

    if (
      tag.includes('shirt') ||
      tag.includes('dress') ||
      tag.includes('shoe') ||
      tag.includes('watch') ||
      tag.includes('jewel') ||
      tag.includes('bag') ||
      tag.includes('fashion') ||
      tag.includes('sunglass')
    ) {
      return 'fashion';
    }

    if (
      tag.includes('homeopath') ||
      tag.includes('dilution') ||
      tag.includes('tincture') ||
      id.includes('reckeweg') ||
      id.includes('sbl') ||
      id.includes('schwabe') ||
      id.includes('bakson') ||
      id.includes('wheezal') ||
      id.includes('adel')
    ) {
      return 'homeopathy';
    }

    if (
      tag.includes('supplement') ||
      tag.includes('wellness') ||
      tag.includes('vitamin') ||
      tag.includes('immunity') ||
      tag.includes('detox') ||
      tag.includes('ayurveda') ||
      tag.includes('care') ||
      tag.includes('superfoods') ||
      tag.includes('botanical') ||
      id.includes('capsule') ||
      id.includes('giloy') ||
      id.includes('liv52') ||
      id.includes('chyawanprash') ||
      id.includes('balance') ||
      id.includes('saffron')
    ) {
      return 'wellness';
    }

    if (
      tag.includes('grocery') ||
      tag.includes('groceries') ||
      tag.includes('pantry') ||
      tag.includes('spice') ||
      tag.includes('pickle') ||
      tag.includes('grain') ||
      tag.includes('millet') ||
      tag.includes('fruit') ||
      id === 'ghee' ||
      id === 'regional-pantry-box' ||
      id === 'masala-powders' ||
      id === 'pickles' ||
      id === 'millets' ||
      id === 'dry-fruits'
    ) {
      return 'pantry';
    }

    if (
      tag.includes('sweet') ||
      tag.includes('snack') ||
      tag.includes('cacao') ||
      tag.includes('chocolate') ||
      tag.includes('butter') ||
      tag.includes('bakery') ||
      tag.includes('cookie') ||
      id === 'sweets' ||
      id === 'snacks' ||
      id === 'chocolates' ||
      id === 'spreads' ||
      id === 'biscuits-cookies'
    ) {
      return 'sweets-snacks';
    }

    if (
      tag.includes('drink') ||
      tag.includes('brew') ||
      tag.includes('tea') ||
      tag.includes('elixir') ||
      id === 'health-drinks' ||
      id === 'tea-coffee' ||
      id === 'drinks'
    ) {
      return 'beverages';
    }

    return 'craft-living';
  }

  /**
   * Get category display label
   */
  public getCategoryDisplayName(group: string): string {
    switch (group) {
      case 'beauty':
        return 'Beauty, Fragrances & Skincare';
      case 'electronics':
        return 'Electronics, Mobiles & Tech';
      case 'fashion':
        return 'Fashion, Apparel & Watches';
      case 'homeopathy':
        return 'Indian Homeopathic Remedies & Healthcare';
      case 'wellness':
        return 'Natural Supplements & Wellness';
      case 'pantry':
        return 'Heritage Pantry, Groceries & Staples';
      case 'sweets-snacks':
        return 'Sweets, Snacks & Confections';
      case 'beverages':
        return 'Artisanal Brews & Health Drinks';
      case 'craft-living':
        return 'Home & Living, Decor & Furnishing';
      default:
        return 'All Products';
    }
  }

  /**
   * Get list of related products for a given product ID (excluding current)
   */
  public getRelatedProducts(currentId: string, count: number = 4): ProductDetailModel[] {
    const current = this.getProductById(currentId);
    const currentGroup = this.getCategoryGroup(current);
    const all = this.getAllProducts();

    const sameCategory = all.filter(
      (p) => p.id !== currentId && this.getCategoryGroup(p) === currentGroup
    );
    const otherCategories = all.filter(
      (p) => p.id !== currentId && this.getCategoryGroup(p) !== currentGroup
    );

    const merged = [...sameCategory, ...otherCategories];
    return merged.slice(0, count);
  }

  /**
   * Get all products in the catalog (returns API products when available)
   */
  public getAllProducts(): ProductDetailModel[] {
    const apiProducts = this.apiProductsSubject.value;
    if (apiProducts && apiProducts.length > 0) {
      return apiProducts;
    }
    return Object.values(this.catalog);
  }

  /**
   * Get all Indian homeopathic products
   */
  public getHomeopathyProducts(): ProductDetailModel[] {
    return this.getAllProducts().filter((p) => this.getCategoryGroup(p) === 'homeopathy');
  }

  /**
   * Get all categories with product counts dynamically
   */
  public getCategoriesWithCount(): { id: string; name: string; icon: string; count: number }[] {
    const all = this.getAllProducts();
    const counts: Record<string, number> = {
      all: all.length,
      beauty: 0,
      electronics: 0,
      fashion: 0,
      'craft-living': 0,
      pantry: 0,
      wellness: 0,
      homeopathy: 0,
      'sweets-snacks': 0,
      beverages: 0
    };

    all.forEach((p) => {
      const group = this.getCategoryGroup(p);
      if (counts[group] !== undefined) {
        counts[group]++;
      } else {
        counts[group] = 1;
      }
    });

    const categoriesList = [
      { id: 'all', name: 'All Products', icon: 'fa-cubes', count: counts['all'] },
      { id: 'beauty', name: 'Beauty & Skincare', icon: 'fa-wand-magic-sparkles', count: counts['beauty'] || 0 },
      { id: 'electronics', name: 'Electronics & Gadgets', icon: 'fa-laptop', count: counts['electronics'] || 0 },
      { id: 'fashion', name: 'Fashion & Apparel', icon: 'fa-shirt', count: counts['fashion'] || 0 },
      { id: 'craft-living', name: 'Home & Living', icon: 'fa-couch', count: counts['craft-living'] || 0 },
      { id: 'pantry', name: 'Groceries & Pantry', icon: 'fa-basket-shopping', count: counts['pantry'] || 0 },
      { id: 'wellness', name: 'Natural Wellness', icon: 'fa-leaf', count: counts['wellness'] || 0 },
      { id: 'homeopathy', name: 'Indian Homeopathy', icon: 'fa-stethoscope', count: counts['homeopathy'] || 0 },
    ];

    // Only return All + categories that have at least 1 product
    return categoriesList.filter((c) => c.id === 'all' || c.count > 0);
  }

  /**
   * Get distinct brands with product count
   */
  public getBrandsWithCount(): { name: string; count: number }[] {
    const all = this.getAllProducts();
    const counts: Record<string, number> = {};

    all.forEach((p) => {
      const brand = p.brand || 'Other';
      counts[brand] = (counts[brand] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
}
