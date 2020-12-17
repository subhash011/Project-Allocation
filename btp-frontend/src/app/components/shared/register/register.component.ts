import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "src/app/services/user/user.service";
import { HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";
import { LoginComponent } from "../login/login.component";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrls: [ "./register.component.scss" ]
})
export class RegisterComponent implements OnInit {
    streams: any = [];
    programs: any = [];
    role = localStorage.getItem("role");
    head: string;
    user = JSON.parse(localStorage.getItem("user"));
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
    message = "";
    hasUnitNumber = false;
    dialogRefLoad: MatDialogRef<any>;

    constructor(
        private fb: FormBuilder, private userService: UserService, private snackBar: MatSnackBar, private router: Router,
        private dialog: MatDialog, private login: LoginComponent, private navbar: NavbarComponent
    ) {}

    ngOnInit() {
        this.role = localStorage.getItem("role");
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.userService.getAllBranches().subscribe((responseAPI: HttpResponseAPI) => {
            this.dialogRefLoad.close();
            this.streams = responseAPI.result.streams.map((val) => {
                return {
                    full: val.full,
                    short: val.short
                };
            });
            JSON.parse(localStorage.getItem("user"));
            this.userForm.get("email").disable();
            if (localStorage.getItem("role") == "super_admin") {
                this.userForm.get("stream").clearValidators();
            }
            if (localStorage.getItem("role") == "faculty") {
                this.head = "Stream";
            } else {
                this.userForm.get("stream").clearValidators();
                this.userForm.get("stream").updateValueAndValidity();
            }
        }, () => {
            this.dialogRefLoad.close();
        });
    }

    onSubmit() {
        if (this.userForm.valid) {
            const user = {
                name: this.userForm.get("firstName").value + " " + this.userForm.get("lastName").value,
                roll_no: String(this.userForm.get("email").value).split("@")[0],
                email: this.userForm.get("email").value,
                stream: this.userForm.get("stream").value
            };
            const _user = JSON.parse(localStorage.getItem("user"));
            const httpOptions = {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                    Authorization: _user.idToken
                })
            };
            let position = "";
            position = localStorage.getItem("role");
            const id = _user.id;
            const dialogRef = this.dialog.open(LoaderComponent, {
                data: "Registering, Please wait ...",
                disableClose: true,
                panelClass: "transparent"
            });
            this.userService
                .registerUser(user, httpOptions, position, id)
                .subscribe((data: any) => {
                    dialogRef.close();
                    if (data["registration"] == "success") {
                        localStorage.setItem("role", position);
                        localStorage.setItem("isRegistered", "true");
                        this.snackBar.open("Registration Successful", "Ok");
                        const route = "/" + position + "/" + id;
                        this.router.navigate([ route ]);
                    } else {
                        this.snackBar.open("Registration Failed! Please Try Again", "Ok");
                    }
                }, () => {
                    dialogRef.close();
                    this.ngOnInit();
                    this.snackBar.open("Some Error Occurred! Try again later.", "OK");
                });
        }
    }
}
