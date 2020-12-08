import { AddMapComponent } from 'src/app/components/shared/add-map/add-map.component';
import { LoginComponent } from 'src/app/components/shared/login/login.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeletePopUpComponent } from 'src/app/components/faculty-componenets/delete-pop-up/delete-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user/user.service';
import { Component, HostListener, OnInit, Pipe, PipeTransform, ViewChild, } from '@angular/core';
import { LoaderComponent } from 'src/app/components/shared/loader/loader.component';
import { MatTable, MatTableDataSource } from '@angular/material';
import { NavbarComponent } from 'src/app/components/shared/navbar/navbar.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Pipe({
    name: 'getRegisteredCount',
})
export class GetRegisteredCount implements PipeTransform {
    transform(students) {
        let registered = 0;
        let total = 0;
        students.forEach((student) => {
            total++;
            registered += student.isRegistered ? 1 : 0;
        });
        return registered;
    }
}

@Pipe({
    name: 'getToolTipToRemoveFaculty',
})
export class FacultyTooltipSuper implements PipeTransform {
    transform(isAdmin, adminProgram, branch) {
        if (isAdmin) {
            if (adminProgram == branch) {
                return 'Remove co-ordinator Status to delete the faculty';
            } else {
                return (
                    'This faculty is a co-ordinator for ' +
                    adminProgram +
                    ' please remove the co-ordinator status to remove the faculty'
                );
            }
        } else {
            return '';
        }
    }
}

@Component({
    selector: 'app-super-admin',
    templateUrl: './super-admin.component.html',
    styleUrls: ['./super-admin.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed, void', style({height: '0px', minHeight: '0', display: 'flex'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
            transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])
    ],
    providers: [LoginComponent],
})
export class SuperAdminComponent implements OnInit {
    @ViewChild('table', {static: false}) table: MatTable<any>;
    dialogRefLoad: any;
    index = 0;
    background = 'primary';
    projects: any = {};
    displayedColumnsFaculty: string[] = [
        'Name',
        'Stream',
        'Email-ID',
        'isAdmin',
        'Actions',
    ];
    displayedColumnsStudent: string[] = [
        'Name',
        'Stream',
        'Email-ID',
        'CGPA',
        'isRegistered',
        'Actions',
    ];
    displayedColumnsProjects: string[] = [
        'Title',
        'Faculty',
        'Stream',
        'NoOfStudents',
        'Duration',
    ];
    displayedColumnsMaps: string[] = [
        'Branch',
        'Short',
        'Stage',
        'FacCount',
        'StudCount',
        'ProjCount',
        'Actions',
    ];
    displayedColumnsStreams: string[] = ['Stream', 'Short', 'Actions'];
    faculties: any = {};
    students: any = {};
    faculty;
    project;
    tableHeight: number = window.innerHeight * 0.60;
    map;
    student;
    maps: any = [];
    branches: any = new MatTableDataSource([]);
    programs: any = new MatTableDataSource([]);
    hasAdmins = {};
    stages = {};
    expandedElement;
    isActive;
    indexHover;

    constructor(
        private userService: UserService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private login: LoginComponent,
        private navbar: NavbarComponent
    ) {
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (event.target.innerWidth <= 1400) {
            this.tableHeight = event.target.innerHeight * 0.60;
        } else {
            this.tableHeight = event.target.innerHeight * 0.60;
        }
    }

