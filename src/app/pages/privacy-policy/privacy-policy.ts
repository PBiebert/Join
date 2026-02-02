import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';

/**
 * Privacy Policy page component
 * @description Displays the privacy policy content with GDPR compliance information
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [Nav, Header],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss'
})
export class PrivacyPolicy {
  constructor(private location: Location) {}

  /**
   * Navigates back to the previous page
   */
  goBack(): void {
    this.location.back();
  }
}