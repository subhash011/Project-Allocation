import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "./../../shared/login/login.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProjectsService} from "./../../../services/projects/projects.service";
import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router, ParamMap} from "@angular/router";
import {UserService} from "src/app/services/user/user.service";
import {NavbarComponent} from "../../shared/navbar/navbar.component";
import {LoaderComponent} from "../../shared/loader/loader.component";

@Component({selector: "app-faculty", templateUrl: "./faculty.component.html", styleUrls: ["./faculty.component.scss"], providers: [LoginComponent]})
export class FacultyComponent implements OnInit {
    private id : string;

    public name : string;
    public project;
    public add : boolean;
    public empty = true;
    public stream : string;
    public projects;
    public student_list;
    public programs;
    public faculty_home : boolean = true;
    public program_details;
    public routeParams;
    public adminStage;
    public curr_program;
    public projectHomeDetails;
    public stageHomeDetails;
    public publishStudents;
    public publishFaculty;
    public non_student_list;
    public nonStudentData;
    public reorder;
    

    public studentData;

    constructor(private activatedRoute : ActivatedRoute, private userDetails : UserService, private router : Router, private snackBar : MatSnackBar, private loginService : LoginComponent, private projectService : ProjectsService, private userService : UserService, private navbar : NavbarComponent, private dialog : MatDialog) {}

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe((params : ParamMap) => {
            this.id = params.get("id");
        });
        this.studentData = {}
        this.nonStudentData = {}

        var dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Please wait ...",
            disableClose: true,
            hasBackdrop: true
        });

        this.userDetails.getFacultyDetails(this.id).subscribe((data) => {
            if (data["status"] == "success") {
                const user_info = data["user_details"];
                this.name = user_info.name;
                if (user_info.programs.length > 0) {
                    this.navbar.programsVisible = true;
                }
                this.navbar.programs = user_info.programs;
                this.activatedRoute.queryParams.subscribe((params) => {
                    this.routeParams = params;
                    if (params.mode == "programMode") {
                        this.faculty_home = false;
                    }
                    if (Object.keys(params).length === 0 && params.constructor === Object) {
                        this.stream = user_info.stream;
                    } else {
                        this.stream = params.abbr;
                        this.empty = true;
                    }

                    this.projectService.getFacultyProjects(this.stream).subscribe((data) => {
                        this.projects = data["project_details"];
                    }, () => {
                        dialogRefLoad.close();
                        this.navbar.role = "none";
                        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {duration: 3000});
                        this.loginService.signOut();
                    });

                    this.userService.getFacultyPrograms().subscribe((data) => {
                        dialogRefLoad.close();
                        if (data["status"] == "success") {
                            this.programs = data["programs"];

                            this.curr_program = this.programs.filter(val => val.short == this.stream)[0];

                            this.userService.facultyHomeDetails().subscribe((data) => {
                                data["stageDetails"].forEach((val) => {
                                    if (val.deadlines.length > 0) 
                                        val.deadlines = new Date(val.deadlines[val.deadlines.length - 1]);
                                     else 
                                        val.deadlines = null;
                                    
                                    for (let program of this.programs) {
                                        if (program.short == val.stream) {
                                            val.full = program.full;
                                        }
                                    }
                                });

                                this.stageHomeDetails = data["stageDetails"];
                                this.projectHomeDetails = data["projects"]
                                this.program_details = this.projectHomeDetails.filter(val => val.stream == this.stream);
                            }, () => {
                                dialogRefLoad.close();
                                this.navbar.role = "none";
                                this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {duration: 3000});
                                this.loginService.signOut();
                            });

                        }
                    }, () => {
                        dialogRefLoad.close();
                        this.navbar.role = "none";
                        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {duration: 3000});
                        this.loginService.signOut();
                    });

                    this.userService.getAdminInfo_program(this.stream).subscribe((data) => {
                        if (data["status"] == "success") {
                            this.adminStage = data["admin"].stage;
                        } else {
                            this.adminStage = undefined;
                        }
                    }, () => {
                        dialogRefLoad.close();
                        this.navbar.role = "none";
                        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {duration: 3000});
                        this.loginService.signOut();
                    });

                    this.userService.getPublishMode("faculty").subscribe((data) => {
                        if (data["status"] == "success") {
                            this.publishFaculty = data["facultyPublish"];
                            this.publishStudents = data["studentPublish"];
                        }
                    });

                }, () => {
                    dialogRefLoad.close();
                    this.snackBar.open("Some Error Occured! Please re-authenticate.", "OK", {duration: 3000});
                    this.navbar.role = "none";
                    this.loginService.signOut();
                });
            } else {
                dialogRefLoad.close();
                this.navbar.role = "none";
                this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {duration: 3000});
                this.loginService.signOut();
            }
        }, () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {duration: 3000});
            this.loginService.signOut();
        });
    }

    displayProject(project) {

        if (!this.studentData[project._id]) {
          var dialogRef = this.dialog.open(LoaderComponent, {
            data: "Please wait ....",
            disableClose: true,
            hasBackdrop: true
        });
            this.projectService.getStudentsApplied(project._id).subscribe((data) => {
                dialogRef.close();
                if (data["status"] == "success") {
                    this.student_list = data["students"];
                    this.non_student_list = data["non_students"];
                    if (this.adminStage < 2) {
                        let status = localStorage.getItem(project._id);
                        if(status && status == "true") {
                            return;
                        }
                        localStorage.setItem(project._id, "false");
                        this.student_list.sort((a, b) => {
                            return b.gpa - a.gpa;
                        });
                        this.non_student_list.sort((a,b)=>{
                            return b.gpa - a.gpa;
                        })
                    }
                    else if(this.reorder == -1){
                        this.non_student_list.sort((a,b)=>{
                            return b.gpa - a.gpa;
                        })
                    }
                    else if(this.reorder == 1){
                        this.student_list.sort((a, b) => {
                            return b.gpa - a.gpa;
                        });
                    }

                    this.studentData[project._id] = this.student_list;
                    this.nonStudentData[project._id] = this.non_student_list;

                } else {
                    this.navbar.role = "none";
                    this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {duration: 3000});
                    this.loginService.signOut();
                }
            }, () => {
                dialogRef.close();
                this.navbar.role = "none";
                this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {duration: 3000});
                this.loginService.signOut();
            });
        }
        else{
            this.student_list = this.studentData[project._id];
            this.non_student_list = this.nonStudentData[project._id];
        }

      
        this.project = project;
        this.add = false;
        this.empty = false;
    }
    addProject(state) {
        if (this.adminStage == undefined || this.adminStage == null) {
            this.add = !state;
            this.snackBar.open("You can't add projects till the admin sets the first deadline", "Ok", {duration: 3000});
        } else if (this.adminStage == 0) {
            this.add = state;
            this.empty = false;
        } else {
            this.add = !state;
            this.snackBar.open("Stage Deadline reached!! You can't add more projects!!", "Ok", {duration: 3000});
        }
    }

}
