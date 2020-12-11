import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user/user.service';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LoaderComponent } from 'src/app/components/shared/loader/loader.component';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    maps: any;
    branches: any = [];
    programs: any = [];
    branchStudent: any;
    role = localStorage.getItem('role');
    head: string;
    user = JSON.parse(localStorage.getItem('user'));
    userForm = this.fb.group({
        firstName: [this.user.firstName, Validators.required],
        lastName: [this.user.lastName, Validators.required],
        CGPA: [
            null,
            Validators.compose([
                Validators.required,
                Validators.max(10),
                Validators.min(0),
            ]),
        ],
        email: [this.user.email, Validators.required],
        branch: [null, Validators.required],
    });
    message = '';
    hasUnitNumber = false;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private router: Router,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.role = localStorage.getItem('role');
        this.userService.getAllBranches().subscribe((maps) => {
            this.maps = maps['result'];
            for (const map of this.maps) {
                const newObj = {
                    name: map.full,
                    short: map.short,
                };
                this.branches.push(newObj);
            }
        });
        this.userService
            .getAllMaps()
            .toPromise()
            .then((maps) => {
                this.maps = maps['result'];
                for (const map of this.maps) {
                    const newObj = {
                        name: map.full,
                        short: map.short,
                        map: map.map,
                        length: map.length,
                    };
                    this.programs.push(newObj);
                }
                return this.programs;
            })
            .then(() => {
                JSON.parse(localStorage.getItem('user'));
                this.userForm.get('email').disable();
                if (localStorage.getItem('role') == 'super_admin') {
                    this.userForm.get('branch').clearValidators();
                }
                if (localStorage.getItem('role') == 'student') {
                    this.head = 'Program';
                    this.userForm.get('branch').disable();
                    this.branchStudent = this.getStream();
                    if (this.branchStudent != 'invalid') {
                        this.userForm.controls['branch'].setValue(this.branchStudent);
                    } else {
                        this.userForm.controls['branch'].setErrors({
                            required: true,
                        });
                        this.userForm.get('branch').updateValueAndValidity();
                    }
                } else if (localStorage.getItem('role') == 'faculty') {
                    this.userForm.get('CGPA').clearValidators();
                    this.userForm.get('CGPA').updateValueAndValidity();
                    this.head = 'Stream';
                } else {
                    this.userForm.get('CGPA').clearValidators();
                    this.userForm.get('branch').clearValidators();
                    this.userForm.get('CGPA').updateValueAndValidity();
                    this.userForm.get('branch').updateValueAndValidity();
                }
            });
    }

    getStream() {
        if (localStorage.getItem('role') == 'student') {
            const user = JSON.parse(localStorage.getItem('user'));
            const rollno = user.email.split('@')[0];
            for (const branch of this.programs) {
                const pattern = new RegExp(branch.map.split('|')[1]);
                if (
                    pattern.exec(rollno) &&
                    pattern.exec(rollno).index == branch.length
                ) {
                    return branch.short;
                }
            }
            return 'invalid';
        }
        return 'invalid';
    }

    // isFaculty() {
    //     if (localStorage.getItem('role') == 'faculty') {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    onSubmit() {
        if (this.userForm.valid) {
            const user = {
                name:
                    this.userForm.get('firstName').value +
                    ' ' +
                    this.userForm.get('lastName').value,
                roll_no: String(this.userForm.get('email').value).split('@')[0],
                email: this.userForm.get('email').value,
                gpa: this.userForm.get('CGPA').value,
                stream: this.userForm.get('branch').value,
            };
            user.name =
                localStorage.getItem('role') == 'student'
                    ? user.name.toUpperCase()
                    : user.name;
            const _user = JSON.parse(localStorage.getItem('user'));

            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: _user.idToken,
                }),
            };

            let position = '';
            position = localStorage.getItem('role');
            const id = _user.id;

            const dialogRef = this.dialog.open(LoaderComponent, {
                data: 'Please wait ....',
                disableClose: true,
                hasBackdrop: true,
            });

            this.userService.registerUser(user, httpOptions, position, id).subscribe(
                (data: any) => {
                    dialogRef.close();
                    if (data['registration'] == 'success') {
                        localStorage.setItem('role', position);
                        localStorage.setItem('isRegistered', 'true');
                        this.snackBar.open('Registration Successful', 'Ok', {
                            duration: 3000,
                        });
                        var route = '/' + position + '/' + id;
                        this.router.navigate([route]);
                    } else {
                        this.snackBar.open('Registration Failed! Please Try Again', 'Ok', {
                            duration: 3000,
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
}
