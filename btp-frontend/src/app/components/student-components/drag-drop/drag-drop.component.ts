import { ProjectsService } from "src/app/services/projects/projects.service";
import { ShowPreferencesComponent } from "./../show-preferences/show-preferences.component";
import { Component, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDragEnter,
  CdkDragExit
} from "@angular/cdk/drag-drop";
import { MatAccordion } from "@angular/material/expansion";

@Component({
  selector: "app-drag-drop",
  templateUrl: "./drag-drop.component.html",
  styleUrls: ["./drag-drop.component.scss"]
})
export class DragDropComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private projectService: ProjectsService
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
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      if (event.container.id == "cdk-drop-list-1") {
        this.disable = false;
      }
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      if (event.container.id == "cdk-drop-list-1") {
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
      console.log(event.container.id);
      if (event.container.id == "cdk-drop-list-1") {
        this.preferenceArray = event.container.data;
        this.helperArray = event.previousContainer.data;
      } else {
        this.helperArray = event.container.data;
        this.preferenceArray = event.previousContainer.data;
      }
    }
  }
  getDisable() {
    return this.disable || this.preferenceArray == [];
  }
  onSubmit() {
    var dialogRef;
    if (this.preferenceArray) {
      dialogRef = this.dialog.open(ShowPreferencesComponent, {
        width: "800px",
        height: "800px",
        data: this.preferenceArray
      });
    }

    dialogRef.afterClosed().subscribe(result => {
      if (result == "saved") {
        this.disable = true;
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
        if (details) {
          this.preferences = details;
          tempPref = this.preferences.map(val => val._id);
        }
        return details;
      })
      .then(preferences => {
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
      });
  }
}
