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
  transferArrayItem
} from "@angular/cdk/drag-drop";

@Component({
  selector: "app-drag-drop",
  templateUrl: "./drag-drop.component.html",
  styleUrls: ["./drag-drop.component.scss"]
})
export class DragDropComponent implements OnInit {
  preferenceArray: any;
  constructor(
    private dialog: MatDialog,
    private projectService: ProjectsService
  ) {}
  ngOnInit() {
    this.getAllStudentProjects();
    this.getAllStudentPreferences();
  }
  projects: any;
  preferences: any;
  disable = true;
  helperArray = [];
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
    } else {
      this.disable = false;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    if (event.container.id == "cdk-drop-list-1") {
      this.preferenceArray = event.container.data;
    } else {
      this.helperArray = event.container.data;
    }
  }
  onSubmit() {
    const dialogRef = this.dialog.open(ShowPreferencesComponent, {
      width: "800px",
      height: "800px",
      data: this.preferenceArray
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log("The dialog was closed");
    });
  }
  getAllStudentProjects() {
    const user = this.projectService
      .getAllStudentProjects()
      .toPromise()
      .then(details => {
        this.projects = details;
      });
  }
  getAllStudentPreferences() {
    const user = this.projectService
      .getStudentPreference()
      .toPromise()
      .then(details => {
        this.preferences = details;
      });
  }
}
