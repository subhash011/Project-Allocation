import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-admin-content',
  templateUrl: './admin-content.component.html',
  styleUrls: ['./admin-content.component.scss']
})
export class AdminContentComponent implements OnInit {


  @Input() public faculty_projects

  constructor() { }

  ngOnInit() {
  }

}
