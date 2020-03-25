import { Component, OnInit } from "@angular/core";
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
  projects = ["Get to work", "Pick up groceries", "Go home", "Fall asleep"];

  preferences = [
    "Get up",
    "Brush teeth",
    "Take a shower",
    "Check e-mail",
    "Walk dog"
  ];
  preferenceArray = [];
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
    console.log(this.preferenceArray);
  }
}
