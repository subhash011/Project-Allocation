import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
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
    private userDetails:UserDetailsService,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params:ParamMap)=>{
       this.id = params.get('id')
       console.log(this.id)
    });

    this.userDetails.getStudentDetails(this.id)
      .subscribe((data)=>{
        console.log(data) //Gets all student details --> Bind it to the template
      },(error)=>{
        console.log(error)
      })


  }






}