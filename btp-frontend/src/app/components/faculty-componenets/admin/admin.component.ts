import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { UserService } from 'src/app/services/user/user.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper, DateAdapter } from '@angular/material';
import { ThrowStmt, IfStmt } from '@angular/compiler';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public details; // For displaying the projects tab
  public faculty_projects;
 
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup : FormGroup;
  fourthFormGroup: FormGroup;
  minDate = new Date();

  public stage_no;
  dateSet = [];
  curr_deadline;

  //Progress Bar
  progress_value=0;
  startDate;


  //Buttons
  proceedButton1 = true;
  proceedButton2 = true;
  proceedButton3 = true;

  //Input 
  input1 = false;
  input2 = false;
  input3 = false;


  days_left:any = "Please Set the deadline";


  @ViewChild("stepper",{static:false}) stepper: MatStepper;


  constructor(
    private userService : UserService,
    private formBuilder : FormBuilder
  ) { }


  ngAfterViewInit() {
    setTimeout(()=>{
      for(let step = 0; step<this.stage_no;step++){
        this.stepper.next()
      }
    })
  }

  ngOnInit() {
  
 this.userService.getAdminInfo()
      .subscribe(data=>{

        console.log(data)
          this.stage_no = data["stage"];
          this.dateSet = data["deadlines"];
          this.startDate = data["startDate"];
      })

    this.curr_deadline = this.dateSet[this.dateSet.length - 1];

    if(this.dateSet[0]){
      this.input1 = true;
    }
    if(this.dateSet[1]){
      this.input2 = true;
    }
    if(this.dateSet[2]){
      this.input3 = true;
    }
   

    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: [this.dateSet[0],Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: [this.dateSet[1], Validators.required]
    });
    this.thirdFormGroup = this.formBuilder.group({
      thirdCtrl: [this.dateSet[2], Validators.required]
    });
    this.fourthFormGroup = this.formBuilder.group({
      fourthCtrl: [this.dateSet[3], Validators.required]
    });

    // this.curr_dealine= this.dateSet.pop();

    if(this.dateSet.length!=0){

      let today = new Date();


      this.days_left = this.daysBetween(today,this.curr_deadline);
    // console.log(this.progress_days)

      if(this.days_left == 0){
        this.proceedButton1 = true;
        this.proceedButton2 = true;
        this.proceedButton3 = true;
      }

    }
    

    this.userService.Admin_getStreamDetails()
      .subscribe(data=>{
        console.log(data);
        this.details = data["project_details"];
      })
  }

  proceed(){
    this.stage_no++;
    //Backend call update stage_no;
    //Backend -> Update stage

    this.userService.updateStage(this.stage_no)
      .subscribe(data=>{
        console.log(data)
      })

    this.progress_value = 0;
    this.days_left = "Please Set the deadline"
    console.log('this')
  }

  daysBetween(date1, date2 ) {
    //Get 1 day in milliseconds
    var one_day=1000*60*60*24;
  
    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
  
    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
      
    if(difference_ms < 0 ){
      return 0;
    }

    // Convert back to days and return
    return Math.round(difference_ms/one_day); 
  }

  setDeadline(){

    //Backend Call for setting the deadline only on confirmation

  }


  displayFaculty(faculty){


    // console.log(faculty)
    this.faculty_projects = faculty["projects"]
  }



} 
