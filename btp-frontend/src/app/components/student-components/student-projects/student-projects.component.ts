import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginComponent } from "./../../shared/login/login.component";
import { UserService } from "./../../../services/user/user.service";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ThemePalette } from "@angular/material/core";
import { Subject } from "rxjs";
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: "app-student-projects",
  templateUrl: "./student-projects.component.html",
  styleUrls: ["./student-projects.component.scss"],
  providers: [LoginComponent],
})
export class StudentProjectsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(
    private projectService: ProjectsService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private navbar:NavbarComponent
  ) {}
  ngOnInit() {
    this.getStudentPreferences();
  }
  projects: any;
  preferences: any = [];
  background: ThemePalette = "primary";

  getStudentPreferences() {
    const user = this.projectService.getStudentPreference().subscribe(
      (details) => {
        if (details["message"] == "token-expired") {
          this.navbar.role = "none";
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
          this.loginObject.signOut();
        } else {
          this.preferences = details["result"];
        }
      },
      () => {
        this.snackBar.open("Some Error Occured! Try again later.", "OK", {
          duration: 3000,
        });
      }
    );
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
