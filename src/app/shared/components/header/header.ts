import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isDropdownOpen = false;
  dropdownBounce = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  triggerBounce() {
    this.dropdownBounce = false;
    setTimeout(() => {
      this.dropdownBounce = true;
      setTimeout(() => {
        this.dropdownBounce = false;
      }, 300);
    }, 10);
  }
}