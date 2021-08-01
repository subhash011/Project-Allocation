import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from 'src/app/services/user/user.service';
import {Component, NgModule, OnInit} from '@angular/core';
import {DeletePopUpComponent} from 'src/app/components/faculty/delete-pop-up/delete-pop-up.component';
import {LoaderComponent} from 'src/app/components/shared/loader/loader.component';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';
import {forkJoin} from 'rxjs';
import {CommonModule} from '@angular/common';
import {MaterialModule} from 'src/app/material/material.module';
import {PipeModule} from 'src/app/components/shared/Pipes/pipe.module';
import {NavbarComponent} from 'src/app/components/shared/navbar/navbar.component';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    providers: []
})
export class ProfileComponent implements OnInit {
    programHeader: string[] = [
        'Program Name',
        'Delete'
    ];
    programs = [];
    facultyPrograms = [];
    userInfo: any;
    role: string = localStorage.getItem('role');
    checked = false;
    dialogRefLoad: any;
    studentFormGroup: FormGroup = this.formBuilder.group({
        name: [
            null,
            Validators.required
        ],
        gpa: [
            null,
            Validators.required
        ]
    });
    facultyFormGroup: FormGroup = this.formBuilder.group({
        name: [
            '',
            Validators.required
        ]
    });
    programGroup: FormGroup = this.formBuilder.group({
        programs: [
            '',
            Validators.required
        ]
    });

    constructor(
        private userService: UserService,
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private navbar: NavbarComponent
    ) {
    }

    ngOnInit() {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Loading, Please wait! ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        this.role = localStorage.getItem('role');
        if (this.role === 'student') {
            this.userService
                .getStudentDetails(localStorage.getItem('id'))
                .subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    if (responseAPI.statusCode === 401) {
                        this.snackBar.open(responseAPI.message, 'Ok');
                    } else {
                        this.userInfo = responseAPI.result.student;
                        this.studentFormGroup.controls.name.setValue(this.userInfo.name);
                        this.studentFormGroup.controls.gpa.setValue(this.userInfo.gpa);
                    }
                }, () => {
                    this.dialogRefLoad.close();
                });
        } else if (this.role === 'faculty' || this.role === 'admin') {
            const requests = [
                this.userService.getFacultyDetails(localStorage.getItem('id')),
                this.userService.getAllPrograms()
            ];
            forkJoin(requests).subscribe((response: Array<HttpResponseAPI>) => {
                this.dialogRefLoad.close();
                this.userInfo = response[0].result.faculty;
                this.facultyPrograms = this.userInfo.programs;
                this.facultyFormGroup.controls.name.setValue(this.userInfo.name);
                this.programs = response[1].result.programs;
            }, () => {
                this.dialogRefLoad.close();
            });
        }
    }

    updateFacultyProfile() {
        const faculty = {
            name: this.facultyFormGroup.get('name').value
        };
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Updating, Please wait ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        this.userService.updateFacultyProfile(faculty).subscribe((responseAPI: HttpResponseAPI) => {
            this.dialogRefLoad.close();
            this.snackBar.open(responseAPI.message, 'Ok');
        }, () => {
            this.dialogRefLoad.close();
        });
    }

    addProgram() {
        const programs = {
            programs: this.programGroup.get('programs').value
        };
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Updating, please wait ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        this.userService.setPrograms(programs).subscribe((responseAPI: HttpResponseAPI) => {
            this.dialogRefLoad.close();
            this.facultyPrograms = responseAPI.result.programs;
            this.navbar.programs = this.facultyPrograms;
            this.snackBar.open(responseAPI.message, 'Ok');
        }, () => {
            this.dialogRefLoad.close();
        });
    }

    deleteProgram(program) {
        const obj = {
            program
        };
        this.dialogRefLoad = this.dialog.open(DeletePopUpComponent, {
            height: '200px',
            data: {
                heading: 'Confirm Deletion',
                message: 'Are you sure you want to remove the branch'
            },
            disableClose: true
        });
        this.dialogRefLoad.afterClosed().subscribe((result) => {
            if (result.message === 'submit') {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: 'Removing, Please Wait ....',
                    disableClose: true,
                    panelClass: 'transparent'
                });
                this.userService
                    .deleteFacultyProgram(obj)
                    .subscribe((responseAPI: HttpResponseAPI) => {
                        this.dialogRefLoad.close();
                        this.snackBar.open(responseAPI.message, 'Ok');
                        this.facultyPrograms = this.facultyPrograms.filter(val => val.short !== program.short);
                        this.navbar.programs = this.facultyPrograms;
                    });
            }
        }, () => {
            this.dialogRefLoad.close();
        });
    }
}

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        PipeModule
    ],
    declarations: [
        ProfileComponent
    ],
    exports: [
        ProfileComponent
    ]
})
export class ProfileModule {
}
