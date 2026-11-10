import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink, StorefrontHeader, Footer],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class BlogPage {
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Homeopathy & Remedies', 'Ayurveda & Wellness', 'Culinary Traditions', 'Festive Living'];

  featuredPost: BlogPost = {
    id: 'homeopathy-potencies-guide',
    title: 'The Beginner’s Guide to Homeopathic Dilutions & Mother Tinctures',
    category: 'Homeopathy & Remedies',
    date: 'October 18, 2026',
    readTime: '6 min read',
    image: '/images/homeopathy/homeopathy-banner.jpg',
    excerpt:
      'Understanding how centesimal (C), decimal (X), and Q potencies work, why Dr. Reckeweg formulations rely on targeted biological complexes, and how diaspora families use Arnica and Cineraria safely at home.',
    author: {
      name: 'Dr. Meera Swaminathan',
      avatar: '/images/wellness/neem-turmeric.jpg',
      role: 'Consultant Homeopath & Naturopath',
    },
  };

  posts: BlogPost[] = [
    {
      id: 'ashwagandha-sleep-science',
      title: 'Ashwagandha for Stress & Restful Sleep: What Modern Clinical Trials Say',
      category: 'Ayurveda & Wellness',
      date: 'October 14, 2026',
      readTime: '5 min read',
      image: '/images/wellness/ashwagandha.jpg',
      excerpt:
        'How withanolides modulate cortisol levels, support adrenal vitality, and why pairing root extract with black pepper bio-enhancers yields optimal absorption.',
      author: {
        name: 'Vaidya Anirudh Joshi',
        avatar: '/images/wellness/amla-capsules.jpg',
        role: 'Ayurvedic Physician',
      },
    },
    {
      id: 'authentic-a2-ghee-secrets',
      title: 'Why Cultured A2 Bilona Ghee Tastes Different from Commercial Butter',
      category: 'Culinary Traditions',
      date: 'October 10, 2026',
      readTime: '4 min read',
      image: '/images/wellness/turmeric-bowl-thumb.jpg',
      excerpt:
        'The slow wood-fired bilona churning technique that preserves aromatic nutty nuances, fat-soluble vitamins A, D, E, and K, and butyric gut health acid.',
      author: {
        name: 'Savitri Devi',
        avatar: '/images/wellness/neem-turmeric.jpg',
        role: 'Heritage Culinary Archivist',
      },
    },
    {
      id: 'scalptone-hair-fall-remedy',
      title: 'Combating Seasonal Hair Thinning with SBL Scalptone and Arnica',
      category: 'Homeopathy & Remedies',
      date: 'October 06, 2026',
      readTime: '5 min read',
      image: '/images/homeopathy/sbl-scalptone.jpg',
      excerpt:
        'A deep dive into hair root micro-circulation, homeopathic biochemic tissue salts, and how external Arnica Q combines with internal dietary support.',
      author: {
        name: 'Dr. Meera Swaminathan',
        avatar: '/images/wellness/neem-turmeric.jpg',
        role: 'Consultant Homeopath',
      },
    },
    {
      id: 'temple-prasadam-history',
      title: 'The Sacred History & Craft of the Tirupati Laddu: A Culinary Wonder',
      category: 'Culinary Traditions',
      date: 'September 28, 2026',
      readTime: '7 min read',
      image: '/images/wellness/turmeric-bowl-thumb.jpg',
      excerpt:
        'Exploring the GI-tagged recipe of pure chickpea flour, crystalline sugar candy, green cardamom, cashews, and rich cow ghee perfected over centuries.',
      author: {
        name: 'R. K. Raghavan',
        avatar: '/images/wellness/amla-capsules.jpg',
        role: 'Cultural Historian',
      },
    },
    {
      id: 'diwali-heritage-pantry-prep',
      title: 'Preparing Your Overseas Festive Pantry: Spices, Diyas & Sweet Mixes',
      category: 'Festive Living',
      date: 'September 20, 2026',
      readTime: '5 min read',
      image: '/images/wellness/neem-bottle-nature.jpg',
      excerpt:
        'How diaspora homes recreate the nostalgic aroma of Diwali morning with brass oil lamps, freshly pressed mustard oil, and festive namkeens.',
      author: {
        name: 'Preeti Deshmukh',
        avatar: '/images/wellness/neem-turmeric.jpg',
        role: 'Diaspora Lifestyle Editor',
      },
    },
  ];

  get filteredPosts(): BlogPost[] {
    if (this.selectedCategory === 'All') return this.posts;
    return this.posts.filter((p) => p.category === this.selectedCategory);
  }
}
