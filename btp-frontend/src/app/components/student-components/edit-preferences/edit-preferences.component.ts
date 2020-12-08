import { animate, state, style, transition, trigger, } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostListener, Input, OnDestroy, OnInit, } from '@angular/core';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectsService } from 'src/app/services/projects/projects.service';
import { LoaderComponent } from 'src/app/components/shared/loader/loader.component';
import { LoginComponent } from 'src/app/components/shared/login/login.component';
import { NavbarComponent } from 'src/app/components/shared/navbar/navbar.component';

@Component({
    selector: 'app-edit-preferences',
    templateUrl: './edit-preferences.component.html',
    styleUrls: ['./edit-preferences.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed, void', style({height: '0px', minHeight: '0', display: 'flex'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
            transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])
    ],
})
export class EditPreferencesComponent implements OnInit, OnDestroy {
    @Input() preferences: any = new MatTableDataSource([]);
    @Input() stage: number = 0;
    projects: any = [];
    expandedElement;
    disable: boolean;
    tableStyle;
    height: number = window.innerHeight;
    displayedColumns = [
        'Title',
        'Faculty',
        'Email',
        'Intake',
        'Duration',
        'Actions',
        'Submit',
    ];
    private ngUnsubscribe: Subject<any> = new Subject();

    constructor(
        private projectService: ProjectsService,
        private loginObject: LoginComponent,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private navbar: NavbarComponent
    ) {
    }
    ngOnInit() {
        this.tableStyle = {
            'max-height.px': this.height - 64,
        };
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.height = event.target.innerHeight;
    }

    onSubmit() {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Saving preferences, Please wait ...',
            disableClose: true,
            hasBackdrop: true,
        });
        this.projectService
            .storeStudentPreferences(this.preferences.data)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (result) => {
                    dialogRefLoad.close();
                    if (result['message'] == 'success') {
                        this.preferences.data = result['result'];
                        this.snackBar.open('Preferences Saved Successfully', 'OK', {
                            duration: 3000,
                        });
                    } else if (result['message'] == 'invalid-token') {
                        this.disable = false;
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'OK', {
                            duration: 3000,
                        });
                        this.loginObject.signOut();
                    } else if (result['message'] == 'stage-ended') {
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
                        this.disable = false;
                        this.snackBar.open(
                            'Some Error Occured! If the Error Persists Please re-authenticate',
                            'OK',
                            {
                                duration: 3000,
                            }
                        );
                    }
                },
                () => {
                    dialogRefLoad.close();
                    this.snackBar.open(
                        'Some Error Occured! If the Error Persists Please re-authenticate',
                        'OK',
                        {
                            duration: 3000,
                        }
                    );
                }
            );
    }

    moveToTop(preference) {
        this.preferences.data = this.preferences.data.filter((val) => {
            return val._id != preference._id;
        });
        this.preferences.data.unshift(preference);
        this.preferences.data = [...this.preferences.data];
    }

    moveToBottom(preference) {
        this.preferences.data = this.preferences.data.filter((val) => {
            return val._id != preference._id;
        });
        this.preferences.data.push(preference);
        this.preferences.data = [...this.preferences.data];
    }

    removePreference(preference) {
        const dialogRef = this.dialog.open(LoaderComponent, {
            data: 'Please wait ....',
            disableClose: true,
            hasBackdrop: true,
        });
        this.projectService
            .removeOneStudentPreference(preference)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (result) => {
                    dialogRef.close();
                    if (result['message'] == 'invalid-token') {
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'OK', {
                            duration: 3000,
                        });
                        this.loginObject.signOut();
                    } else if (result['message'] == 'stage-ended') {
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
                    } else if (result['message'] == 'success') {
                        this.preferences.data = this.preferences.data.filter((val) => {
                            return val._id != preference._id;
                        });
                    }
                },
                () => {
                    dialogRef.close();
                    this.snackBar.open(
                        'Some Error Occured! If the Error Persists Please re-authenticate',
                        'OK',
                        {
                            duration: 3000,
                        }
                    );
                }
            );
    }

    drop(event: CdkDragDrop<any[]>) {
        const previousIndex = this.preferences.data.indexOf(event.item.data);
        moveItemInArray(event.container.data, previousIndex, event.currentIndex);
        this.preferences = new MatTableDataSource(event.container.data);
    }

    moveOneUp(project) {
        if (project == 0) {
            return;
        }
        moveItemInArray(this.preferences.data, project, project - 1);
        this.preferences.data = [...this.preferences.data];
    }

    moveOneDown(project) {
        if (project == this.preferences.data.length - 1) {
            return;
        }
        moveItemInArray(this.preferences.data, project, project + 1);
        this.preferences.data = [...this.preferences.data];
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
