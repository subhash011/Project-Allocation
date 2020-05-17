import { LoadingBarService } from "@ngx-loading-bar/core";
import { MatDialog } from "@angular/material/dialog";
import { LoginComponent } from "./../login/login.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { UserService } from "./../../../services/user/user.service";
import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { DeletePopUpComponent } from "../../faculty-componenets/delete-pop-up/delete-pop-up.component";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
  providers: [LoginComponent],
})
export class ProfileComponent implements OnInit {
  programHeader: string[] = ["Program Name", "Delete"];
  programs;
  faculty_programs = [];
  user_info: any;
  role = "";
  checked = false;
  editStatus = "Edit";
  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private login: LoginComponent,
    private dialog: MatDialog,
    private loadingBar: LoadingBarService
  ) {}
  ngOnInit() {
    this.loadingBar.start();
    this.role = localStorage.getItem("role");
    if (this.role == "student") {
      user = this.userService
        .getStudentDetails(localStorage.getItem("id"))
        .subscribe((data) => {
          this.user_info = data["user_details"];
          this.studentFormGroup.controls["name"].setValue(this.user_info.name);
          this.studentFormGroup.controls["gpa"].setValue(this.user_info.gpa);
          this.loadingBar.stop();
        });
    } else if (this.role == "faculty" || this.role == "admin") {
      var user: any;
      this.userService
        .getFacultyDetails(localStorage.getItem("id"))
        .toPromise()
        .then((data) => {
          if (data["status"] == "success") {
            this.user_info = data["user_details"];
            this.faculty_programs = this.user_info["programs"];
            this.facultyFormGroup.controls["name"].setValue(
              this.user_info.name
            );
            this.userService.getAllPrograms().subscribe((data) => {
              if (data["status"] == "success") {
                this.programs = data["programs"];
              } else {
                let snackBarRef = this.snackBar.open(
                  "Session Timed Out! Please Sign in Again!",
                  "Ok",
                  {
                    duration: 3000,
                  }
                );
                this.login.signOut();
              }
            });
          } else {
            let snackBarRef = this.snackBar.open(
              "Session Timed Out! Please Sign in Again!",
              "Ok",
              {
                duration: 3000,
              }
            );
            snackBarRef.afterDismissed().subscribe(() => {
              this.login.signOut();
            });
            snackBarRef.onAction().subscribe(() => {
              this.login.signOut();
            });
          }
          this.loadingBar.stop();
        });
    }
  }

  studentFormGroup: FormGroup = this.formBuilder.group({
    name: [null, Validators.required],
    gpa: [null, Validators.required],
  });
  facultyFormGroup: FormGroup = this.formBuilder.group({
    name: ["", Validators.required],
  });
  programGroup: FormGroup = this.formBuilder.group({
    programs: ["", Validators.required],
  });

  getUrl() {
    const user = JSON.parse(localStorage.getItem("user"));
    return user["photoUrl"];
  }

  getStudentDiv() {
    if (this.role == "student" && this.user_info != null) {
      return true;
    } else {
      return false;
    }
  }

  getSuperAdminDiv() {
    if (localStorage.getItem("role") == "super_admin") {
      return true;
    } else {
      return false;
    }
  }
  getFacultyDiv() {
    if (
      localStorage.getItem("role") == "faculty" ||
      localStorage.getItem("role") == "admin"
    ) {
      return true;
    } else {
      return false;
    }
  }
  updateStudentProfile() {
    if (this.studentFormGroup.valid) {
      const student = {
        name: this.studentFormGroup.get("name").value,
        gpa: this.studentFormGroup.get("gpa").value,
      };
      this.userService
        .updateStudentProfile(student)
        .toPromise()
        .then((result) => {
          if (result["message"] == "success") {
            this.snackBar.open("Profile Updated Sucessfully", "Ok", {
              duration: 3000,
            });
            this.ngOnInit();
          } else if (result["message"] == "invalid-token") {
            this.login.signOut();
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again.",
              "Ok",
              {
                duration: 3000,
              }
            );
          }
        });
    }
  }

  updateFacultyProfile() {
    if (this.facultyFormGroup.valid) {
      const faculty = {
        name: this.facultyFormGroup.get("name").value,
      };
      this.userService.updateFacultyProfile(faculty).subscribe((data) => {
        if (data["status"] == "success") {
          let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
            duration: 3000,
          });
        } else {
          let snackBarRef = this.snackBar.open(
            "Session Timed Out! Please Sign in Again!",
            "Ok",
            {
              duration: 3000,
            }
          );
          this.login.signOut();
        }
      });
    }
  }

  addProgram() {
    if (this.programGroup.valid) {
      const programs = {
        programs: this.programGroup.get("programs").value,
      };
      this.userService.setPrograms(programs).subscribe((data) => {
        if (data["status"] == "success") {
          let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
            duration: 3000,
          });
          this.ngOnInit();
        } else {
          let snackBarRef = this.snackBar.open(
            "Session Timed Out! Please Sign in Again!",
            "Ok",
            {
              duration: 3000,
            }
          );
          this.login.signOut();
        }
      });
    }
  }

  deleteProgram(program) {
    const obj = {
      program: program,
    };

    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      data: {
        heading: "Confirm Deletion",
        message: "Are you sure you want to remove the branch",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        this.userService.deleteFacultyProgram(obj).subscribe((data) => {
          if (data["status"] == "success") {
            let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
              duration: 3000,
            });
            this.ngOnInit();
          } else {
            let snackBarRef = this.snackBar.open(
              "Session Timed Out! Please Sign in Again!",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.login.signOut();
          }
        });
      }
    });
  }
}
