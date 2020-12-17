import { MatDialog } from "@angular/material/dialog";
import { LoginComponent } from "src/app/components/shared/login/login.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { UserService } from "src/app/services/user/user.service";
import { NavbarComponent } from "src/app/components/shared/navbar/navbar.component";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";
import { forkJoin } from "rxjs";
import { map, mergeMap, take } from "rxjs/operators";

@Component({
    selector: "app-faculty",
    templateUrl: "./faculty.component.html",
    styleUrls: [ "./faculty.component.scss" ],
    providers: [ LoginComponent ]
})
export class FacultyComponent implements OnInit {
    public name: string;
    public project;
    public add: boolean;
    public empty = true;
    public stream: string;
    public projects;
    public student_list;
    public programs;
    public faculty_home: boolean = true;
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
    private id: string;

    constructor(
        private activatedRoute: ActivatedRoute,
        private userDetails: UserService,
        private router: Router,
        private snackBar: MatSnackBar,
        private loginService: LoginComponent,
        private projectService: ProjectsService,
        private userService: UserService,
        private navbar: NavbarComponent,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.id = localStorage.getItem("id");
        this.studentData = {};
        this.nonStudentData = {};
        const requests1 = [
            this.userDetails.getFacultyDetails(this.id),
            this.activatedRoute.queryParams.pipe(take(1)),
            this.userService.getFacultyPrograms(),
            this.userService.getPublishMode("faculty"),
            this.userService.facultyHomeDetails()
        ];
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        forkJoin(requests1)
            .pipe(map((response: Array<any>) => {
                    let i: number = 0;
                    /*faculty details*/
                    const facDetails = response[i++].result;
                    const faculty = facDetails.faculty;
                    this.name = faculty.name;
                    if (faculty.programs.length > 0) this.navbar.programsVisible = true;
                    this.navbar.programs = faculty.programs;
                    // /*route params*/
                    const params = response[i++] as Params;
                    this.routeParams = params;
                    if (params.mode == "programMode") {
                        this.faculty_home = false;
                    }
                    if (Object.keys(params).length === 0 && params.constructor === Object) {
                        this.stream = faculty.stream;
                    } else {
                        this.stream = params.abbr;
                        this.empty = true;
                    }
                    /*faculty programs*/
                    const facPrograms = response[i++].result;
                    this.programs = facPrograms.programs;
                    this.curr_program = this.programs.filter((val) => val.short == this.stream)[0];
                    /*publish mode*/
                    const programPublishMode = response[i++].result;
                    this.publishFaculty = programPublishMode.publishFaculty;
                    this.publishStudents = programPublishMode.publishStudents;
                    /*faculty home*/
                    const facHome = response[i++].result;
                    facHome.stageDetails.forEach((val) => {
                        if (val.deadlines.length > 0) {
                            val.deadlines = new Date(val.deadlines[val.deadlines.length - 1]);
                        } else {
                            val.deadlines = null;
                        }
                        for (let program of this.programs) {
                            if (program.short == val.stream) {
                                val.full = program.full;
                            }
                        }
                    });
                    this.stageHomeDetails = facHome.stageDetails;
                    this.projectHomeDetails = facHome.projects;
                    this.program_details = this.projectHomeDetails.filter((val) => val.stream == this.stream);
                    return this.stream;
                }),
                mergeMap((stream) => {
                    const requests2 = [
                        this.projectService.getFacultyProjects(stream),
                        this.userService.getAdminInfo_program(stream)
                    ];
                    return forkJoin(requests2);
                }))
            .subscribe((response: Array<any>) => {
                let i = 0;
                /*projects*/
                const facProjects = response[i++].result;
                this.projects = facProjects.projects;
                /*admin programs*/
                const programAdmin = response[i++].result;
                this.adminStage = programAdmin?.admin?.stage;
                dialogRefLoad.close();
            }, () => {
                console.log("here");
                dialogRefLoad.close();
            });
    }

    sortWithReorder() {
        if (this.reorder == 0) {
            this.student_list.sort((a, b) => {
                return b.gpa - a.gpa;
            });
            this.non_student_list.sort((a, b) => {
                return b.gpa - a.gpa;
            });
        } else if (this.reorder == -1) {
            this.non_student_list.sort((a, b) => {
                return b.gpa - a.gpa;
            });
        } else if (this.reorder == 1) {
            this.student_list.sort((a, b) => {
                return b.gpa - a.gpa;
            });
        }
    }

    changeReorder(event) {
        this.reorder = event[0];
        for (const project of this.projects) {
            if (project._id == event[1]) {
                project.reorder = event[0];
            }
        }
        if (event[3] == 0) {
            this.studentData[event[1]] = event[2];
        } else {
            this.nonStudentData[event[1]] = event[2];
        }
    }

    displayProject(project) {
        if (!this.studentData[project._id]) {
            const dialogRef = this.dialog.open(LoaderComponent, {
                data: "Loading, Please wait ...",
                disableClose: true,
                panelClass: "transparent"
            });
            this.projectService.getStudentsApplied(project._id).subscribe((responseAPI: HttpResponseAPI) => {
                dialogRef.close();
                this.student_list = responseAPI.result.students;
                this.non_student_list = responseAPI.result.non_students;
                this.reorder = responseAPI.result.reorder;
                this.sortWithReorder();
                this.studentData[project._id] = this.student_list;
                this.nonStudentData[project._id] = this.non_student_list;
            }, () => {
                dialogRef.close();
            });
        } else {
            this.student_list = this.studentData[project._id];
            this.non_student_list = this.nonStudentData[project._id];
            this.reorder = project["reorder"];
            this.sortWithReorder();
        }
        this.project = project;
        this.add = false;
        this.empty = false;
    }

    addProject(state) {
        if (this.adminStage == null) {
            this.add = !state;
            this.snackBar.open("You can't add projects till the admin sets the first deadline", "Ok");
        } else if (this.adminStage == 0) {
            this.add = state;
            this.empty = false;
        } else {
            this.add = !state;
            this.snackBar.open("Stage Deadline reached!! You can't add more projects!!", "Ok");
        }
    }
}
