import { Component, OnInit, ViewChild } from "@angular/core";
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
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { Router, ActivatedRoute } from "@angular/router";

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
export class ShowAvailableProjectsComponent implements OnInit {
  @ViewChild("table", { static: false }) table: MatTable<any>;
  preferences: any = new MatTableDataSource([]);
  projects = new MatTableDataSource([]);
  expandedElement;
  selection = new SelectionModel<any>(true, []);
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
    private cdRef: UserService,
    private loadingBar: LoadingBarService,
    private router: Router
  ) {}

  ngOnInit() {
    this.preferences.data = [];
    this.projects.data = [];
    this.getAllStudentPreferences();
  }
  isPrefenceEdit() {
    return this.router.url.includes("preferences") ? true : false;
  }
  getAllStudentPreferences() {
    var tempArray: any;
    var tempPref: any;
    const user = this.projectService
      .getStudentPreference()
      .toPromise()
      .then((details) => {
        if (details["message"] == "invalid-token") {
          this.loginObject.signOut();
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
          return null;
        }
        if (details) {
          this.preferences.data = details["result"];
          tempPref = this.preferences.data.map((val) => val._id);
          return details;
        }
      })
      .then((preferences) => {
        if (preferences) {
          this.projectService
            .getAllStudentProjects()
            .toPromise()
            .then((projects) => {
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
                data.title.toLowerCase().includes(filter);
              this.loadingBar.stop();
            });
        }
      })
      .catch(() => {
        this.loginObject.signOut();
        this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
          duration: 3000,
        });
      });
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
    this.projectService.addOneStudentPreference(project).subscribe((result) => {
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
        this.deselectProject(project);
      }
    });
  }

  onSubmit() {
    this.loadingBar.start();
    const preference = this.selection.selected;
    this.projectService
      .appendStudentPreferences(preference)
      .toPromise()
      .then((res) => {
        return res["message"];
      })
      .catch((err) => {
        this.loadingBar.stop();
        this.ngOnInit();
        this.snackBar.open("Some Error Occured! Try again later.", "OK", {
          duration: 3000,
        });
      })
      .then((message) => {
        this.ngOnInit();
        this.loadingBar.stop();
        this.deselectAll();
        if (message == "success") {
          this.snackBar.open("Added to preferences", "OK", {
            duration: 3000,
          });
        } else if (message == "invalid-token") {
          this.loadingBar.stop();
          this.loginObject.signOut();
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
        } else {
          this.loadingBar.stop();
          this.snackBar.open("Some Error Occured! Try again later.", "OK", {
            duration: 3000,
          });
        }
      });
  }
  updateProjects(event) {
    this.projects.data.push(event);
    this.preferences.data = this.preferences.data.filter((val) => {
      return val._id != event._id;
    });
    this.expandedElement = null;
    this.table.renderRows();
  }
}
