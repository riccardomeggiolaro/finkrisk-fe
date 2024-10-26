import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs"
import { FileFilters } from '../../../services/drive-drive.service';

@Injectable({ providedIn: 'root' })
export class FiltersResolver implements Resolve<FileFilters> {
  constructor() {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<FileFilters> {
    // Chiamata al servizio con i filtri dalla query params
    return of(route.queryParams);
  }
}