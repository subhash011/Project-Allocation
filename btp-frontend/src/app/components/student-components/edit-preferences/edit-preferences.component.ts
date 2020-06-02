import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  HostListener,
} from "@angular/core";
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
import { NavbarComponent } from '../../shared/navbar/navbar.component';

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
  disable: boolean;
  isExpansionDetailRow = (i: number, row: any) =>
    row.hasOwnProperty("detailRow");
  constructor(
    private projectService: ProjectsService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private navbar:NavbarComponent
  ) {}
  tableStyle;
  height: number = window.innerHeight;
  ngOnInit() {
    this.tableStyle = {
      "max-height.px": this.height - 64,
    };
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.height = event.target.innerHeight;
  }

  displayedColumns = [
    "Title",
    "Faculty",
    "Email",
    "Intake",
    "Actions",
    "Submit",
  ];

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
            this.navbar.role = "none";
            this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
              duration: 3000,
            });
            this.loginObject.signOut();
          } else if (result["message"] == "stage-ended") {
            this.snackBar.open(
              "Stage has ended! You cannot edit preferences anymore",
              "Ok",
              { duration: 3000 }
            );
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

  moveToTop(preference) {
    this.preferences.data = this.preferences.data.filter((val) => {
      return val._id != preference._id;
    });
    this.preferences.data.unshift(preference);
    this.preferences.data = [...this.preferences.data];
  }

  moveToBottom(preference) {
    this.preferences.data = this.preferences.data.filter((val) => {
      return val._id != preference._id;
    });
    this.preferences.data.push(preference);
    this.preferences.data = [...this.preferences.data];
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
            this.navbar.role = "none";
            this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
              duration: 3000,
            });
            this.loginObject.signOut();
          } else if (result["message"] == "stage-ended") {
            this.snackBar.open(
              "Stage has ended! You cannot edit preferences anymore",
              "Ok",
              { duration: 3000 }
            );
          } else if (result["message"] == "success") {
            this.preferences.data = this.preferences.data.filter((val) => {
              return val._id != preference._id;
            });
          }
        },
        () => {
          dialogRef.close();
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

  moveOneUp(project) {
    if (project == 0) {
      return;
    }
    moveItemInArray(this.preferences.data, project, project - 1);
    this.preferences.data = [...this.preferences.data];
  }

  moveOneDown(project) {
    if (project == this.preferences.data.length - 1) {
      return;
    }
    moveItemInArray(this.preferences.data, project, project + 1);
    this.preferences.data = [...this.preferences.data];
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
