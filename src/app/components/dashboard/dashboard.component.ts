import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { CustomDateFormatPipe } from '../../pipes/custom-date-format.pipe';
import {MatRadioModule} from '@angular/material/radio';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, take, takeUntil } from 'rxjs';
import { File } from '../../services/google-drive.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';

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
    MatSortModule
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

  files$ = new MatTableDataSource<File[]>([]);

  onLoadProgress = signal(false);

  private destroyed$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Carica i filtri nel form nel momento dell'inizializzazione della pagina
    this.activatedRoute.data
      .pipe(
        take(1)
      )
      .subscribe((value) => {
        this.filtersForm.patchValue(value["filters"]);
      })

    // Carica i file dal resolver
    this.activatedRoute.data
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe((value) => {
        this.files$.data = value["files"];
      });

    // Carica i filtri nuovi nelle query params dell'url
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroyed$)
      )
      .subscribe(filters => {
        this.router.navigate([], {
          queryParams: filters,
          queryParamsHandling: 'merge'
        });
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
}