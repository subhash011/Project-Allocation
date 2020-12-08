import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from 'src/app/components/shared/login/login.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user/user.service';
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DeletePopUpComponent } from 'src/app/components/faculty-componenets/delete-pop-up/delete-pop-up.component';
import { LoaderComponent } from 'src/app/components/shared/loader/loader.component';

@Pipe({
    name: 'userPhoto',
})
export class UserPhoto implements PipeTransform {
    transform(value) {
        const user = JSON.parse(localStorage.getItem('user'));
        return user['photoUrl'];
    }
}

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    providers: [LoginComponent],
})
export class ProfileComponent implements OnInit {
    programHeader: string[] = ['Program Name', 'Delete'];
    programs;
    faculty_programs = [];
    user_info: any;
    role: string = localStorage.getItem('role');
    checked = false;
    dialogRefLoad: any;
    studentFormGroup: FormGroup = this.formBuilder.group({
        name: [null, Validators.required],
        gpa: [null, Validators.required],
    });
    facultyFormGroup: FormGroup = this.formBuilder.group({
        name: ['', Validators.required],
    });
    programGroup: FormGroup = this.formBuilder.group({
        programs: ['', Validators.required],
    });

    constructor(
        private userService: UserService,
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private login: LoginComponent,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Loading. Please wait! ...',
            disableClose: true,
            hasBackdrop: true,
        });
        this.role = localStorage.getItem('role');
        if (this.role == 'student') {
            this.userService
                .getStudentDetails(localStorage.getItem('id'))
                .subscribe(
                    (data) => {
                        this.dialogRefLoad.close();
                        this.user_info = data['user_details'];
                        this.studentFormGroup.controls['name'].setValue(
                            this.user_info.name
                        );
                        this.studentFormGroup.controls['gpa'].setValue(this.user_info.gpa);
                    },
                    () => {
                        this.dialogRefLoad.close();
                        this.snackBar.open(
                            'Some error occured, if the error persists re-authenticate',
                            'Ok',
                            {
                                duration: 3000,
                            }
                        );
                    }
                );
        } else if (this.role == 'faculty' || this.role == 'admin') {
            this.userService.getFacultyDetails(localStorage.getItem('id')).subscribe(
                (data) => {
                    this.dialogRefLoad.close();
                    if (data['status'] == 'success') {
                        this.user_info = data['user_details'];
                        this.faculty_programs = this.user_info['programs'];
                        this.facultyFormGroup.controls['name'].setValue(
                            this.user_info.name
                        );
                        this.userService.getAllPrograms().subscribe((data) => {
                            if (data['status'] == 'success') {
                                this.programs = data['programs'];
                            } else {
                                this.snackBar.open(
                                    'Session Timed Out! Please Sign in Again!',
                                    'Ok',
                                    {
                                        duration: 3000,
                                    }
                                );
                                this.login.signOut();
                            }
                        });
                    } else {
                        this.snackBar.open(
                            'Session Timed Out! Please Sign in Again!',
                            'Ok',
                            {
                                duration: 3000,
                            }
                        );
                        this.login.signOut();
                    }
                },
                () => {
                    this.dialogRefLoad.close();
                    this.snackBar.open(
                        'Some error occured, if the error persists re-authenticate',
                        'Ok',
                        {
                            duration: 3000,
                        }
                    );
                }
            );
        }
    }

    getStudentDiv() {
        if (this.role == 'student' && this.user_info != null) {
            return true;
        } else {
            return false;
        }
    }

    getSuperAdminDiv() {
        if (localStorage.getItem('role') == 'super_admin') {
            return true;
        } else {
            return false;
        }
    }

    getFacultyDiv() {
        if (
            localStorage.getItem('role') == 'faculty' ||
            localStorage.getItem('role') == 'admin'
        ) {
            return true;
        } else {
            return false;
        }
    }

    updateStudentProfile() {
        if (this.studentFormGroup.valid) {
            const student = {
                name: this.studentFormGroup.get('name').value,
                gpa: this.studentFormGroup.get('gpa').value,
            };
            var dialogRef = this.dialog.open(LoaderComponent, {
                data: 'Please wait ....',
                disableClose: true,
                hasBackdrop: true,
            });
            this.userService.updateStudentProfile(student).subscribe(
                (result) => {
                    if (result['message'] == 'success') {
                        this.snackBar.open('Profile Updated Sucessfully', 'Ok', {
                            duration: 3000,
                        });
                        this.ngOnInit();
                    } else if (result['message'] == 'invalid-token') {
                        this.login.signOut();
                        this.snackBar.open(
                            'Session Timed Out! Please Sign-In again.',
                            'Ok',
                            {
                                duration: 3000,
                            }
                        );
                    }
                },
                () => {
                    dialogRef.close();
                    this.ngOnInit();
                    this.snackBar.open('Some Error Occured! Try again later.', 'OK', {
                        duration: 3000,
                    });
                }
            );
        }
    }

    updateFacultyProfile() {
        if (this.facultyFormGroup.valid) {
            const faculty = {
                name: this.facultyFormGroup.get('name').value,
            };

            var dialogRef = this.dialog.open(LoaderComponent, {
                data: 'Please wait ....',
                disableClose: true,
                hasBackdrop: true,
            });

            this.userService.updateFacultyProfile(faculty).subscribe(
                (data) => {
                    dialogRef.close();
                    if (data['status'] == 'success') {
                        this.snackBar.open(data['msg'], 'Ok', {
                            duration: 3000,
                        });
                    } else {
                        this.snackBar.open(
                            'Session Timed Out! Please Sign in Again!',
                            'Ok',
                            {
                                duration: 3000,
                            }
                        );
                        this.login.signOut();
                    }
                },
                () => {
                    dialogRef.close();
                    this.ngOnInit();
                    this.snackBar.open('Some Error Occured! Try again later.', 'OK', {
                        duration: 3000,
                    });
                }
            );
        }
    }

    addProgram() {
        if (this.programGroup.valid) {
            const programs = {
                programs: this.programGroup.get('programs').value,
            };
            var dialogRef = this.dialog.open(LoaderComponent, {
                data: 'Please wait ....',
                disableClose: true,
                hasBackdrop: true,
            });
            this.userService.setPrograms(programs).subscribe(
                (data) => {
                    dialogRef.close();
                    if (data['status'] == 'success') {
                        this.snackBar.open(data['msg'], 'Ok', {
                            duration: 3000,
                        });
                        this.ngOnInit();
                    } else {
                        this.snackBar.open(
                            'Session Timed Out! Please Sign in Again!',
                            'Ok',
                            {
                                duration: 3000,
                            }
                        );
                        this.login.signOut();
                    }
                },
                () => {
                    dialogRef.close();
                    this.ngOnInit();
                    this.snackBar.open('Some Error Occured! Try again later.', 'OK', {
                        duration: 3000,
                    });
                }
            );
        }
    }

    deleteProgram(program) {
        const obj = {
            program: program,
        };

        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: '200px',
            data: {
                heading: 'Confirm Deletion',
                message: 'Are you sure you want to remove the branch',
            },
        });
        dialogRef.afterClosed().subscribe(
            (result) => {
                if (result['message'] == 'submit') {
                    var dialogRef = this.dialog.open(LoaderComponent, {
                        data: 'Loading Please Wait ....',
                        disableClose: true,
                        hasBackdrop: true,
                    });

                    this.userService.deleteFacultyProgram(obj).subscribe((data) => {
                        dialogRef.close();
                        if (data['status'] == 'success') {
                            this.snackBar.open(data['msg'], 'Ok', {
                                duration: 3000,
                            });
                            this.ngOnInit();
                        } else {
                            this.snackBar.open(
                                'Session Timed Out! Please Sign in Again!',
                                'Ok',
                                {
                                    duration: 3000,
                                }
                            );
                            this.login.signOut();
                        }
                    });
                }
            },
            () => {
                dialogRef.close();
                this.ngOnInit();
                this.snackBar.open('Some Error Occured! Try again later.', 'OK', {
                    duration: 3000,
                });
            }
        );
    }
}
