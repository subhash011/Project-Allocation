import { LoginComponent } from "./../../shared/login/login.component";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { ShowPreferencesComponent } from "./../show-preferences/show-preferences.component";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-drag-drop",
  templateUrl: "./drag-drop.component.html",
  styleUrls: ["./drag-drop.component.scss"],
  providers: [LoginComponent]
})
export class DragDropComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private projectService: ProjectsService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit() {
    this.getAllStudentPreferences();
  }
  projects: any = [];
  preferenceArray: any = [];
  count = 0;
  preferences: any = [];
  disable = true;
  helperArray: any = [];
  lastDropped;
  contID: any;
  drop(event: CdkDragDrop<string[]>) {
    this.contID = Number(event.container.id.split("-")[3]);
    if (event.previousContainer === event.container) {
      if (this.contID % 2 != 0) {
        this.disable = false;
      }
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      if (this.contID % 2 != 0) {
        this.preferenceArray = event.container.data;
      } else {
        this.helperArray = event.container.data;
      }
    } else {
      this.disable = false;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      if (this.contID % 2 != 0) {
        this.preferenceArray = event.container.data;
        this.helperArray = event.previousContainer.data;
      } else {
        this.helperArray = event.container.data;
        this.preferenceArray = event.previousContainer.data;
      }
    }
  }
  getDisable() {
    return this.disable;
  }
  onSubmit() {
    var dialogRef;
    if (this.dialog.openDialogs.length == 0) {
      this.disable = true;
      dialogRef = this.dialog.open(ShowPreferencesComponent, {
        panelClass: "no-toolbar-padding",
        width: "800px",
        height: "800px",
        data: this.preferenceArray
      });
    }
    dialogRef.afterClosed().subscribe(result => {
      if (result == "success") {
        this.disable = true;
        this.snackBar.open("Preferences Saved Successfully", "OK", {
          duration: 3000
        });
      } else if (result == "error") {
        this.disable = false;
        this.snackBar.open("Some Error Occured! Try Again.", "OK", {
          duration: 3000
        });
      } else if (result == "invalid-token") {
        this.disable = false;
        this.snackBar.open("Please Sign In Again", "OK", {
          duration: 3000
        });
      }
    });
  }
  getAllStudentPreferences() {
    var tempArray: any;
    var tempPref: any;
    const user = this.projectService
      .getStudentPreference()
      .toPromise()
      .then(details => {
        if (details["message"] == "invalid-token") {
          this.loginObject.signOut();
          return null;
        }
        if (details) {
          this.preferences = details;
          tempPref = this.preferences.map(val => val._id);
          return details;
        }
      })
      .then(preferences => {
        if (preferences) {
          this.projectService
            .getAllStudentProjects()
            .toPromise()
            .then(projects => {
              tempArray = projects;
              for (const project of tempArray) {
                if (!tempPref.includes(project._id)) {
                  this.projects.push(project);
                }
              }
            });
        }
      });
  }
}
