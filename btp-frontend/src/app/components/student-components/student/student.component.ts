import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UserService } from "src/app/services/user/user.service";
import { LoaderComponent } from "../../shared/loader/loader.component";
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { LoginComponent } from "./../../shared/login/login.component";

@Component({
  selector: "app-student",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.scss"],
  providers: [LoginComponent],
})
export class StudentComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();
  dialogRefLoad: any;

  constructor(
    private userService: UserService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private navbar: NavbarComponent
  ) {}
  user: any;
  details: any;
  loaded: boolean = false;
  publishStudents: boolean;
  publishFaculty: boolean;
  reviewContition: boolean;

  ngOnInit() {
    this.dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Loading. Please wait! ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.user = JSON.parse(localStorage.getItem("user"));
    this.user = this.userService
      .getStudentDetails(this.user.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        if (data["status"] == "invalid-token") {
          this.dialogRefLoad.close();
          this.navbar.role = "none";
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
          this.loginObject.signOut();
        } else if (data["status"] == "success") {
          this.details = data["user_details"];
          this.loaded = true;

          this.userService.getPublishMode("student").subscribe(
            (data) => {
              this.dialogRefLoad.close();
              if (data["status"] == "success") {
                this.publishStudents = data["studentPublish"];
                this.publishFaculty = data["facultyPublish"];
                if (
                  this.publishStudents == false &&
                  this.publishFaculty == true
                ) {
                  this.reviewContition = true;
                }
              }
            },
            () => {
              this.dialogRefLoad.close();
              this.snackBar.open(
                "Some Error Occured! Please re-authenticate.",
                "OK",
                {
                  duration: 3000,
                }
              );
              this.navbar.role = "none";
              this.loginObject.signOut();
            }
          );
        } else {
          this.dialogRefLoad.close();
          this.snackBar.open(
            "Some Error Occured! Please re-authenticate.",
            "OK",
            {
              duration: 3000,
            }
          );
          this.navbar.role = "none";
          this.loginObject.signOut();
        }
      });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
