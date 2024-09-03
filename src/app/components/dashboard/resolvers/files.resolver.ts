import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { DriveService, File } from '../../../services/google-drive.service';
import { FileFilters } from '../../../services/google-drive.service';

@Injectable({ providedIn: 'root' })
export class FilesResolver implements Resolve<File[]> {
  constructor(private driveService: DriveService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<File[]> {
    const filters: FileFilters = {
      name: route.queryParams['name'] || null,
      status: route.queryParams['status'] || 'all'
    };

    // Chiamata al servizio con i filtri dalla query params
    return this.driveService.list(filters)
  }
}