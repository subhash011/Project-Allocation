import { LoadingBarService } from "@ngx-loading-bar/core";
import { HttpClient } from "@angular/common/http";
import { MailService } from "./../../../services/mailing/mail.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginComponent } from "./../../shared/login/login.component";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { UserService } from "src/app/services/user/user.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { identifierModuleUrl } from "@angular/compiler";

@Component({
  selector: "app-student",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.scss"],
  providers: [LoginComponent],
})
export class StudentComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(
    private userService: UserService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private mailService: MailService,
    private http: HttpClient,
    private loadingService: LoadingBarService
  ) {}
  user: any;
  details: any;
  loaded: boolean = false;
  publishStudents: boolean;
  publishFaculty: boolean;

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.user = this.userService
      .getStudentDetails(this.user.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        if (data["status"] == "invalid-token") {
          this.loginObject.signOut();
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
        } else if (data["status"] == "success") {
          this.details = data["user_details"];
          this.loaded = true;

          this.userService.getPublishMode("student").subscribe((data) => {
            if (data["status"] == "success") {
              this.publishStudents = data["studentPublish"];
              this.publishFaculty = data["facultyPublish"];
            }
          });
        } else {
          this.loginObject.signOut();
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
        }
      });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
