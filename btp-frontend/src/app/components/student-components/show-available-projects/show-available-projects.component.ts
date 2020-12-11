import { animate, state, style, transition, trigger, } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, HostListener, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild, } from '@angular/core';
import { MatDialog, MatSnackBar, MatTable, MatTableDataSource, } from '@angular/material';
import { Router } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectsService } from 'src/app/services/projects/projects.service';
import { UserService } from 'src/app/services/user/user.service';
import { LoaderComponent } from 'src/app/components/shared/loader/loader.component';
import { LoginComponent } from 'src/app/components/shared/login/login.component';
import { NavbarComponent } from 'src/app/components/shared/navbar/navbar.component';

@Pipe({
    name: 'isPreferenceEdit',
})
export class IsPreferenceEdit implements PipeTransform {
    transform(value: string) {
        return value.includes('preferences');
    }
}

@Component({
    selector: 'app-show-available-projects',
    templateUrl: './show-available-projects.component.html',
    styleUrls: ['./show-available-projects.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition(
                'expanded <=> collapsed',
                animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
            ),
        ]),
        trigger('openClose', [
            state('open', style({width: '40%'})),
            state('close', style({width: '0px'})),
            state('fullOpen', style({width: '100%'})),
            transition('*<=>close', [
                animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
            ]),
            transition('fullOpen=>open', [
                animate('225ms ease-in')
            ])
        ])
    ],
})
export class ShowAvailableProjectsComponent implements OnInit, OnDestroy {
    @ViewChild('table') table: MatTable<any>;
    preferences: any = new MatTableDataSource([]);
    projects = new MatTableDataSource([]);
    expandedElement;
    tableHeight: number = window.innerHeight * 0.65;
    stage = 0;
    sidenavMaxWith = 40;
    sidenavWidth: number = this.sidenavMaxWith;
    isActive: boolean = false;
    indexHover: number = -1;
    showToggleOnSidenav: boolean = false;
    selection = new SelectionModel<any>(true, []);
    displayedColumns = [
        'select',
        'Title',
        'Faculty',
        'Intake',
        'Duration',
        'Email',
        'Actions',
    ];
    dialogRefLoad;
    private ngUnsubscribe: Subject<any> = new Subject();

    constructor(
        private dialog: MatDialog,
        private projectService: ProjectsService,
        private loginObject: LoginComponent,
        private snackBar: MatSnackBar,
        private loadingBar: LoadingBarService,
        public router: Router,
        private userService: UserService,
        private navbar: NavbarComponent
    ) {
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.tableHeight = event.target.innerHeight * 0.65;
        const width = event.target.innerWidth;
        if (width <= 1300) {
            this.showToggleOnSidenav = true;
            this.sidenavWidth = 100;
        } else {
            this.showToggleOnSidenav = false;
            this.sidenavWidth = this.sidenavMaxWith;
        }
        if (event.target.innerHeight <= 600) {
            this.tableHeight = event.target.innerHeight * 0.5;
        }
    }

