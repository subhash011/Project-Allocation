import { UserService } from 'src/app/services/user/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public details;


  constructor(
    private userService : UserService
  ) { }

  ngOnInit() {
    this.userService.Admin_getStreamDetails()
      .subscribe(data=>{
        console.log(data);
        this.details = data;
      })
  }



}
