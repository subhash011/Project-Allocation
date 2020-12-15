import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, HostListener, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectsService } from 'src/app/services/projects/projects.service';
import { UserService } from 'src/app/services/user/user.service';
import { LoaderComponent } from 'src/app/components/shared/loader/loader.component';
import { HttpResponseAPI } from 'src/app/models/HttpResponseAPI';
import { LocalAuthService } from 'src/app/services/local-auth/local-auth.service';

@Pipe({
    name: 'isPreferenceEdit'
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
            )
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
    ]
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
        'Email',
        'Actions'
    ];
    dialogRefLoad: MatDialogRef<any>;
    private ngUnsubscribe: Subject<any> = new Subject();

    constructor(
        private dialog: MatDialog,
        private projectService: ProjectsService,
        private localAuthService: LocalAuthService,
        private snackBar: MatSnackBar,
        public router: Router,
        private userService: UserService
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
        this.getAllDetailsStudent();
    }

    getAllDetailsStudent() {
        const requests = [
            this.projectService.getStudentPreference().pipe(takeUntil(this.ngUnsubscribe)),
            this.projectService.getNotStudentPreferences().pipe(takeUntil(this.ngUnsubscribe)),
            this.userService.getStreamStage().pipe(takeUntil(this.ngUnsubscribe))
        ];
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Loading, Please wait! ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        forkJoin(requests).subscribe((response: Array<HttpResponseAPI>) => {
                let optedResponse: HttpResponseAPI = response[0];
                let notOptedResponse: HttpResponseAPI = response[1];
                let stageResponse: HttpResponseAPI = response[2];
                this.dialogRefLoad.close();
                this.stage = stageResponse.result.adminPresent ? stageResponse.result.stage : 0;
                this.preferences.data = optedResponse.result.preferences;
                this.projects.data = notOptedResponse.result.not_preferences;
                this.projects.filterPredicate = (data: any, filter: string) =>
                    !filter ||
                    data.faculty_name.toLowerCase().includes(filter) ||
                    data.title.toLowerCase().includes(filter) ||
                    data.description.toLowerCase().includes(filter) ||
                    data.faculty_email.toLowerCase().includes(filter);
            },
            () => {
                this.dialogRefLoad.close();
            });
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
            panelClass: 'transparent'
        });
        this.projectService
            .addOneStudentPreference(project)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (responseAPI: HttpResponseAPI) => {
                    dialogRefLoad.close();
                    if (responseAPI.result.updated) {
                        this.projects.data = this.projects.data.filter((val) => {
                            return val._id != project._id;
                        });
                        this.preferences.data.push(project);
                        this.preferences.data = [...this.preferences.data];
                        this.deselectProject(project);
                    } else {
                        this.snackBar.open(responseAPI.message, 'OK');
                    }
                },
                () => {
                    this.dialogRefLoad.close();
                }
            );
    }

    onSubmit(event) {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Adding to preferences, Please wait ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        const preference = this.selection.selected;
        this.projectService
            .appendStudentPreferences(preference)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (responseAPI: HttpResponseAPI) => {
                    dialogRefLoad.close();
                    this.deselectAll();
                    if (responseAPI.result.updated) {
                        this.preferences.data = [...this.preferences.data, ...preference];
                        const preferenceId = preference.map((val) => val._id);
                        this.projects.data = this.projects.data.filter((val) => {
                            return preferenceId.indexOf(val._id) == -1;
                        });
                        this.snackBar.open(responseAPI.message, 'OK');
                    } else {
                        this.snackBar.open(responseAPI.message, 'Ok');
                    }
                },
                () => {
                    this.dialogRefLoad.close();
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
