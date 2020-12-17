import { MatDialog } from "@angular/material/dialog";
import { LoginComponent } from "src/app/components/shared/login/login.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "src/app/services/user/user.service";
import { Component, OnInit, Pipe, PipeTransform } from "@angular/core";
import { DeletePopUpComponent } from "src/app/components/faculty-components/delete-pop-up/delete-pop-up.component";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";
import { forkJoin } from "rxjs";

@Pipe({
    name: "userPhoto"
})
export class UserPhoto implements PipeTransform {
    transform(value) {
        const user = JSON.parse(localStorage.getItem("user"));
        return user["photoUrl"];
    }
}

@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: [ "./profile.component.scss" ],
    providers: [ LoginComponent ]
})
export class ProfileComponent implements OnInit {
    programHeader: string[] = [
        "Program Name",
        "Delete"
    ];
    programs;
    faculty_programs = [];
    user_info: any;
    role: string = localStorage.getItem("role");
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
            "",
            Validators.required
        ]
    });
    programGroup: FormGroup = this.formBuilder.group({
        programs: [
            "",
            Validators.required
        ]
    });

    constructor(
        private userService: UserService, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private login: LoginComponent,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait! ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.role = localStorage.getItem("role");
        if (this.role == "student") {
            this.userService
                .getStudentDetails(localStorage.getItem("id"))
                .subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    if (responseAPI.statusCode == 401) {
                        this.snackBar.open(responseAPI.message, "Ok");
                    } else {
                        this.user_info = responseAPI.result.student;
                        this.studentFormGroup.controls["name"].setValue(this.user_info.name);
                        this.studentFormGroup.controls["gpa"].setValue(this.user_info.gpa);
                    }
                }, () => {
                    this.dialogRefLoad.close();
                    this.snackBar.open("Some error occurred, if the error persists re-authenticate", "Ok");
                });
        } else if (this.role == "faculty" || this.role == "admin") {
            const requests = [
                this.userService.getFacultyDetails(localStorage.getItem("id")),
                this.userService.getAllPrograms()
            ];
            forkJoin(requests).subscribe((response: Array<HttpResponseAPI>) => {
                this.dialogRefLoad.close();
                this.user_info = response[0].result.faculty;
                this.faculty_programs = this.user_info["programs"];
                this.facultyFormGroup.controls["name"].setValue(this.user_info.name);
                this.programs = response[1].result.programs;
            }, () => {
                this.dialogRefLoad.close();
            });
            // this.userService
            //     .getFacultyDetails(localStorage.getItem("id"))
            //     .subscribe((responseAPI: HttpResponseAPI) => {
            //         this.dialogRefLoad.close();
            //         this.user_info = responseAPI.result.faculty;
            //         this.faculty_programs = this.user_info["programs"];
            //         this.facultyFormGroup.controls["name"].setValue(this.user_info.name);
            //         this.userService
            //             .getAllPrograms()
            //             .subscribe((responseAPI: HttpResponseAPI) => {
            //                 this.programs = responseAPI.result.programs;
            //             });
            //     }, () => {
            //         this.dialogRefLoad.close();
            //         this.snackBar.open("Some error occured, if the error persists re-authenticate", "Ok");
            //     });
        }
    }

    updateFacultyProfile() {
        if (this.facultyFormGroup.valid) {
            const faculty = {
                name: this.facultyFormGroup.get("name").value
            };
            const dialogRef = this.dialog.open(LoaderComponent, {
                data: "Updating, Please wait ...",
                disableClose: true,
                panelClass: "transparent"
            });
            this.userService.updateFacultyProfile(faculty).subscribe((data) => {
                dialogRef.close();
                if (data["status"] == "success") {
                    this.snackBar.open(data["msg"], "Ok");
                } else {
                    this.snackBar.open("Session Timed Out! Please Sign in Again!", "Ok");
                    this.login.signOut();
                }
            }, () => {
                dialogRef.close();
                this.ngOnInit();
                this.snackBar.open("Some Error Occured! Try again later.", "OK");
            });
        }
    }

    addProgram() {
        if (this.programGroup.valid) {
            const programs = {
                programs: this.programGroup.get("programs").value
            };
            const dialogRef = this.dialog.open(LoaderComponent, {
                data: "Updating, please wait ...",
                disableClose: true,
                panelClass: "transparent"
            });
            this.userService.setPrograms(programs).subscribe((data) => {
                dialogRef.close();
                if (data["status"] == "success") {
                    this.snackBar.open(data["msg"], "Ok");
                    this.ngOnInit();
                } else {
                    this.snackBar.open("Session Timed Out! Please Sign in Again!", "Ok");
                    this.login.signOut();
                }
            }, () => {
                dialogRef.close();
                this.ngOnInit();
                this.snackBar.open("Some Error Occured! Try again later.", "Ok");
            });
        }
    }

    deleteProgram(program) {
        const obj = {
            program: program
        };
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: "200px",
            data: {
                heading: "Confirm Deletion",
                message: "Are you sure you want to remove the branch"
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result["message"] == "submit") {
                const dialogRef = this.dialog.open(LoaderComponent, {
                    data: "Loading, Please Wait ....",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService
                    .deleteFacultyProgram(obj)
                    .subscribe((data) => {
                        dialogRef.close();
                        if (data["status"] == "success") {
                            this.snackBar.open(data["msg"], "Ok");
                            this.ngOnInit();
                        } else {
                            this.snackBar.open("Session Timed Out! Please Sign in Again!", "Ok");
                            this.login.signOut();
                        }
                    });
            }
        }, () => {
            dialogRef.close();
            this.ngOnInit();
            this.snackBar.open("Some Error Occured! Try again later.");
        });
    }
}
