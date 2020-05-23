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
import { MatTableDataSource, MatSnackBar } from "@angular/material";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoginComponent } from "../../shared/login/login.component";
import { UserService } from "src/app/services/user/user.service";
import { LoadingBarService } from "@ngx-loading-bar/core";
import { ShowAvailableProjectsComponent } from "../show-available-projects/show-available-projects.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-display-preferences",
  templateUrl: "./display-preferences.component.html",
  styleUrls: ["./display-preferences.component.scss"],
})
export class DisplayPreferencesComponent implements OnInit, OnDestroy {
  @Input() preferences: any = [];
  @Output() updateProjects = new EventEmitter<any>();

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(
    private projectService: ProjectsService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private projectComponent: ShowAvailableProjectsComponent
  ) {}

  ngOnInit() {}

  removeOnePreference(preference) {
    this.projectService
      .removeOneStudentPreference(preference)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {
          if (result["message"] == "invalid-token") {
            this.loginObject.signOut();
            this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
              duration: 3000,
            });
          } else if (result["message"] == "success") {
            this.preferences = this.preferences.filter((val) => {
              return val._id != preference._id;
            });
            this.updateProjects.emit(preference);
          }
        },
        () => {
          this.snackBar.open(
            "Some Error Occured! If the Error Persists Please re-authenticate",
            "OK",
            {
              duration: 3000,
            }
          );
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
