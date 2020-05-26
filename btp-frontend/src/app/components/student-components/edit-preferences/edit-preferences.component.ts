import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { MatDialog, MatSnackBar, MatTableDataSource } from "@angular/material";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoginComponent } from "../../shared/login/login.component";
import { UserService } from "src/app/services/user/user.service";
import { LoadingBarService } from "@ngx-loading-bar/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { takeUntil } from "rxjs/operators";
import {
  trigger,
  style,
  state,
  transition,
  animate,
} from "@angular/animations";
import { ShowAvailableProjectsComponent } from "../show-available-projects/show-available-projects.component";
import { LoaderComponent } from "../../shared/loader/loader.component";
import { Subject } from "rxjs";

@Component({
  selector: "app-edit-preferences",
  templateUrl: "./edit-preferences.component.html",
  styleUrls: ["./edit-preferences.component.scss"],
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", display: "none" })
      ),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("0ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class EditPreferencesComponent implements OnInit, OnDestroy {
  @Input() preferences: any = new MatTableDataSource([]);
  @Input() stage: number = 0;
  private ngUnsubscribe: Subject<any> = new Subject();
  finalPreferences: any = [];
  projects: any = [];
  expandedElement;
  loaded: boolean;
  disable: boolean;
  isExpansionDetailRow = (i: number, row: any) =>
    row.hasOwnProperty("detailRow");
  constructor(
    private projectService: ProjectsService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private loadingBar: LoadingBarService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {}

  displayedColumns = ["Title", "Faculty", "Email", "Intake", "Actions"];

  onSubmit() {
    if (this.stage >= 2) {
      this.snackBar.open("You cannot edit preferences anymore!", "Ok", {
        duration: 3000,
      });
      return;
    }
    var dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Saving preferences, Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.projectService
      .storeStudentPreferences(this.preferences.data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {
          dialogRefLoad.close();
          if (result["message"] == "success") {
            this.preferences.data = result["result"];
            this.snackBar.open("Preferences Saved Successfully", "OK", {
              duration: 3000,
            });
          } else if (result["message"] == "invalid-token") {
            this.disable = false;
            this.loginObject.signOut();
            this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
              duration: 3000,
            });
          } else {
            this.disable = false;
            this.snackBar.open(
              "Some Error Occured! If the Error Persists Please re-authenticate",
              "OK",
              {
                duration: 3000,
              }
            );
          }
        },
        () => {
          dialogRefLoad.close();
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
  removePreference(preference) {
    if (this.stage >= 2) {
      this.snackBar.open("You cannot edit preferences anymore!", "Ok", {
        duration: 3000,
      });
      return;
    }
    var dialogRef = this.dialog.open(LoaderComponent, {
      data: "Please wait ....",
      disableClose: true,
      hasBackdrop: true,
    });
    this.projectService
      .removeOneStudentPreference(preference)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {
          dialogRef.close();
          if (result["message"] == "invalid-token") {
            this.loginObject.signOut();
            this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
              duration: 3000,
            });
          } else if (result["message"] == "success") {
            this.preferences.data = this.preferences.data.filter((val) => {
              return val._id != preference._id;
            });
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
  drop(event: CdkDragDrop<any[]>) {
    const previousIndex = this.preferences.data.indexOf(event.item.data);
    moveItemInArray(event.container.data, previousIndex, event.currentIndex);
    this.preferences = new MatTableDataSource(event.container.data);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
