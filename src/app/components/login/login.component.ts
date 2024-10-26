import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, catchError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card'
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { Router } from '@angular/router';
import { TimeConverterPipe } from '../../pipes/time-converter.pipe';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule, 
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    NgIf,
    TimeConverterPipe,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: [null, {validators: Validators.required}],
    password: [null, {validators: Validators.required}]
  })

  confirmForm = this.fb.group({
    otpCode: [null, {validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)]}]
  })

  recoveryForm = this.fb.group({
    email: [null, {validators: [Validators.required, Validators.email]}]
  })

  publicKey: string | null = null;

  hide = signal(true);

  public timer = signal(0);
  public toAction: 'toLog' | 'toRecovery' | 'toConfirm' = 'toLog';
  public usernameToConfirm: string | null = null;

  private destroyed$ = new Subject<void>();

  constructor(
              protected fb: NonNullableFormBuilder,
              private authSrv: AuthService,
              private dialogSrv: DialogService,
              private router: Router,
              private snackbar: MatSnackBar) { }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  clickEvent(event: MouseEvent) {
    event.preventDefault();
    this.hide.set(!this.hide());
  }

  setAction(action: 'toLog' | 'toRecovery' | 'toConfirm') {
    if (action === 'toConfirm') {
      this.usernameToConfirm = this.loginForm.value.username ? this.loginForm.value.username! : null;
    } else {
      this.usernameToConfirm = null;
    }
    this.toAction = action;
    this.recoveryForm.reset({}, { emitEvent: false });
    this.recoveryForm.markAsUntouched();
    this.loginForm.reset({}, { emitEvent: false });
    this.loginForm.markAsUntouched();
    this.confirmForm.reset({}, { emitEvent: false });
    this.confirmForm.markAsPristine();
  }

  recoveryPassword() {
    this.authSrv.recoveryPassword(this.recoveryForm.value.email!)
    .pipe(
      catchError(err => {
        if (err.status === 400 || err.status === 404 || err.status === 401) this.dialogSrv.openDialog({title: 'Email non valida', description: ['Controlla di averla digitata correttamente'], type: 'error'});
        else this.dialogSrv.openDialog({title: 'Errore generico', description: ['Stiamo riscontrando un problema, per favore riprova più tardi'], type: 'error'});
        return err;
      })
    )
    .subscribe(_ => {
      this.snackbar.open('Password inviata correttamente', 'OK', { duration: 5000 });
      this.toAction = 'toLog';
      this.recoveryForm.reset({}, { emitEvent: false });
      this.recoveryForm.markAsPristine();
    })
  }

  login() {
    const { username, password } = this.loginForm.value;
    this.authSrv.login(username!, password!)
      .pipe(
        catchError(err => {
          if (err.status === 401) this.dialogSrv.openDialog({title: 'Credenziali non valide', description: ['Controlla che le credenziali inserite siano corrette'], type: 'error'});
          else this.dialogSrv.openDialog({title: 'Errore generico', description: ['Stiamo riscontrando un problema, per favore riprova più tardi'], type: 'error'});
          return err;
        })
      )
      .subscribe(publicKey => {
        this.publicKey = publicKey as string;
        this.setIntervalTimer();
        this.setAction('toConfirm');
      });
  }

  confirmLogin() { 
    this.authSrv.confirm('login', this.publicKey!, this.confirmForm.value.otpCode!)
    .pipe(
      catchError(err => {
        if (err.status === 401 || err.status === 400) this.dialogSrv.openDialog({title: 'Codice non valido', description: ['Controlla il codice inviato alla tua email'], type: 'error'});
        else {
          this.dialogSrv.openDialog({title: 'Errore generico', description: ['Stiamo riscontrando un problema, per favore riprova più tardi'], type: 'error'});
          this.loginForm.reset({}, { emitEvent: false });
          this.loginForm.markAsPristine();
          this.toAction = 'toLog';
        }
        return err;
      })
    )
    .subscribe(_ => {
      this.router.navigate(['/dashboard']);
    })
  }

  resendConfirm() {
    this.authSrv.resendConfirm(this.publicKey!)
    .pipe(
      catchError(err => {
        if (err.status === 401 || err.status === 400) this.dialogSrv.openDialog({title: 'Sessione scaduta', description: ['Rieffettua il login'], type: 'error'});
        else this.dialogSrv.openDialog({title: 'Errore generico', description: ['Stiamo riscontrando un problema, per favore riprova più tardi'], type: 'error'});
        this.toAction = 'toLog';
        this.confirmForm.reset({}, { emitEvent: false });
        this.confirmForm.markAsPristine();
        return err;
      })
    )
    .subscribe(publicKey => {
      this.setIntervalTimer();
      this.publicKey = publicKey as string;
      this.snackbar.open("Codice reinviato correttamente", "OK", { duration: 5000 });
    })
  }

  setIntervalTimer() {
    this.timer.set(60);
    const intervalId = setInterval(() => {
      if (this.timer() > 0) {
        this.timer.set(this.timer() - 1);
      } else {
        clearInterval(intervalId); // Ferma il setInterval quando timer raggiunge 0
      }
    }, 1000); // Riduci il timer ogni secondo (1000 ms)
  }
}