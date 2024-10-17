import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  open(message: string, action: string = 'Chiudi', config?: MatSnackBarConfig) {
    this.snackBar.open(message, action, {
      duration: 3000, // durata in millisecondi
      verticalPosition: 'top',
      horizontalPosition: 'right',
      ...config // consente di sovrascrivere le opzioni predefinite
    });
  }
}