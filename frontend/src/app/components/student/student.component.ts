import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDetailsService } from 'src/app/services/user-details.service';


@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {

  private id:String;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userDetails:UserDetailsService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params:ParamMap)=>{
       this.id = params.get('id')
       console.log(id)
    });

    this.userDetails.getStudentDetails(id)
      .subscribe((data)=>{
        console.log(data)
      },(error)=>{
        console.log(err)
      })


  }






}
