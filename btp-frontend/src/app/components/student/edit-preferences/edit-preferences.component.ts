import {animate, state, style, transition, trigger} from '@angular/animations';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableDataSource} from '@angular/material/table';
import {from, Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {ProjectsService} from 'src/app/services/projects/projects.service';
import {LoaderComponent} from 'src/app/components/shared/loader/loader.component';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';

@Component({
    selector: 'app-edit-preferences',
    templateUrl: './edit-preferences.component.html',
    styleUrls: ['./edit-preferences.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed, void', style({
                height: '0px',
                minHeight: '0',
                display: 'flex'
            })),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
            transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])
    ]
})
export class EditPreferencesComponent implements OnInit {
    @Input() preferences: any = new MatTableDataSource([]);
    @Input() stage = 0;
    projects: any = [];
    expandedElement;
    disable: boolean;
    tableStyle;
    height: number = window.innerHeight;
    isActive = false;
    indexHover = -1;
    displayedColumns = [
        'Title',
        'Faculty',
        'Intake',
        'Actions',
        'Submit'
    ];
    dialogRefLoad: MatDialogRef<any>;

    constructor(
        private projectService: ProjectsService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
    }

    closeDialog = finalize(() => this.dialogRefLoad.close());

    ngOnInit() {
        this.tableStyle = {'max-height.px': this.height - 64};
    }

    @HostListener('window:resize', ['$event']) onResize(event) {
        this.height = event.target.innerHeight;
    }

    onSubmit() {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Saving preferences, Please wait ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        this.projectService
            .storeStudentPreferences(this.preferences.data)
            .pipe(this.closeDialog)
            .subscribe((responseAPI: HttpResponseAPI) => {
                if (responseAPI.result.updated) {
                    this.preferences.data = responseAPI.result.preferences;
                }
                this.snackBar.open(responseAPI.message, 'OK');
            });
    }

    removeOnePreference(preference) {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Removing Preference, Please wait ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        this.projectService
            .removeOneStudentPreference(preference)
            .pipe(this.closeDialog)
            .subscribe((responseAPI: HttpResponseAPI) => {
                if (responseAPI.result.updated) {
                    this.preferences.data = this.preferences.data.filter((val) => {
                        return val._id !== preference._id;
                    });
                } else {
                    this.snackBar.open(responseAPI.message, 'Ok');
                }
            });
    }

    moveToTop(preference) {
        this.preferences.data = this.preferences.data.filter((val) => {
            return val._id !== preference._id;
        });
        this.preferences.data.unshift(preference);
        this.preferences.data = [...this.preferences.data];
    }

    moveToBottom(preference) {
        this.preferences.data = this.preferences.data.filter((val) => {
            return val._id !== preference._id;
        });
        this.preferences.data.push(preference);
        this.preferences.data = [...this.preferences.data];
    }

    moveOneUp(project) {
        if (project === 0) {
            return;
        }
        moveItemInArray(this.preferences.data, project, project - 1);
        this.preferences.data = [...this.preferences.data];
    }

    moveOneDown(project) {
        if (project === this.preferences.data.length - 1) {
            return;
        }
        moveItemInArray(this.preferences.data, project, project + 1);
        this.preferences.data = [...this.preferences.data];
    }

    drop(event: CdkDragDrop<any[]>) {
        const previousIndex = this.preferences.data.indexOf(event.item.data);
        moveItemInArray(event.container.data, previousIndex, event.currentIndex);
        this.preferences = new MatTableDataSource(event.container.data);
    }
}
