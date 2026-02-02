import { Component } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Help – Zeigt die Hilfe-Seite mit Anleitung zur Nutzung von Join.
 *
 * Die Seite zeigt nur statischen Text.
 * Der Zurück-Pfeil nutzt Location.back(), um zur vorherigen Seite
 * zurückzukehren – egal von wo der User gekommen ist.
 */
@Component({
  selector: 'app-help',
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
  /**
   * Location steuert den Browser-Verlauf.
   */
  constructor(private location: Location) {}

  /**
   * Navigiert zurück zur vorherigen Seite.
   * Wird vom Zurück-Pfeil oben rechts ausgelöst.
   */
  protected goBack(): void {
    this.location.back();
  }
}