import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from "rxjs"
import { JwtService } from "./jwt.service";

export interface ConfirmResponse {
  message: string;
  publicKey: string;
}

export interface User {
  company: string | null;
  role: "Admin" | "Customer";
  abiCodeId?: string | null;
  username?: string | null;
  enabled: boolean | null;  
}

export interface AuthenticatedUser extends User {
  access_token: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  private url = "http://localhost:3000/api/auth";

  private _currentUser$ = new BehaviorSubject<User | null>(null);

  currentUser$ = this._currentUser$.asObservable();

  constructor(private jwtSrv: JwtService,
              private http: HttpClient,
              private router: Router) {
  }

  isLoggedIn() {
    return this.jwtSrv.hasToken();
  }

  login(username: string, password: string) {
    return this.http.post<ConfirmResponse>(`${this.url}/login`, {username, password})
      .pipe(
        map(res => res.publicKey)
      );
  }

  register(company: string, abiCode: string, username: string, password: string) {
    return this.http.post<ConfirmResponse>(`${this.url}/register`, { company, abiCode, username, password })
      .pipe(
        map(res => res.publicKey)
      )
  }

  confirm(action: 'login' | 'register', publicKey: string, otpCode: number) {
    return this.http.get<AuthenticatedUser>(`${this.url}/confirm-${action}/${publicKey}/${otpCode}`)
      .pipe(
        tap(res => this.jwtSrv.setToken(res.access_token)),
        tap(res => this._currentUser$.next(res)),
        map(res => res)
      )
  }

  resendConfirm(publicKey: string) {
    return this.http.get<ConfirmResponse>(`${this.url}/resend-confirm/${publicKey}`)
      .pipe(
        map(res => res.publicKey)
      )
  }

  recoveryPassword(email: string) {
    return this.http.get<{ message: string }>(`${this.url}/send-recovery-password/${email}`);
  }

  logout() {
    this.jwtSrv.removeToken();
    this._currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  private error(err: HttpErrorResponse){
    this.logout();
    return throwError(err);
  }

  fetchUser(): Observable<User>  {
    return this.http.get<User>(`${this.url}/profile`)
      .pipe(
        tap(res => this._currentUser$.next(res)),
        catchError(err => this.error(err))
      )
  }

  getUser(){
    return this._currentUser$.value;
  }
}