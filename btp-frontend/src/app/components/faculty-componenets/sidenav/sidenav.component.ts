import { Router } from '@angular/router';
import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"]
})
export class SidenavComponent implements OnInit {
  @Input() public projects;
  @Input() public empty: boolean;
  @Input() public programs;
  @Input() public programs_mode;
  @Input() public routeParams;
  @Output() projectClicked = new EventEmitter<Event>();
  @Output() addButton = new EventEmitter<Event>();
  @Output() programClicked = new EventEmitter<Event>();

  public selectedRow;

  constructor(
    private router:Router
  ) {}

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


  onProgramClick(program,index){

    this.programClicked.emit(program);
    this.selectedRow = index;

  }

  displayHome(){
    let id = localStorage.getItem("id");
    this.router
      .navigateByUrl("/refresh", { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/faculty',id],{queryParams:{ name: this.routeParams.name, abbr: this.routeParams.abbr, mode:"programMode" }});
      });


  }

}