    ngOnInit() {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Loading. Please wait! ...',
            disableClose: true,
            hasBackdrop: true,
        });
        this.userService.getAllBranches().subscribe(
            (maps) => {
                if (maps['message'] == 'success') {
                    this.maps = maps['result'];
                    this.branches.data = this.maps.map((val) => {
                        return {
                            name: val.full,
                            short: val.short,
                        };
                    });
                } else {
                    this.snackBar.open(
                        'Some error occured! Please re-authenticate if the error persists',
                        'Ok',
                        {
                            duration: 3000,
                        }
                    );
                }
            },
            () => {
                this.dialogRefLoad.close();
                this.navbar.role = 'none';
                this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                    duration: 3000,
                });
                this.login.signOut();
            }
        );
        this.userService.getAllMaps().subscribe(
            (maps) => {
                this.maps = maps['result'];
                this.programs.data = this.maps.map((val) => {
                    return {
                        name: val.full,
                        short: val.short
                    };
                });
                for (const program of this.programs.data) {
                    this.faculties[program.short] = new MatTableDataSource([]);
                    this.students[program.short] = new MatTableDataSource([]);
                    this.projects[program.short] = new MatTableDataSource([]);
                }
                this.userService.getAllStudents().subscribe(
                    (result) => {
                        if (result['message'] == 'success') {
                            if (result['result'] == 'no-students') {
                                for (const branch of this.programs.data) {
                                    this.students[branch.short] = new MatTableDataSource([]);
                                }
                            } else {
                                for (const branch of this.programs.data) {
                                    this.students[branch.short] = new MatTableDataSource(
                                        result['result'][branch.short]
                                    );
                                    this.sortStudents(
                                        {direction: 'asc', active: 'Name'},
                                        branch
                                    );
                                    this.students[branch.short].filterPredicate = (
                                        data: any,
                                        filter: string
                                    ) =>
                                        !filter ||
                                        data.name.toLowerCase().includes(filter) ||
                                        data.roll_no.toLowerCase().includes(filter);
                                }
                            }
                        }
                    },
                    () => {
                        this.dialogRefLoad.close();
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                            duration: 3000,
                        });
                        this.login.signOut();
                    }
                );

                this.getAllProjects();

                this.userService.getAllAdminDetails().subscribe(admins => {
                    if (admins['message'] == 'success') {
                        admins = admins['result'];
                        for (const program in admins) {
                            if (admins.hasOwnProperty(program)) {
                                const element = admins[program];
                                if (element) {
                                    this.stages[program] = element.stage + (element.stage == 4 ? 0 : 1);
                                } else {
                                    this.stages[program] = null;
                                }
                            }
                        }
                    } else {
                        this.dialogRefLoad.close();
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                            duration: 3000,
                        });
                        this.login.signOut();
                    }
                });

                this.userService.getAllFaculties().subscribe(
                    (result) => {
                        this.dialogRefLoad.close();
                        if (result['message'] == 'success') {
                            if (result['result'] == 'no-faculties') {
                                for (const branch of this.programs.data) {
                                    this.faculties[branch.short] = new MatTableDataSource([]);
                                }
                            } else {
                                for (const branch of this.programs.data) {
                                    this.faculties[branch.short] = new MatTableDataSource(
                                        result['result'][branch.short]
                                    );
                                    this.sortFaculties(
                                        {direction: 'asc', active: 'Name'},
                                        branch
                                    );
                                    this.faculties[branch.short].filterPredicate = (
                                        data: any,
                                        filter: string
                                    ) =>
                                        !filter ||
                                        data.name.toLowerCase().includes(filter) ||
                                        data.stream.toLowerCase().includes(filter) ||
                                        data.email.toLowerCase().includes(filter);
                                    this.hasAdmins[branch.short] =
                                        this.faculties[branch.short].data.filter((val) => {
                                            return val.adminProgram &&
                                                (val.adminProgram == branch.short);

                                        }).length > 0;
                                }
                            }
                        } else if (result['message'] == 'invalid-token') {
                            this.dialogRefLoad.close();
                            this.navbar.role = 'none';
                            this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                                duration: 3000,
                            });
                            this.login.signOut();
                        }
                    },
                    () => {
                        this.dialogRefLoad.close();
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                            duration: 3000,
                        });
                        this.login.signOut();
                    }
                );
            },
            () => {
                this.dialogRefLoad.close();
                this.navbar.role = 'none';
                this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                    duration: 3000,
                });
                this.login.signOut();
            }
        );
    }

    getAllProjects() {
        const branches = this.programs.data;
        this.userService.getAllProjects().subscribe(
            (projects) => {
                if (projects['message'] == 'success') {
                    const project = projects['result'];
                    for (const branch of branches) {
                        const projectsTemp = project.filter((val) => {
                            return val.stream == branch.short;
                        });
                        this.projects[branch.short] = new MatTableDataSource(projectsTemp);
                        this.sortProjects({direction: 'asc', active: 'Title'}, branch);
                        this.projects[branch.short].filterPredicate = (
                            data: any,
                            filter: string
                        ) =>
                            !filter ||
                            data.faculty.toLowerCase().includes(filter) ||
                            data.title.toLowerCase().includes(filter) ||
                            data.description.toLowerCase().includes(filter);
                    }
                } else {
                    this.dialogRefLoad.close();
                    this.navbar.role = 'none';
                    this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                        duration: 3000,
                    });
                    this.login.signOut();
                }
            },
            () => {
                this.dialogRefLoad.close();
                this.navbar.role = 'none';
                this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                    duration: 3000,
                });
                this.login.signOut();
            }
        );
    }

    addPrograms() {
        let dialogRef = this.dialog.open(AddMapComponent, {
            width: '40%',
            data: {
                heading: 'Program',
                message: 'Are you sure you want to proceed to add program',
                add: 'program',
            },
            hasBackdrop: true,
        });
        dialogRef.afterClosed().subscribe((data) => {
            if (data && data['message'] == 'submit') {
                if (this.checkIfPresent('programFull', data.map.full) || this.checkIfPresent('programShort', data.map.short)) {
                    this.snackBar.open('Duplicate entries are not allowed! Enter a unique name for every field.', 'Ok', {
                        duration: 3000,
                        panelClass: 'custom-snack-bar-container'
                    });
                    return;
                }
                const dialogRef = this.dialog.open(LoaderComponent, {
                    data: 'Adding Program. Please wait ...',
                    disableClose: true,
                    hasBackdrop: true,
                });
                this.userService.setProgram(data['map']).subscribe((data) => {
                    dialogRef.close();
                    if (data['message'] == 'success') {
                        const val = data['result'];
                        const newMap = {
                            name: val.full,
                            short: val.short
                        };
                        this.programs.data.push(newMap);
                        this.programs.data = [...this.programs.data];
                        this.faculties[val.short] = new MatTableDataSource([]);
                        this.students[val.short] = new MatTableDataSource([]);
                        this.snackBar.open(
                            'Added Program Successfully',
                            'Ok',
                            {
                                duration: 3000,
                            }
                        );
                    } else if (data['message'] == 'invalid-token') {
                        this.dialogRefLoad.close();
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                            duration: 3000,
                        });
                        this.login.signOut();
                    } else {
                        this.snackBar.open(
                            'Some error occured! If error persists re-authenticate',
                            'Ok',
                            {
                                duration: 5000,
                            }
                        );
                    }
                });
            }
        });
    }

    deleteProgram(short) {
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: '200px',
            data: {
                heading: 'Confirm Deletion',
                message: 'Are you sure you want to remove the program',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result['message'] == 'submit') {
                const dialogRef = this.dialog.open(LoaderComponent, {
                    data: 'Removing Program, Please wait ...',
                    disableClose: true,
                    hasBackdrop: true,
                });

                this.userService.removeProgram(short).subscribe((result) => {
                    dialogRef.close();
                    if (result['message'] == 'invalid-token') {
                        this.dialogRefLoad.close();
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                            duration: 3000,
                        });
                        this.login.signOut();
                    } else {
                        this.programs.data = this.programs.data.filter(
                            (val) => val.short != short
                        );
                        this.snackBar.open('Removed Program', 'Ok', {
                            duration: 3000,
                        });
                    }
                });
            }
        });
    }

    addBranches() {
        let dialogRef = this.dialog.open(AddMapComponent, {
            width: '40%',
            data: {
                heading: 'Stream',
                message: 'Are you sure you want to proceed to add stream',
                add: 'branch',
            },
            hasBackdrop: true,
        });
        dialogRef.afterClosed().subscribe((data) => {
            if (data && data['message'] == 'submit') {
                if (this.checkIfPresent('streamFull', data.map.full) || this.checkIfPresent('streamShort', data.map.short)) {
                    this.snackBar.open('Duplicate entries are not allowed! Enter a unique name for every field.', 'Ok', {
                        duration: 3000,
                        panelClass: 'custom-snack-bar-container'
                    });
                    return;
                }
                const dialogRef = this.dialog.open(LoaderComponent, {
                    data: 'Please wait ...',
                    disableClose: true,
                    hasBackdrop: true,
                });

                this.userService.setBranch(data['map']).subscribe((data) => {
                    dialogRef.close();
                    if (data['message'] == 'success') {
                        const val = data['result'];
                        const newMap = {
                            name: val.full,
                            short: val.short,
                        };
                        this.branches.data.push(newMap);
                        //the below line is necessary to render the table
                        this.branches.data = [...this.branches.data];
                        this.snackBar.open(
                            'Added Stream Successfully',
                            'Ok',
                            {
                                duration: 3000,
                            }
                        );
                    }
                });
            }
        });
    }

    deleteBranch(short) {
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: '200px',
            data: {
                heading: 'Confirm Deletion',
                message: 'Are you sure you want to remove the stream',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result['message'] == 'submit') {
                const dialogRef = this.dialog.open(LoaderComponent, {
                    data: 'Removing stream. Please wait ...',
                    disableClose: true,
                    hasBackdrop: true,
                });

                this.userService.removeBranch(short).subscribe((result) => {
                    dialogRef.close();
                    if (result['message'] == 'invalid-token') {
                        this.dialogRefLoad.close();
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                            duration: 3000,
                        });
                        this.login.signOut();
                    } else {
                        this.branches.data = this.branches.data.filter(
                            (val) => val.short != short
                        );
                        this.snackBar.open('Removed Stream', 'Ok', {
                            duration: 3000,
                        });
                    }
                });
            }
        });
    }

    deleteFaculty(faculty) {
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: '200px',
            data: {
                heading: 'Confirm Removal',
                message: 'Are you sure you want to remove this faculty',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result['message'] == 'submit') {
                const dialogRef = this.dialog.open(LoaderComponent, {
                    data: 'Removing faculty. Please wait ...',
                    disableClose: true,
                    hasBackdrop: true,
                });
                this.userService.removeFaculty(faculty._id).subscribe(
                    (result) => {
                        dialogRef.close();
                        if (result['message'] == 'success') {
                            for (const program of this.programs.data) {
                                this.faculties[program.short].data = this.faculties[
                                    program.short
                                    ].data.filter((val) => {
                                    return val._id != faculty._id;
                                });
                                this.projects[program.short].data = this.projects[
                                    program.short
                                    ].data.filter((val) => val.faculty_id != faculty._id);
                            }
                            this.snackBar.open('Successfully Deleted Faculty', 'OK', {
                                duration: 3000,
                            });
                        } else if (result['message'] == 'error') {
                            this.snackBar.open('Some Error Occured! Try Again.', 'Ok', {
                                duration: 3000,
                            });
                        } else {
                            this.dialogRefLoad.close();
                            this.navbar.role = 'none';
                            this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                                duration: 3000,
                            });
                            this.login.signOut();
                        }
                    },
                    () => {
                        this.dialogRefLoad.close();
                        this.navbar.role = 'none';
                        this.snackBar.open('Some error occured! Please Sign In Again', 'Ok', {
                            duration: 3000,
                        });
                        this.login.signOut();
                    }
                );
            }
        });
    }

    addAdmin(faculty, branch) {
        const dialogRef = this.dialog.open(LoaderComponent, {
            data: 'Adding admin. Please wait ...',
            disableClose: true,
            hasBackdrop: true,
        });
        this.userService.addAdmin(faculty._id, branch).subscribe((result) => {
            dialogRef.close();
            if (result['message'] == 'success') {
                this.hasAdmins[branch] = true;
                for (const program of this.programs.data) {
                    this.faculties[program.short].data = this.faculties[
                        program.short
                        ].data.map((val) => {
                        if (val._id == faculty._id) {
                            val.isAdmin = true;
                            val.adminProgram = branch;
                        }
                        return val;
                    });
                }
            } else if (result['message'] == 'invalid-token') {
                this.dialogRefLoad.close();
                this.navbar.role = 'none';
                this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                    duration: 3000,
                });
                this.login.signOut();
            }
        });
    }

    removeAdmin(faculty, branch) {
        const dialogRef = this.dialog.open(LoaderComponent, {
            data: 'Adding admin. Please wait ...',
            disableClose: true,
            hasBackdrop: true,
        });
        this.userService.removeAdmin(faculty._id).subscribe((result) => {
            dialogRef.close();
            if (result['message'] == 'success') {
                this.hasAdmins[branch] = false;
                for (const program of this.programs.data) {
                    this.faculties[program.short].data = this.faculties[
                        program.short
                        ].data.map((val) => {
                        if (val._id == faculty._id) {
                            val.isAdmin = false;
                            val.adminProgram = result['result'];
                        }
                        return val;
                    });
                }
            } else if (result['message'] == 'invalid-token') {
                this.dialogRefLoad.close();
                this.navbar.role = 'none';
                this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                    duration: 3000,
                });
                this.login.signOut();
            }
        });
    }

    deleteStudent(student) {
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: '200px',
            data: {
                heading: 'Confirm Removal',
                message: 'Are you sure you want to remove this student',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result['message'] == 'submit') {
                const dialogRef = this.dialog.open(LoaderComponent, {
                    data: 'Please wait ....',
                    disableClose: true,
                    hasBackdrop: true,
                });
                this.userService.removeStudent(student._id).subscribe(
                    (result) => {
                        dialogRef.close();
                        if (result['message'] == 'success') {
                            this.students[student.stream].data = this.students[
                                student.stream
                                ].data.filter((val) => val._id != student._id);
                            this.students[student.stream].data = [
                                ...this.students[student.stream].data,
                            ];
                            this.snackBar.open('Successfully Deleted Student', 'OK', {
                                duration: 3000,
                            });
                            this.getAllProjects();
                        } else if (result['message'] == 'error') {
                            this.snackBar.open('Some Error Occured! Try Again.', 'Ok', {
                                duration: 3000,
                            });
                        } else {
                            this.dialogRefLoad.close();
                            this.navbar.role = 'none';
                            this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                                duration: 3000,
                            });
                            this.login.signOut();
                        }
                    },
                    () => {
                        this.dialogRefLoad.close();
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'Ok', {
                            duration: 3000,
                        });
                        this.login.signOut();
                    }
                );
            }
        });
    }

    applyFilter(event: Event, branch: any, who: string) {
        const filterValue = (event.target as HTMLInputElement).value;
        if (who == 'faculty') {
            this.faculties[branch.short].filter = filterValue.trim().toLowerCase();
        } else if (who == 'student') {
            this.students[branch.short].filter = filterValue.trim().toLowerCase();
        } else if (who == 'project') {
            this.projects[branch.short].filter = filterValue.trim().toLowerCase();
        }
    }

    sortFaculties(event, branch) {
        const isAsc = event.direction == 'asc';
        this.faculties[branch.short].data = this.faculties[branch.short].data.sort(
            (a, b) => {
                switch (event.active) {
                    case 'Name':
                        return this.compare(a.name, b.name, isAsc);
                    default:
                        return 0;
                }
            }
        );
    }

    sortStudents(event, branch) {
        const isAsc = event.direction == 'asc';
        this.students[branch.short].data = this.students[branch.short].data.sort(
            (a, b) => {
                switch (event.active) {
                    case 'Name':
                        return this.compare(a.name, b.name, isAsc);
                    case 'CGPA':
                        return this.compare(a.gpa, b.gpa, isAsc);
                    case 'isRegistered':
                        return this.compare(a.isRegistered, b.isRegistered, isAsc);
                    default:
                        return 0;
                }
            }
        );
    }

    sortProjects(event, branch) {
        const isAsc = event.direction == 'asc';
        this.projects[branch.short].data = this.projects[branch.short].data.sort(
            (a, b) => {
                switch (event.active) {
                    case 'Faculty':
                        return this.compare(a.faculty, b.faculty, isAsc);
                    case 'NoOfStudents':
                        return this.compare(
                            a.numberOfPreferences,
                            b.numberOfPreferences,
                            isAsc
                        );
                    case 'Duration':
                        return this.compare(a.duration, b.duration, isAsc);
                    case 'Title':
                        return this.compare(a.title, b.title, isAsc);
                    default:
                        return 0;
                }
            }
        );
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    updateProgramShort(el: any, comment: any) {
        if (!comment || comment['message'] == 'close') {
            return "closed";
        } else if (comment['message'] == 'submit') {
            if (this.checkIfPresent('programShort', comment['value'])) {
                this.snackBar.open('Duplicate entries are not allowed! Enter a unique short name for this program.', 'Ok', {
                    duration: 3000,
                    panelClass: 'custom-snack-bar-container'
                });
                return "duplicate";
            }
            let currentShort = el['short'];
            this.userService.superAdminEditFields('programShort', currentShort, comment['value']).subscribe(result => {
                if (result['message'] == 'invalid-token') {
                    this.snackBar.open('Session Timed Out! Please Sign-In Again.', 'Ok', {
                        duration: 3000
                    });
                    this.navbar.role = 'none';
                    this.login.signOut();
                } else if (result['message'] == 'success') {
                    for (const program of this.programs.data) {
                        if (program.short == currentShort) {
                            program.short = comment['value'];
                        }
                    }
                    this.programs.data = [...this.programs.data];
                    this.students[comment['value']] = this.students[currentShort];
                    this.projects[comment['value']] = this.projects[currentShort];
                    this.faculties[comment['value']] = this.faculties[currentShort];
                    for (const program of this.programs.data) {
                        for (const faculty of this.faculties[program.short].data) {
                            if (faculty.isAdmin && faculty.adminProgram == currentShort) {
                                faculty.adminProgram = comment['value'];
                            }
                            this.faculties[program.short].data = [...this.faculties[program.short].data];
                        }
                    }
                    for (const program of this.programs.data) {
                        this.hasAdmins[program.short] = this.faculties[program.short].data.filter(faculty => {
                            if (faculty.isAdmin && faculty.adminProgram == program.short) {
                                return faculty;
                            }
                        }).length > 0;
                    }
                    this.snackBar.open('Successfully updated the field', 'Ok', {duration: 3000});
                } else {
                    this.snackBar.open('Some error occured! Try again.', 'Ok', {duration: 3000});
                }
            }, () => {
                this.snackBar.open('Some error occured! Try again.', 'Ok', {duration: 3000});
            });
        }
        return "success";
    }

    updateProgramFull(el: any, comment: any) {
        if (!comment || comment['message'] == 'close') {
            return "closed";
        } else if (comment['message'] == 'submit') {
            if (this.checkIfPresent('programFull', comment['value'])) {
                this.snackBar.open('Duplicate entries are not allowed! Enter a unique name for this program.', 'Ok', {
                    duration: 3000,
                    panelClass: 'custom-snack-bar-container'
                });
                return "duplicate";
            }
            let currentFull = el['name'];
            this.userService.superAdminEditFields('programFull', currentFull, comment['value']).subscribe(result => {
                if (result['message'] == 'invalid-token') {
                    this.snackBar.open('Session Timed Out! Please Sign-In Again.', 'Ok', {
                        duration: 3000
                    });
                    this.navbar.role = 'none';
                    this.login.signOut();
                } else if (result['message'] == 'success') {
                    for (const program of this.programs.data) {
                        if (program.name == currentFull) {
                            program.name = comment['value'];
                        }
                    }
                    this.programs.data = [...this.programs.data];
                    this.snackBar.open('Successfully updated the field', 'Ok', {duration: 3000});
                } else {
                    this.snackBar.open('Some error occured! Try again.', 'Ok', {duration: 3000});
                }
            }, () => {
                this.snackBar.open('Some error occured! Try again.', 'Ok', {duration: 3000});
            });
        }
        return "success";
    }

    updateStreamName(el: any, comment: any) {
        if (!comment || comment['message'] == 'close') {
            return "closed";
        } else if (comment['message'] == 'submit') {
            if (this.checkIfPresent('streamFull', comment['value'])) {
                this.snackBar.open('Duplicate entries are not allowed! Enter a unique name for this stream.', 'Ok', {
                    duration: 3000,
                    panelClass: 'custom-snack-bar-container'
                });
                return "duplicate";
            }
            let currentName = el['name'];
            this.userService.superAdminEditFields('streamFull', currentName, comment['value']).subscribe(result => {
                if (result['message'] == 'invalid-token') {
                    this.snackBar.open('Session Timed Out! Please Sign-In Again.', 'Ok', {
                        duration: 3000
                    });
                    this.navbar.role = 'none';
                    this.login.signOut();
                } else if (result['message'] == 'success') {
                    for (const stream of this.branches.data) {
                        if (stream.name == currentName) {
                            stream.name = comment['value'];
                        }
                    }
                    this.branches.data = [...this.branches.data];
                    this.snackBar.open('Successfully updated the field', 'Ok', {duration: 3000});
                } else {
                    this.snackBar.open('Some error occured! Try again.', 'Ok', {duration: 3000});
                }
            }, () => {
                this.snackBar.open('Some error occured! Try again.', 'Ok', {duration: 3000});
            });
        }
        return "success";
    }

    updateStreamShort(el: any, comment: any) {
        if (!comment || comment['message'] == 'close') {
            return "closed";
        } else if (comment['message'] == 'submit') {
            if (this.checkIfPresent('streamShort', comment['value'])) {
                this.snackBar.open('Duplicate entries are not allowed! Enter a unique short name for this stream.', 'Ok', {
                    duration: 3000,
                    panelClass: 'custom-snack-bar-container'
                });
                return "duplicate";
            }
            let currentShort = el['short'];
            this.userService.superAdminEditFields('streamShort', currentShort, comment['value']).subscribe(result => {
                if (result['message'] == 'invalid-token') {
                    this.snackBar.open('Session Timed Out! Please Sign-In Again.', 'Ok', {
                        duration: 3000
                    });
                    this.navbar.role = 'none';
                    this.login.signOut();
                } else if (result['message'] == 'success') {
                    for (const stream of this.branches.data) {
                        if (stream.short == currentShort) {
                            stream.short = comment['value'];
                        }
                    }
                    for (const program of this.programs.data) {
                        for (const faculty of this.faculties[program.short].data) {
                            if (faculty.stream == currentShort) {
                                faculty.stream = comment['value'];
                            }
                            this.faculties[program.short].data = [...this.faculties[program.short].data];
                        }
                    }
                    this.branches.data = [...this.branches.data];
                    this.snackBar.open('Successfully updated the field', 'Ok', {duration: 3000});
                } else {
                    this.snackBar.open('Some error occured! Try again.', 'Ok', {duration: 3000});
                }
            }, () => {
                this.snackBar.open('Some error occured! Try again.', 'Ok', {duration: 3000});
            });
        }
        return "success";
    }

    checkIfPresent(field, newValue) {
        let isPresent: boolean = false;
        switch (field) {
            case 'programFull':
                for (const program of this.programs.data) {
                    if (program.name == newValue) {
                        isPresent = true;
                        break;
                    }
                }
                return isPresent;
            case 'programShort':
                for (const program of this.programs.data) {
                    if (program.short == newValue) {
                        isPresent = true;
                        break;
                    }
                }
                return isPresent;
            case 'streamFull':
                for (const stream of this.branches.data) {
                    if (stream.name == newValue) {
                        isPresent = true;
                        break;
                    }
                }
                return isPresent;
            case 'streamShort':
                for (const stream of this.branches.data) {
                    if (stream.short == newValue) {
                        isPresent = true;
                        break;
                    }
                }
                return isPresent;
            default:
                return !isPresent;
        }
    }

    updateStream(event, map) {
        let full = event.full;
        let short = event.short;

        if(full != map.name && short != map.short) {
            this.updateStreamName({short: map.short, name: map.name}, {message:"submit", value: full});
            this.updateStreamShort({short: map.short, name: map.name}, {message:"submit", value: short});
        } else if(full !== map.name) {
            this.updateStreamName({short: map.short, name: map.name}, {message:"submit", value: full});
        } else if (short !== map.short) {
            this.updateStreamShort({short: map.short, name: map.name}, {message:"submit", value: short});
        }
    }

    updateProgram(event, map) {
        let full = event.full;
        let short = event.short;
        if(full != map.name && short != map.short) {
            this.updateProgramFull({short: map.short, name: map.name}, {message:"submit", value: full});
            this.updateProgramShort({short: map.short, name: map.name}, {message:"submit", value: short});
        } else if(full !== map.name) {
            this.updateProgramFull({short: map.short, name: map.name}, {message:"submit", value: full});
        } else if (short !== map.short) {
            this.updateProgramShort({short: map.short, name: map.name}, {message:"submit", value: short});
        }
    }

}
