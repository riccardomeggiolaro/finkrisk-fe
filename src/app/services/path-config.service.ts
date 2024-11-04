// app/services/path-config.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PathConfigService {
  private _basePath: 'finrisk' | 'finbil' = 'finrisk';

  constructor(private router: Router) {
      // Opzionale: recupera da localStorage
      const savedPath = localStorage.getItem('basePath') as 'finrisk' | 'finbil';
      if (savedPath) {
          this._basePath = savedPath;
      }
  }

  get basePath(): string {
      return this._basePath;
  }

  setBasePath(path: 'finrisk' | 'finbil') {
    console.log(path)
    this._basePath = path;
      localStorage.setItem('basePath', path);
      const currentUrl = this.router.url;
      const newUrl = currentUrl.replace(
          /\/(finrisk|finbil)/,
          `/${path}`
      );
      this.router.navigateByUrl(newUrl);
  }
}