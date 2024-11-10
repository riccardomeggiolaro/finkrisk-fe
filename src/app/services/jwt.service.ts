import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class JwtService {
  getLastPath(): string {
    return location.pathname.split('/')[1] || '';
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  getToken(): string {
    // Get the current URL
    const currentUrl = this.getLastPath();

    // Check if the URL contains specific keywords and return the appropriate token
    if (currentUrl.toLowerCase().includes('finrisk')) {
      return localStorage.getItem('authTokenFinrisk') || '';
    } else if (currentUrl.toLowerCase().includes('finbil')) {
      return localStorage.getItem('authTokenFinbil') || '';
    }
    return '';
  }

  setToken(token: string): void {
    // Get the current URL
    const currentUrl = this.getLastPath();

    // Check if the URL contains specific keywords and return the appropriate token
    if (currentUrl.toLowerCase().includes('finrisk')) {
      localStorage.setItem('authTokenFinrisk', token);
    } else if (currentUrl.toLowerCase().includes('finbil')) {
      localStorage.setItem('authTokenFinbil', token);
    }
  }

  removeToken(): void {
    const currentUrl = this.getLastPath();

    // Check if the URL contains specific keywords and return the appropriate token
    if (currentUrl.toLowerCase().includes('finrisk')) {
      localStorage.removeItem('authTokenFinrisk');
    } else if (currentUrl.toLowerCase().includes('finbil')) {
      localStorage.removeItem('authTokenFinbil');
    }
  }
}