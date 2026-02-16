import { Directive, ElementRef, ViewChild } from '@angular/core';

@Directive({
  selector: '[appSetDialogAnimation]',
})
export class SetDialogAnimation {
  isClosing = false;

  constructor(private dialogRef: ElementRef<HTMLDialogElement>) {}

  openDialogWithAnimation() {
    this.isClosing = false;
    this.dialogRef.nativeElement.showModal();
    this.dialogRef.nativeElement.classList.remove('slide-out');
    this.dialogRef.nativeElement.classList.add('slide-in');
  }

  closeDialogWithAnimation() {
    this.isClosing = true;
    this.dialogRef.nativeElement.classList.remove('slide-in');
    this.dialogRef.nativeElement.classList.add('slide-out');

    setTimeout(() => {
      this.isClosing = false;
      this.dialogRef.nativeElement.classList.remove('slide-out');
      this.dialogRef.nativeElement.close();
    }, 500); // Dauer muss mit CSS übereinstimmen
  }
}
