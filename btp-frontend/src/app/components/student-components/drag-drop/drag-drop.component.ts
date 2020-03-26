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
  styleUrls: ["./drag-drop.component.css"]
})
export class DragDropComponent {
  constructor(private dialog: MatDialog) {}
  projects = ["Get to work", "Pick up groceries", "Go home", "Fall asleep"];

  preferences = [
    "Get up",
    "Brush teeth",
    "Take a shower",
    "Check e-mail",
    "Walk dog"
  ];
  preferenceArray = this.preferences;
  helperArray = [];
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
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
      console.log("The dialog was closed");
    });
  }
}
