import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { CustomDateFormatPipe } from '../../pipes/custom-date-format.pipe';
import { MatRadioModule } from '@angular/material/radio';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { defer, map, merge, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { DriveService, File, FileFilters } from '../../services/drive-drive.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { Dialog } from '@angular/cdk/dialog';
import { FileUploadComponent } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    NgClass,
    CustomDateFormatPipe,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    CustomDateFormatPipe,
    MatProgressBarModule,
    MatMenuModule,
    MatButtonModule,
    NgIf,
    MatSortModule,
    FileUploadComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  showUnderLine = false;
  lastScrollTop = 0;
  navbarHeight = 0;

  displayedColumns: string[] = ['name', 'date', 'elaborated', 'actions'];
  filtersForm = this.formBuilder.group({
    name: '',
    status: 'all' as 'all' | 'only-elaborated' | 'no-elaborated'
  });
  
  private destroyed$ = new Subject<void>();

  files$: Observable<File[]> = this.driveService.files$
    .pipe(
      takeUntil(this.destroyed$)
    );

  onLoadProgress = signal(false);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private elementRef: ElementRef,
    private dialog: Dialog,
    private driveService: DriveService
  ) {}

  ngOnInit(): void {
    // Creazione di un observable differito per i parametri iniziali
    const initialParams$ = defer(() => 
      this.activatedRoute.queryParams
        .pipe(
          take(1),
          tap(value => {
            this.filtersForm.patchValue(value, { emitEvent: false });
          })
        )
    );

    // Combiniamo i due stream
    merge(initialParams$, this.filtersForm.valueChanges)
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(filters => {
        this.router.navigate([], {
          queryParams: filters,
          queryParamsHandling: 'merge'
        });
        this.driveService.updateFilters(filters as FileFilters);
      });
  }

  ngAfterViewInit() {
    this.updateNavbarHeight();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // Update navbar height when window is resized
  @HostListener('window:resize', [])
  onWindowResize() {
    this.updateNavbarHeight();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > this.navbarHeight) {
      // Scrolling down
      this.showUnderLine = true;
    } else {
      // Scrolling up
      this.showUnderLine = false;
    }

    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative values
  }

  updateNavbarHeight() {
    const navbarElement = this.elementRef.nativeElement.querySelector('mat-toolbar');
    this.navbarHeight = navbarElement?.offsetHeight || 0; // Ensure safety in case the element is not found
  }

  uploadFile() {
    this.dialog.open(FileUploadComponent, {
      width: '550px',
      disableClose: false
    });
  }

  downloadFile(id: string) {
    this.driveService.download(id);
  }

  deleteFile(id: string) {
    this.driveService.delete(id);
  }
}