import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  open(message: string, action: string = 'Chiudi', milsec: number = 3000, config?: MatSnackBarConfig) {
    this.snackBar.open(message, action, {
      duration: milsec, // durata in millisecondi
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      ...config // consente di sovrascrivere le opzioni predefinite
    });
  }
}