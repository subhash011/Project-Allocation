import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "src/app/services/user/user.service";
import { NavbarComponent } from "src/app/components/shared/navbar/navbar.component";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";
import { forkJoin } from "rxjs";
import { mergeMap } from "rxjs/operators";

@Component({
    selector: "app-faculty",
    templateUrl: "./faculty.component.html",
    styleUrls: [ "./faculty.component.scss" ]
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
    dialogRefLoad: MatDialogRef<any>;
    private id: string;

    constructor(
        private activatedRoute: ActivatedRoute,
        private snackBar: MatSnackBar,
        private projectService: ProjectsService,
        private userService: UserService,
        private navbar: NavbarComponent,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.id = localStorage.getItem("id");
        this.studentData = {};
        this.nonStudentData = {};
        const requests = [
            this.userService.getFacultyDetails(this.id),
            this.userService.getFacultyPrograms(),
            this.userService.getPublishMode("faculty"),
            this.userService.facultyHomeDetails()
        ];
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        forkJoin(requests).pipe(
            mergeMap((response: Array<HttpResponseAPI>) => {
                let i = 0;
                const facDetails = response[i++].result;
                const faculty = facDetails.faculty;
                this.name = faculty.name;
                if (faculty.programs.length > 0) this.navbar.programsVisible = true;
                this.navbar.programs = faculty.programs;
                /*faculty programs*/
                const facPrograms = response[i++].result;
                this.programs = facPrograms.programs;
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
                this.dialogRefLoad.close();
                return this.activatedRoute.queryParams;
            })
        ).subscribe((params) => {
            this.routeParams = params;
            if (params.mode == "programMode") {
                this.faculty_home = false;
            }
            if (Object.keys(params).length === 0 && params.constructor === Object) {
                this.stream = null;
                this.faculty_home = true;
            } else {
                this.getProgramDetails(params);
            }
        });
    }

    getProgramDetails(params) {
        this.empty = true;
        this.stream = params.abbr;
        this.curr_program = this.programs.filter((val) => val.short == this.stream)[0];
        this.program_details = this.projectHomeDetails.filter((val) => val.stream == this.stream);
        const requests2 = [
            this.projectService.getFacultyProjects(this.stream),
            this.userService.getAdminInfo_program(this.stream)
        ];
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        forkJoin(requests2).subscribe((response: Array<any>) => {
            let i = 0;
            /*projects*/
            const facProjects = response[i++].result;
            this.projects = facProjects.projects;
            /*admin programs*/
            const programAdmin = response[i++].result;
            this.adminStage = programAdmin?.admin?.stage;
            this.dialogRefLoad.close();
        }, () => {
            this.dialogRefLoad.close();
        });
    }

    homeClicked(event) {
        if (!event.changed) {
            this.empty = true;
            return;
        }
        if (event.change == "add") {
            this.projects.push(event.project);
        } else if (event.change == "delete") {
            this.projects = this.projects.filter((val) => {
                return val._id != event.project._id;
            });
        }
        this.empty = true;
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
