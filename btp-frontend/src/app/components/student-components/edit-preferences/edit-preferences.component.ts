import { Component, OnInit, Input } from "@angular/core";
import { MatDialog, MatSnackBar, MatTableDataSource } from "@angular/material";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoginComponent } from "../../shared/login/login.component";
import { UserService } from "src/app/services/user/user.service";
import { LoadingBarService } from "@ngx-loading-bar/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  trigger,
  style,
  state,
  transition,
  animate,
} from "@angular/animations";
import { ShowAvailableProjectsComponent } from "../show-available-projects/show-available-projects.component";

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
export class EditPreferencesComponent implements OnInit {
  @Input() preferences: any = new MatTableDataSource([]);
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
    private loadingBar: LoadingBarService
  ) {}

  ngOnInit() {}

  displayedColumns = ["Title", "Faculty", "Email", "Intake", "Actions"];

  onSubmit() {
    this.loadingBar.start();
    this.projectService
      .storeStudentPreferences(this.preferences.data)
      .toPromise()
      .then((res) => {
        if (res["message"] == "success") {
          this.preferences.data = res["result"];
        }
        return res["message"];
      })
      .catch((err) => {
        this.loadingBar.stop();
        this.disable = false;
        this.snackBar.open(
          "Some Error Occured! If the Error Persists Please re-authenticate",
          "OK",
          {
            duration: 3000,
          }
        );
      })
      .then((message) => {
        this.loadingBar.stop();
        if (message == "success") {
          this.disable = true;
          this.snackBar.open("Preferences Saved Successfully", "OK", {
            duration: 3000,
          });
        } else if (message == "invalid-token") {
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
      });
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
          this.finalPreferences = this.preferences = details["result"];
          tempPref = this.preferences.map((val) => val._id);
          this.preferences = new MatTableDataSource(this.preferences);
          return details;
        }
      })
      .then((preferences) => {
        if (preferences) {
          this.projectService
            .getAllStudentProjects()
            .toPromise()
            .then((projects) => {
              tempArray = projects["result"];
              for (const project of tempArray) {
                if (!tempPref.includes(project._id)) {
                  this.projects.push(project);
                }
              }
              this.loaded = true;
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

  removePreference(preference) {
    this.projectService
      .removeOneStudentPreference(preference)
      .subscribe((result) => {
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
      });
  }
  drop(event: CdkDragDrop<any[]>) {
    const previousIndex = this.preferences.data.indexOf(event.item.data);
    moveItemInArray(event.container.data, previousIndex, event.currentIndex);
    this.preferences = new MatTableDataSource(event.container.data);
  }
}