    ngOnInit() {
        if (window.innerWidth <= 1300) {
            this.showToggleOnSidenav = true;
            this.sidenavWidth = 100;
        } else {
            this.showToggleOnSidenav = false;
            this.sidenavWidth = this.sidenavMaxWith;
        }
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Loading. Please wait! ...',
            disableClose: true,
            hasBackdrop: true,
        });
        if (this.isPrefenceEdit()) {
            this.preferences.data = [];
            this.projectService
                .getStudentPreference()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                    (result) => {
                        this.dialogRefLoad.close();
                        if (result && result['message'] == 'success') {
                            this.preferences.data = result['result'];
                        } else if (result['message'] == 'invalid-token') {
                            this.loginObject.isLoggedIn = false;
                            this.navbar.role = 'none';
                            this.snackBar.open(
                                'Session Expired! Please Sign In Again',
                                'OK',
                                {
                                    duration: 3000,
                                }
                            );
                            this.loginObject.signOut();
                            return null;
                        }
                    },
                    () => {
                        this.dialogRefLoad.close();
                        this.snackBar.open(
                            'Some Error Occured! Please re-authenticate.',
                            'OK',
                            {
                                duration: 3000,
                            }
                        );
                        this.navbar.role = 'none';
                        this.loginObject.signOut();
                    }
                );
            return;
        } else {
            this.preferences.data = [];
            this.projects.data = [];
            this.getAllStudentPreferences();
        }
        this.userService
            .getStreamStage()
            .toPromise()
            .then((result) => {
                if (result['message'] == 'success') {
                    this.stage = result['result'];
                }
            });
    }

    isPrefenceEdit() {
        return this.router.url.includes('preferences');
    }

    getAllStudentPreferences() {
        let tempArray: any;
        let tempPref: any;
        this.projectService
            .getStudentPreference()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (result) => {
                    this.dialogRefLoad.close();
                    if (result['message'] == 'invalid-token') {
                        this.loginObject.isLoggedIn = false;
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'OK', {
                            duration: 3000,
                        });
                        this.loginObject.signOut();
                        return null;
                    } else if (result && result['message'] == 'success') {
                        this.preferences.data = result['result'];
                        tempPref = this.preferences.data.map((val) => val._id);
                        this.projectService
                            .getAllStudentProjects()
                            .pipe(takeUntil(this.ngUnsubscribe))
                            .subscribe((projects) => {
                                if (
                                    projects['message'] == 'invalid-client' ||
                                    projects['message'] == 'invalid-token'
                                ) {
                                    this.navbar.role = 'none';
                                    this.snackBar.open(
                                        'Session Expired! Please Sign In Again',
                                        'OK',
                                        {
                                            duration: 3000,
                                        }
                                    );
                                    this.loginObject.signOut();
                                }
                                tempArray = projects['result'];
                                for (const project of tempArray) {
                                    if (!tempPref.includes(project._id)) {
                                        this.projects.data.push(project);
                                    }
                                }
                                this.projects = new MatTableDataSource(this.projects.data);
                                this.projects.filterPredicate = (data: any, filter: string) =>
                                    !filter ||
                                    data.faculty_name.toLowerCase().includes(filter) ||
                                    data.title.toLowerCase().includes(filter) ||
                                    data.description.toLowerCase().includes(filter) ||
                                    data.faculty_email.toLowerCase().includes(filter);
                                this.loadingBar.stop();
                            });
                    }
                },
                () => {
                    this.dialogRefLoad.close();
                    this.snackBar.open(
                        'Some Error Occured! Please re-authenticate',
                        'OK',
                        {
                            duration: 3000,
                        }
                    );
                    this.navbar.role = 'none';
                    this.loginObject.signOut();
                }
            );
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.projects.filter = filterValue.trim().toLowerCase();
        this.changeSelection();
    }

    isAnyOneSelected() {
        let filteredProjects = this.projects.filteredData.map(val => val._id);
        const numSelected = this.selection.selected
            ? this.selection.selected.filter(val => filteredProjects.includes(val._id)).length
            : 0;
        return numSelected != 0;
    }

    changeSelection() {
        let unfilteredData = this.projects.data
            .filter((val) => !this.projects.filteredData.includes(val))
            .map((val) => val._id);
        this.projects.filteredData.forEach((val) => {
            if (unfilteredData.includes(val._id)) {
                this.deselectProject(val);
            }
        });
    }

    isAllSelected() {
        let filteredProjects = this.projects.filteredData.map(val => val._id);
        const numSelected = this.selection.selected
            ? this.selection.selected.filter(val => filteredProjects.includes(val._id)).length
            : 0;
        const numRows = this.projects.filteredData
            ? this.projects.filteredData.length
            : 0;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.projects.filteredData.forEach((row) => this.selection.select(row));
    }

    deselectAll() {
        this.selection.clear();
    }

    deselectProject(project) {
        this.selection.deselect(project);
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row): string {
        if (!row) {
            return `${ this.isAllSelected() ? 'select' : 'deselect' } all`;
        }
        return `${ this.selection.isSelected(row) ? 'deselect' : 'select' } row ${
            row.position + 1
        }`;
    }

    addOnePreference(project) {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Adding Preference, Please wait ...',
            disableClose: true,
            hasBackdrop: true,
        });
        this.projectService
            .addOneStudentPreference(project)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (result) => {
                    dialogRefLoad.close();
                    if (result['message'] == 'invalid-token') {
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'OK', {
                            duration: 3000,
                        });
                        this.loginObject.signOut();
                    } else if (result['message'] == 'success') {
                        this.projects.data = this.projects.data.filter((val) => {
                            return val._id != project._id;
                        });
                        this.preferences.data.push(project);
                        this.preferences.data = [...this.preferences.data];
                        this.deselectProject(project);
                    } else if (result['message'] == 'stage-ended') {
                        this.snackBar.open(
                            'Stage has ended! You cannot edit preferences anymore',
                            'Ok',
                            {
                                duration: 3000,
                            }
                        );
                    } else if (result['message'] == 'stage-not-started') {
                        this.snackBar.open(
                            'You cannot edit preferences till the next stage',
                            'Ok',
                            {duration: 3000}
                        );
                    }
                },
                () => {
                    dialogRefLoad.close();
                    this.snackBar.open(
                        'Some Error Occured! Please re-authenticate.',
                        'OK',
                        {
                            duration: 3000,
                        }
                    );
                    this.navbar.role = 'none';
                    this.loginObject.signOut();
                }
            );
    }

    onSubmit(event) {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Adding to preferences, Please wait ...',
            disableClose: true,
            hasBackdrop: true,
        });
        const preference = this.selection.selected;
        this.projectService
            .appendStudentPreferences(preference)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (result) => {
                    dialogRefLoad.close();
                    const message = result['message'];
                    this.deselectAll();
                    if (message == 'success') {
                        this.preferences.data = [...this.preferences.data, ...preference];
                        const preferenceId = preference.map((val) => val._id);
                        this.projects.data = this.projects.data.filter((val) => {
                            return preferenceId.indexOf(val._id) == -1;
                        });
                        this.snackBar.open('Added to preferences', 'OK', {
                            duration: 3000,
                        });
                    } else if (message == 'invalid-token') {
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'OK', {
                            duration: 3000,
                            panelClass: ['success-snackbar'],
                        });
                        this.loginObject.signOut();
                    } else if (message == 'stage-ended') {
                        this.snackBar.open(
                            'Stage has ended! You cannot edit preferences anymore',
                            'Ok',
                            {duration: 3000}
                        );
                    } else if (result['message'] == 'stage-not-started') {
                        this.snackBar.open(
                            'You cannot edit preferences till the next stage',
                            'Ok',
                            {duration: 3000}
                        );
                    } else {
                        this.snackBar.open('Some Error Occured! Try again later.', 'OK', {
                            duration: 3000,
                        });
                    }
                },
                () => {
                    dialogRefLoad.close();
                    this.snackBar.open(
                        'Some Error Occured! Please re-authenticate.',
                        'OK',
                        {
                            duration: 3000,
                        }
                    );
                    this.navbar.role = 'none';
                    this.loginObject.signOut();
                }
            );
    }

    updateProjects(event) {
        this.projects.data.push(event);
        this.preferences.data = this.preferences.data.filter((val) => {
            return val._id != event._id;
        });
        this.expandedElement = null;
        this.table.renderRows();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
