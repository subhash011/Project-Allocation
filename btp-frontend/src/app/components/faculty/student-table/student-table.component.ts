import {MatSnackBar} from '@angular/material/snack-bar';
import {ProjectsService} from 'src/app/services/projects/projects.service';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    Pipe,
    PipeTransform,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatDialog} from '@angular/material/dialog';
import {LoaderComponent} from 'src/app/components/shared/loader/loader.component';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';
import {finalize} from 'rxjs/operators';

@Pipe({
    name: 'preference'
})
export class PreferencePipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {
        const studentList = args[2];
        const studentId = args[1];
        const projectId = args[0];
        for (const student of studentList) {
            if (student._id === studentId) {
                const index = student.projects_preference.indexOf(projectId);
                student.index = index;
                if (index === -1) {
                    return 'N/A';
                }
                if (index > 2) {
                    return '>3';
                }
                return index + 1;
            }
        }
    }
}

@Pipe({
    name: 'getDisplayedColumns'
})
export class GetDisplayedColumns implements PipeTransform {
    transform(index) {
        const preferred = [
            'Name', 'CGPA', 'Roll', 'Index', 'Actions'
        ];
        const notPreferred = [
            'Name', 'CGPA', 'Roll', 'Index', 'Actions'
        ];
        return index === 0 ? preferred : notPreferred;
    }
}

@Component({
    selector: 'app-student-table',
    templateUrl: './student-table.component.html',
    styleUrls: ['./student-table.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({
                height: '0px',
                minHeight: '0',
                display: 'none'
            })),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('0ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])
    ]
})
export class StudentTableComponent implements OnInit, OnChanges {
    @ViewChild('table') table: MatTable<any>;
    @Input() public studentList;
    @Input() public project;
    @Input() public adminStage;
    @Input() public index;
    @Input() public reorder;
    @Output() newReorder = new EventEmitter<any>();
    public fields = [
        'Name', 'CGPA', 'Roll', 'Index', 'Actions'
    ];
    students: MatTableDataSource<any>;
    nonStudents: MatTableDataSource<any>;
    expandedElement: any;
    studentTableHeight: number = 48 * 11;
    dialogRefLoad: any;

    constructor(
        private projectService: ProjectsService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private cdRef: ChangeDetectorRef
    ) {
    }

    closeDialog = finalize(() => this.dialogRefLoad.close());

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (simpleChanges.studentList) {
            this.students = new MatTableDataSource(this.studentList);
            this.cdRef.detectChanges();
        }
    }

    ngOnInit() {
        this.students = new MatTableDataSource(this.studentList);
    }

    onSubmit() {
        if (this.adminStage === 2) {
            this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                data: 'Updating, Please wait ...',
                disableClose: true,
                panelClass: 'transparent'
            });
            this.projectService
                .savePreference(this.students.data, this.project._id, this.project.stream, this.index, this.reorder)
                .pipe(this.closeDialog)
                .subscribe((responseAPI: HttpResponseAPI) => {
                    if (responseAPI.result.updated) {
                        this.reorder = responseAPI.result.reorder;
                        this.newReorder.emit([
                            this.reorder, this.project._id, this.students.data, this.index
                        ]);
                    }
                    this.snackBar.open(responseAPI.message, 'Ok');
                }, () => {
                    this.ngOnInit();
                    this.snackBar.open('Some Error Occurred! Try again later.', 'OK');
                });
        } else {
            if (this.adminStage < 2) {
                this.studentList.sort((a, b) => {
                    return b.gpa - a.gpa;
                });
                this.snackBar.open('Preferences can be edited only in the further stages.', 'Ok');
            } else {
                this.snackBar.open('You cannot edit preferences anymore', 'Ok');
            }
        }
    }

    drop(event: CdkDragDrop<string[]>) {
        const previousIndex = this.students.data.findIndex((row) => row === event.item.data);
        moveItemInArray(this.students.data, previousIndex, event.currentIndex);
        this.students.data = [...this.students.data];
    }

    moveToTop(student) {
        if (this.checkAdminStage()) {
            return;
        }
        this.students.data = this.students.data.filter((val) => {
            return val._id !== student._id;
        });
        this.students.data.unshift(student);
        this.students.data = [...this.students.data];
    }

    moveToBottom(project) {
        if (this.checkAdminStage()) {
            return;
        }
        this.students.data = this.students.data.filter((val) => {
            return val._id !== project._id;
        });
        this.students.data.push(project);
        this.students.data = [...this.students.data];
    }

    moveOneUp(index) {
        if (this.checkAdminStage()) {
            return;
        }
        if (index === 0) {
            return;
        }
        moveItemInArray(this.students.data, index, index - 1);
        this.students.data = [...this.students.data];
    }

    moveOneDown(index) {
        if (this.checkAdminStage()) {
            return;
        }
        if (index === this.students.data.length - 1) {
            return;
        }
        moveItemInArray(this.students.data, index, index + 1);
        this.students.data = [...this.students.data];
    }

    checkAdminStage() {
        return this.adminStage !== 2;
    }

    sortStudentTable(event) {
        const isAsc = event.direction === 'asc';
        this.students.data = this.students.data.sort((a, b) => {
            switch (event.active) {
                case 'Name':
                    return this.compare(a.name, b.name, isAsc);
                case 'CGPA':
                    return this.compare(a.gpa, b.gpa, isAsc);
                case 'Roll':
                    return this.compare(a.roll_no, b.roll_no, isAsc);
                case 'Index':
                    return this.compare(a.index, b.index, isAsc);
                default:
                    return 0;
            }
        });
    }

    compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
        return (a < b ? -1 : 1
        ) * (isAsc ? 1 : -1
        );
    }
}
