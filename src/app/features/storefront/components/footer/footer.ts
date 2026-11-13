import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { BannerService } from '../../../../core/services/banner.service';

export interface TopProductLink {
  name: string;
  routerLink?: string[];
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly router = inject(Router);
  readonly bannerService = inject(BannerService);

  get trustBanner() {
    const list = this.bannerService.getActiveBannersBySection('Footer Trust Banner');
    return list.length > 0 ? list[0] : null;
  }

  // Country tabs for Serving Cities exactly as shown in screenshot
  selectedCountry: 'USA' | 'UK' | 'Others' = 'USA';
  countries: ('USA' | 'UK' | 'Others')[] = ['USA', 'UK', 'Others'];

  citiesByCountry: Record<'USA' | 'UK' | 'Others', string> = {
    USA:
      'Overland Park | Tempe | McKinney | Mobile, Cape Coral, Shreveport, Frisco, Knoxville, Worcester, Brownsville, Vancouver, Fort Lauderdale, Frisco, Ontario, Chattanooga, Providence, Newport News(m), Rancho Cucamonga, Santa Rosa, Oceanside, Elk Grove, Garden Grove, Pembroke Pines, Alexandria(m), Hayward, Lakewood, Clarksville, Palmdale, Hollywood, Pasadena, Joliet, Bellevue, Savannah, Paterson, Torrance, Killeen, Naperville, Rockford, Bridgeport, McAllen, Mesquite, Syracuse, Midland, Murfreesboro, Miramar, Dayton, Fullerton, Olathe, Orange, Thornton, Roseville, Denton, Waco, Surprise, Carrollton, West Valley City, Charleston, Warren, Hampton, Gainesville, Visalia, Coral Springs, Columbia, Cedar Rapids, Sterling Heights, New Haven, Stamford, Concord, Kent, Santa Clara, Elizabeth, Round Rock, Thousand Oaks, Lafayette, Simi Valley, Topeka, Norman, Fargo, Wilmington, Abilene, Odessa, Pearland, Victorville, Hartford, Vallejo, Allentown, Berkeley, Richardson, Arvada, Ann Arbor, Rochester, Cambridge, Lansing, Evansville, Carlsbad, Independence, Clearwater, Beaumont, League City, Downey, Miami Gardens, Elgin, Costa Mesa, Pueblo, College Station, West Jordan, Inglewood, Richmond, Billings, West Palm Beach, Manchester, Murrieta, High Point, Lowell, Antioch, Waterbury, Centennial, Pompano Beach, Palm Bay, South Bend, Burbank, Wichita Falls, Green Bay, West Covina, El Cajon, San Mateo, Rialto, Edison, Norwalk, Davenport, Hillsboro, Las Cruces, Sandy Springs, Everett, Jurupa Valley, Tyler, Boulder, Daly City, Broken Arrow, Allen, Sunrise, Bend, Spokane Valley, Tuscaloosa, Miami, Dallas, Austin, San Jose, Fremont, Chicago, New York, Seattle, Atlanta, Boston, Denver, Houston, Phoenix, Los Angeles',
    UK:
      'London | Birmingham | Manchester | Glasgow, Leeds, Edinburgh, Liverpool, Bristol, Sheffield, Leicester, Coventry, Bradford, Cardiff, Nottingham, Newcastle, Kingston upon Hull, Southampton, Reading, Derby, Plymouth, Wolverhampton, Northampton, Norwich, Luton, Aberdeen, Milton Keynes, Oxford, Cambridge, Swansea, Swindon, York, Peterborough, Dundee, Poole, Huddersfield, Middlesbrough, Blackpool, Bolton, Ipswich, Telford, Watford',
    Others:
      'Toronto | Vancouver | Amsterdam | Sydney, Melbourne, Dubai, Singapore, Montreal, Calgary, Rotterdam, The Hague, Utrecht, Eindhoven, Auckland, Dublin, Paris, Berlin, Frankfurt, Zurich, Brussels, Stockholm, Oslo, Copenhagen, Vienna, Madrid, Rome, Tokyo, Seoul',
  };

  topWellnessProducts: TopProductLink[] = [
    { name: 'Neem and Turmeric Capsules', routerLink: ['/product', 'isha-neem-turmeric'] },
    { name: 'Patanjali Giloy Ghan Vati', routerLink: ['/products'], queryParams: { search: 'Giloy' } },
    { name: 'Liv 52 Tablets', routerLink: ['/products'], queryParams: { search: 'Liv 52' } },
    { name: 'Patanjali Divya Mukta Vati', routerLink: ['/products'], queryParams: { search: 'Mukta Vati' } },
  ];

  topBeautyProducts: TopProductLink[] = [
    { name: 'Wishcare Hair Growth Serum', routerLink: ['/products'], queryParams: { search: 'Hair Growth' } },
    { name: 'Vaseline Daily Brightening', routerLink: ['/products'], queryParams: { search: 'Brightening' } },
    { name: 'Man Matters Ketoconazole Anti Dandruff Shampoo', routerLink: ['/products'], queryParams: { search: 'Anti Dandruff' } },
    { name: 'Be Bodywise Hair Growth Serum', routerLink: ['/products'], queryParams: { search: 'Hair Serum' } },
  ];

  topFoodProducts: TopProductLink[] = [
    { name: 'Ensure Vanilla Powder', routerLink: ['/products'], queryParams: { search: 'Vanilla Powder' } },
    { name: 'Pulla Reddy Assorted Sweets', routerLink: ['/product', 'tirupati-laddu'] },
    { name: 'Isha Life A2 Desi Cow Ghee', routerLink: ['/product', 'ghee'] },
    { name: 'Vellanki Foods Ghee Ariselu', routerLink: ['/products'], queryParams: { search: 'Ariselu' } },
  ];

  topBabyKidsProducts: TopProductLink[] = [
    { name: 'Pediasure Vanilla Flavor', routerLink: ['/products'], queryParams: { search: 'Pediasure' } },
    { name: 'Nan Pro 3', routerLink: ['/products'], queryParams: { search: 'Nan Pro' } },
    { name: 'Similac Isomil Soy Infant Powder', routerLink: ['/products'], queryParams: { search: 'Similac' } },
    { name: 'Cerelac Multigrain Cereal', routerLink: ['/products'], queryParams: { search: 'Cerelac' } },
  ];

  get isHomePage(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/' || url === '';
  }

  selectCountry(country: 'USA' | 'UK' | 'Others'): void {
    this.selectedCountry = country;
  }
}
