import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  HostListener,
} from "@angular/core";
import {
  MatDialog,
  MatSnackBar,
  MatTableDataSource,
  MatTable,
} from "@angular/material";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoginComponent } from "../../shared/login/login.component";
import { UserService } from "src/app/services/user/user.service";
import { LoadingBarService } from "@ngx-loading-bar/core";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { SelectionModel } from "@angular/cdk/collections";
import { Router } from "@angular/router";
import { LoaderComponent } from "../../shared/loader/loader.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
@Component({
  selector: "app-show-available-projects",
  templateUrl: "./show-available-projects.component.html",
  styleUrls: ["./show-available-projects.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class ShowAvailableProjectsComponent implements OnInit, OnDestroy {
  @ViewChild("table", { static: false }) table: MatTable<any>;
  preferences: any = new MatTableDataSource([]);
  projects = new MatTableDataSource([]);
  expandedElement;
  tableHeight: number = window.innerHeight * 0.7;
  isAddDisabled: boolean = false;
  stage = 0;
  sidenavWidth: number = 50;
  isActive: boolean = false;
  indexHover: number = -1;
  showToggleOnSidenav: boolean = false;
  selection = new SelectionModel<any>(true, []);
  private ngUnsubscribe: Subject<any> = new Subject();
  displayedColumns = [
    "select",
    "Title",
    "Faculty",
    "Email",
    "Intake",
    "Actions",
  ];
  constructor(
    private dialog: MatDialog,
    private projectService: ProjectsService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private loadingBar: LoadingBarService,
    private router: Router,
    private userService: UserService
  ) {}
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.tableHeight = event.target.innerHeight * 0.7;
    if (event.target.innerWidth <= 1400) {
      this.showToggleOnSidenav = true;
      this.sidenavWidth = 100;
    } else {
      this.showToggleOnSidenav = false;
      this.sidenavWidth = 50;
    }
  }
  dialogRefLoad;
  ngOnInit() {
    this.dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Loading. Please wait! ...",
      disableClose: true,
      hasBackdrop: true,
    });
    if (this.isPrefenceEdit()) {
      this.preferences.data = [];
      this.projectService
        .getStudentPreference()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (result) => {
            this.dialogRefLoad.close();
            if (result && result["message"] == "success") {
              this.preferences.data = result["result"];
            } else if (result["message"] == "invalid-token") {
              this.loginObject.signOut();
              this.snackBar.open(
                "Session Expired! Please Sign In Again",
                "OK",
                {
                  duration: 3000,
                }
              );
              return null;
            }
          },
          () => {
            this.dialogRefLoad.close();
            this.snackBar.open(
              "Some Error Occured! If the Error Persists Please re-authenticate",
              "OK",
              {
                duration: 3000,
              }
            );
          }
        );
      return;
    }
    this.preferences.data = [];
    this.projects.data = [];
    this.userService
      .getStreamStage()
      .toPromise()
      .then((result) => {
        if (result["message"] == "success") {
          this.stage = result["result"];
        }
      });
    this.getAllStudentPreferences();
  }
  isPrefenceEdit() {
    return this.router.url.includes("preferences") ? true : false;
  }
  getAllStudentPreferences() {
    var tempArray: any;
    var tempPref: any;
    this.projectService
      .getStudentPreference()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {
          this.dialogRefLoad.close();
          if (result["message"] == "invalid-token") {
            this.loginObject.signOut();
            this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
              duration: 3000,
            });
            return null;
          } else if (result && result["message"] == "success") {
            this.preferences.data = result["result"];
            tempPref = this.preferences.data.map((val) => val._id);
            this.projectService
              .getAllStudentProjects()
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe((projects) => {
                if (
                  projects["message"] == "invalid-client" ||
                  projects["message"] == "invalid-token"
                ) {
                  this.loginObject.signOut();
                  this.snackBar.open(
                    "Session Expired! Please Sign In Again",
                    "OK",
                    {
                      duration: 3000,
                    }
                  );
                }
                tempArray = projects["result"];
                for (const project of tempArray) {
                  if (!tempPref.includes(project._id)) {
                    this.projects.data.push(project);
                  }
                }
                this.projects = new MatTableDataSource(this.projects.data);
                this.projects.filterPredicate = (data: any, filter: string) =>
                  !filter ||
                  data.faculty_name.toLowerCase().includes(filter) ||
                  data.title.toLowerCase().includes(filter) ||
                  data.description.toLowerCase().includes(filter);
                this.loadingBar.stop();
              });
          }
        },
        () => {
          this.dialogRefLoad.close();
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
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.projects.filter = filterValue.trim().toLowerCase();
  }
  isAllSelected() {
    const numSelected = this.selection.selected
      ? this.selection.selected.length
      : 0;
    const numRows = this.projects.data ? this.projects.data.length : 0;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.projects.data.forEach((row) => this.selection.select(row));
  }

  selectAll() {
    this.projects.data.forEach((row) => this.selection.select(row));
  }

  deselectAll() {
    this.selection.clear();
  }

  deselectProject(project) {
    this.selection.deselect(project);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row.position + 1
    }`;
  }

  addOnePreference(project) {
    if (this.stage >= 2) {
      this.snackBar.open("You cannot edit preferences anymore!", "Ok", {
        duration: 3000,
      });
      return;
    }
    var dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Adding Preference, Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.projectService
      .addOneStudentPreference(project)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {
          dialogRefLoad.close();
          if (result["message"] == "invalid-token") {
            this.loginObject.signOut();
            this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
              duration: 3000,
            });
          } else if (result["message"] == "success") {
            this.projects.data = this.projects.data.filter((val) => {
              return val._id != project._id;
            });
            this.preferences.data.push(project);
            this.preferences.data = [...this.preferences.data];
            this.deselectProject(project);
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
          this.snackBar.open("Some Error Occured! Try again later.", "OK", {
            duration: 3000,
          });
        }
      );
  }

  onSubmit(event) {
    if (this.stage >= 2) {
      this.snackBar.open("You cannot edit preferences anymore!", "Ok", {
        duration: 3000,
      });
      return;
    }
    var dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Adding to preferences, Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    const preference = this.selection.selected;

    this.projectService
      .appendStudentPreferences(preference)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (result) => {
          dialogRefLoad.close();
          const message = result["message"];
          this.deselectAll();
          if (message == "success") {
            this.preferences.data = [...this.preferences.data, ...preference];
            const preferenceId = preference.map((val) => val._id);
            this.projects.data = this.projects.data.filter((val) => {
              return preferenceId.indexOf(val._id) == -1;
            });
            this.snackBar.open("Added to preferences", "OK", {
              duration: 3000,
            });
          } else if (message == "invalid-token") {
            this.loginObject.signOut();
            this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
          } else if (message == "stage-ended") {
            this.snackBar.open(
              "Stage has ended! You cannot edit preferences anymore",
              "Ok",
              { duration: 3000 }
            );
          } else {
            this.snackBar.open("Some Error Occured! Try again later.", "OK", {
              duration: 3000,
            });
          }
        },
        () => {
          dialogRefLoad.close();
          this.snackBar.open("Some Error Occured! Try again later.", "OK", {
            duration: 3000,
          });
        }
      );
  }

  updateProjects(event) {
    this.projects.data.push(event);
    this.preferences.data = this.preferences.data.filter((val) => {
      return val._id != event._id;
    });
    this.expandedElement = null;
    this.table.renderRows();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
