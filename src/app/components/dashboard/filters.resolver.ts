import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { DriveService, FileFilters } from "../../services/drive-drive.service";

@Injectable({ 
  providedIn: 'root'
})
export class FiltersResolver implements Resolve<void> {
  constructor(private driveService: DriveService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): void {
    const filters: FileFilters = {
      name: route.queryParams['name'] || null,
      status: route.queryParams['status'] || 'all'
    };

    // Chiamata al servizio con i filtri dalla query params
    this.driveService.updateFilters(filters);
  }
}