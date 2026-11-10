import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  desc: string;
}

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StorefrontHeader, Footer],
  templateUrl: './careers.html',
  styleUrl: './careers.scss',
})
export class CareersPage {
  selectedDepartment: string = 'All';
  departments: string[] = ['All', 'Engineering', 'Supply Chain & Logistics', 'Merchandising & Catalog', 'Customer Experience'];

  jobs: JobOpening[] = [
    {
      id: 'eng-1',
      title: 'Senior Frontend Engineer (Angular)',
      department: 'Engineering',
      location: 'Remote (USA / India)',
      type: 'Full-time',
      experience: '4+ Years',
      desc: 'Build fluid, high-performance storefront features, smart cart modules, and responsive catalog browsing for diaspora shoppers.',
    },
    {
      id: 'eng-2',
      title: 'Senior Full Stack Logistics Engineer',
      department: 'Engineering',
      location: 'Remote (Global)',
      type: 'Full-time',
      experience: '5+ Years',
      desc: 'Architect our international customs clearance and real-time air cargo tracking engine integrating DHL, FedEx, and postal partners.',
    },
    {
      id: 'log-1',
      title: 'International Air Freight Operations Manager',
      department: 'Supply Chain & Logistics',
      location: 'Hyderabad / Delhi, India',
      type: 'Full-time',
      experience: '5+ Years',
      desc: 'Oversee daily temperature-controlled cross-border cargo dispatch to North American, European, and Australian international hubs.',
    },
    {
      id: 'merch-1',
      title: 'Category Manager - Homeopathy & Natural Health',
      department: 'Merchandising & Catalog',
      location: 'Remote (India)',
      type: 'Full-time',
      experience: '3+ Years',
      desc: 'Partner directly with Dr. Reckeweg, SBL, Schwabe, and organic Ayurveda cooperatives to expand certified authentic wellness listings.',
    },
    {
      id: 'cx-1',
      title: 'Global Customer Experience Specialist',
      department: 'Customer Experience',
      location: 'Remote (Multiple Time Zones)',
      type: 'Full-time',
      experience: '2+ Years',
      desc: 'Provide empathetic, high-touch support to diaspora customers tracking festive orders, dietary queries, and customs inquiries.',
    },
  ];

  selectedJob: JobOpening | null = null;
  applicantName: string = '';
  applicantEmail: string = '';
  applicantNote: string = '';
  applicationSubmitted: boolean = false;

  get filteredJobs(): JobOpening[] {
    if (this.selectedDepartment === 'All') return this.jobs;
    return this.jobs.filter((j) => j.department === this.selectedDepartment);
  }

  openApplyModal(job: JobOpening): void {
    this.selectedJob = job;
    this.applicationSubmitted = false;
  }

  submitApplication(event: Event): void {
    event.preventDefault();
    if (this.applicantName && this.applicantEmail) {
      this.applicationSubmitted = true;
      setTimeout(() => {
        this.selectedJob = null;
        this.applicantName = '';
        this.applicantEmail = '';
        this.applicantNote = '';
        this.applicationSubmitted = false;
      }, 3000);
    }
  }
}
