import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserDetailsService } from 'src/app/services/user-details.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  private id: string;
  public name: string;
  public email: string;
  private position : string;

  constructor(
    private userDetails : UserDetailsService,
    private activatedRoute: ActivatedRoute,
    private router : Router,
    private userDetailsService : UserDetailsService
  ) { }

  ngOnInit(): void {
  
    this.activatedRoute.paramMap.subscribe((params:ParamMap)=>{
      this.id = params.get('id')
      console.log(this.id)
   });


    this.userDetails.getDetailsById(this.id)
      .subscribe((data)=>{
        console.log(data)
        let u_data = data["user_details"]
        this.name = u_data.name ;
        this.email = u_data.email;
        this.position = data["position"]
        if(this.position == 'student'){
         //Render student view
        }
        else if(this.position == 'faculty'){
          //Render teacher view
        }
        else{
          this.router.navigate(['/error',u_data])
        }
       
      },(error)=>{
        this.router.navigate(['/error'])
      })
  
  
  }


  registerMe(){

    this.userDetailsService.registerUser(this.position,this.id/*,formData*/)
      .subscribe((data)=>{

        //Give a flash message 
        //Redirect to 
        if(this.position == 'student')
          this.router.navigate(['student',this.id])
        else{
          this.router.navigate(['faculty',this.id])
        }
      })



  }


}
