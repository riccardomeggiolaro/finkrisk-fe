import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { MatButton } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { AuthService } from "../../services/auth.service";
import { NgIf } from "@angular/common";
import { catchError, of } from "rxjs";

export interface DialogData {
  title: string;
  description: string;
  type: 'success' | 'error' | 'warning';
}

@Component({
  selector: 'dialog-content-component',
  templateUrl: 'dialog-confirm.component.html',
  styleUrl: 'dialog-confirm.component.css',
  standalone: true,
  imports: [MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, MatFormFieldModule, FormsModule, MatInputModule, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmComponent {
    inputCode: number | null = null;
    public error: string | null = null;

    constructor(
      public dialogRef: MatDialogRef<DialogConfirmComponent>,
      @Inject(MAT_DIALOG_DATA) public data: {title: string, action: 'login' | 'register', publicKey: string},
      private authSrv: AuthService
    ) {}

    onConfirm(): void {
      this.authSrv.confirm(this.data.action, this.data.publicKey, this.inputCode!)
      .pipe(
        catchError(err => {
          this.error = 'Codice non valido';
          console.log(this.error)
          return of(err);
        })
      )
      .subscribe(value => {
        console.log(value)
        this.dialogRef.close(this.inputCode);
        return value;
      })
    }
}