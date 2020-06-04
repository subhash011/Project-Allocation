import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from "@angular/core";
import { MatTableDataSource, MatSnackBar, MatDialog } from "@angular/material";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoginComponent } from "../../shared/login/login.component";
import { UserService } from "src/app/services/user/user.service";
import { LoadingBarService } from "@ngx-loading-bar/core";
import { ShowAvailableProjectsComponent } from "../show-available-projects/show-available-projects.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LoaderComponent } from "../../shared/loader/loader.component";
import { NavbarComponent } from "../../shared/navbar/navbar.component";

@Component({
  selector: "app-display-preferences",
  templateUrl: "./display-preferences.component.html",
  styleUrls: ["./display-preferences.component.scss"],
})
export class DisplayPreferencesComponent implements OnInit, OnDestroy {
  @Input() preferences: any = [];
  @Output() updateProjects = new EventEmitter<any>();
  @Input() stage: number = 0;

  private ngUnsubscribe: Subject<any> = new Subject();
  isActive: boolean = false;
  indexHover: number = -1;
  constructor(
    private projectService: ProjectsService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private navbar: NavbarComponent
  ) {}

  ngOnInit() {}

  removeOnePreference(preference) {
    if (this.stage >= 2) {
      this.snackBar.open("You cannot edit preferences anymore!", "Ok", {
        duration: 3000,
      });
      return;
    }
    var dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Removing Preference, Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.projectService
      .removeOneStudentPreference(preference)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {
          dialogRefLoad.close();
          if (result["message"] == "invalid-token") {
            this.navbar.role = "none";
            this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
              duration: 3000,
            });
            this.loginObject.signOut();
          } else if (result["message"] == "success") {
            this.preferences = this.preferences.filter((val) => {
              return val._id != preference._id;
            });
            this.updateProjects.emit(preference);
          } else if (result["message"] == "stage-ended") {
            this.snackBar.open(
              "Stage has ended! You cannot edit preferences anymore",
              "Ok",
              { duration: 3000 }
            );
          }
        },
        () => {
          dialogRefLoad.close();
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
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
