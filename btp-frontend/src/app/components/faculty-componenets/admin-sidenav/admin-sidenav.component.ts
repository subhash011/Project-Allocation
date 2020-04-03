import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-sidenav',
  templateUrl: './admin-sidenav.component.html',
  styleUrls: ['./admin-sidenav.component.scss']
})
export class AdminSidenavComponent implements OnInit {

  @Output() facultyClicked = new EventEmitter<Event>();
  public selectedRow;
  @Input() public details;


  constructor() { }

  ngOnInit() {
  }


  onClick(faculty, index) {
    this.facultyClicked.emit(faculty);
    this.selectedRow = index;
  }


}
