import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from 'src/app/services/user/user.service';
import {HttpHeaders} from '@angular/common/http';
import {Component, NgModule, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {LoaderComponent} from 'src/app/components/shared/loader/loader.component';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';
import {CommonModule} from '@angular/common';
import {PipeModule} from 'src/app/components/shared/Pipes/pipe.module';
import {MaterialModule} from 'src/app/material/material.module';
import {finalize} from 'rxjs/operators';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    streams: any = [];
    programs: any = [];
    role = localStorage.getItem('role');
    head: string;
    user = JSON.parse(localStorage.getItem('user'));
    userForm = this.fb.group({
        firstName: [
            this.user.firstName,
            Validators.required
        ],
        lastName: [
            this.user.lastName,
            Validators.required
        ],
        email: [
            this.user.email,
            Validators.required
        ],
        stream: [
            null,
            Validators.required
        ]
    });
    message = '';
    hasUnitNumber = false;
    dialogRefLoad: MatDialogRef<any>;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private router: Router,
        private dialog: MatDialog
    ) {
    }

    closeDialog = finalize(() => this.dialogRefLoad.close());


    ngOnInit() {
        this.role = localStorage.getItem('role');
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Loading, Please wait ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        this.userService.getAllBranches()
            .pipe(this.closeDialog)
            .subscribe((responseAPI: HttpResponseAPI) => {
                this.streams = responseAPI.result.streams.map((val) => {
                    return {
                        full: val.full,
                        short: val.short
                    };
                });
                this.userForm.get('email').disable();
                if (localStorage.getItem('role') === 'super_admin') {
                    this.userForm.get('stream').clearValidators();
                }
                if (localStorage.getItem('role') === 'faculty') {
                    this.head = 'Stream';
                } else {
                    this.userForm.get('stream').clearValidators();
                    this.userForm.get('stream').updateValueAndValidity();
                }
            });
    }

    onSubmit() {
        const user = {
            name: this.userForm.get('firstName').value + ' ' + this.userForm.get('lastName').value,
            roll_no: String(this.userForm.get('email').value).split('@')[0],
            email: this.userForm.get('email').value,
            stream: this.userForm.get('stream').value
        };
        const id = localStorage.getItem('id');
        const idToken = localStorage.getItem('idToken');
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        let position = '';
        position = localStorage.getItem('role');
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Registering, Please wait ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        this.userService
            .registerUser(user, httpOptions, position, id)
            .pipe(this.closeDialog)
            .subscribe((responseAPI: any) => {
                if (responseAPI.result.registered) {
                    localStorage.setItem('role', position);
                    localStorage.setItem('isRegistered', 'true');
                    localStorage.removeItem('user');
                    const route = '/' + position + '/' + id;
                    this.router.navigate([route]);
                }
                this.snackBar.open(responseAPI.message, 'Ok');
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
        RegisterComponent
    ],
    exports: [
        RegisterComponent
    ]
})
export class RegisterModule {
}
