import { UserService } from 'src/app/services/user/user.service';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-faculty-home',
  templateUrl: './faculty-home.component.html',
  styleUrls: ['./faculty-home.component.scss']
})
export class FacultyHomeComponent implements OnInit {

  constructor(
    private userService: UserService
  ) { }

  public stageTableCols = ['Program','Stage','Time']
  public allProjectCols = []
  
  public stageDetails : any = new MatTableDataSource([]);
  currentTime: Date = new Date();

  ngOnInit() {
    this.userService.facultyHomeDetails()
      .subscribe(data=>{
        data["stageDetails"].forEach(val => {
          if(val.deadlines.length > 0)
            val.deadlines = new Date(val.deadlines[val.deadlines.length - 1]);
          else
            val.deadlines = null;
        })
        this.stageDetails.data = data["stageDetails"];

      })

  }

}
