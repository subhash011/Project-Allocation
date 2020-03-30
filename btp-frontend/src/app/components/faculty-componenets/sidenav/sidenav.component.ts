import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"]
})
export class SidenavComponent implements OnInit {
  @Input() public projects;
  @Input() public empty: boolean;
  @Output() projectClicked = new EventEmitter<Event>();
  @Output() addButton = new EventEmitter<Event>();

  public selectedRow;

  constructor() {}

  ngOnInit() {}

  displayAdd(event) {
    this.addButton.emit(event);
    this.empty = false;
    this.selectedRow = null;
  }

  onClick(project, index) {
    this.projectClicked.emit(project);
    this.empty = false;
    this.selectedRow = index;
  }
}
