import { FacultyComponent } from "src/app/components/faculty/faculty.component";
import { LoginComponent } from "src/app/components/shared/login/login.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { FormBuilder, Validators } from "@angular/forms";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, Pipe, PipeTransform, SimpleChanges } from "@angular/core";
import { SubmitPopUpComponent } from "src/app/components/faculty/submit-pop-up/submit-pop-up.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "src/app/components/faculty/delete-pop-up/delete-pop-up.component";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";

@Pipe({
    name: "displayFacultyPublish"
})
export class FacultyPublish implements PipeTransform {
    transform(student) {
        return `${ student.name } (${ student.roll_no })`;
    }
}

@Component({
    selector: "app-content",
    templateUrl: "./content.component.html",
    styleUrls: [ "./content.component.scss" ],
    providers: [
        LoginComponent, FacultyComponent
    ]
})
export class ContentComponent implements OnInit, OnChanges {
    @Input() public project;
    @Input() public add: boolean;
    @Input() public empty = true;
    @Input() public stream: string;
    @Input() public student_list;
    @Input() public programs_mode: boolean;
    @Input() public program_details;
    @Input() public routeParams;
    @Input() public adminStage;
    @Input() public publishFaculty;
    @Input() public publishStudents;
    @Input() public non_student_list;
    @Input() public reorder;
    @Output() newReorder = new EventEmitter<any>();
    @Output() homeClick = new EventEmitter<any>();
    public id;
    public index = 0;
    dialogRefLoad: MatDialogRef<any>;
    Headers = [
        "Program", "Project", "StudentsApplied", "StudentIntake", "StudentsAlloted"
    ];
    public ProjectForm = this.formBuilder.group({
        title: [
            "", Validators.required
        ],
        duration: [
            "", Validators.compose([ Validators.required, Validators.min(1) ])
        ],
        studentIntake: [
            "", Validators.compose([ Validators.required, Validators.min(1) ])
        ],
        description: [
            "", Validators.required
        ]
    });
    public EditForm = this.formBuilder.group({
        title: [
            "", Validators.required
        ],
        duration: [
            "", Validators.compose([ Validators.required, Validators.min(1) ])
        ],
        studentIntake: [
            "", Validators.compose([ Validators.required, Validators.min(1) ])
        ],
        description: [
            "", Validators.required
        ]
    });

    constructor(
        private formBuilder: FormBuilder,
        private projectService: ProjectsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.id = localStorage.getItem("id");
    }

    ngOnChanges(simpleChanges: SimpleChanges): void {
        if (simpleChanges.empty) {
            this.empty = simpleChanges.empty.currentValue;
        }
        if (simpleChanges.project?.currentValue) {
            this.EditForm.setValue({
                title: simpleChanges.project.currentValue?.title,
                duration: simpleChanges.project.currentValue?.duration,
                studentIntake: simpleChanges.project.currentValue?.studentIntake,
                description: simpleChanges.project.currentValue?.description
            });
        }
    }

    changeReorder(event) {
        this.newReorder.emit(event);
    }

    async displayHome(fetchData?: any) {
        this.homeClick.emit(fetchData);
    }

    onSubmit() {
        const project = {
            title: this.ProjectForm.get("title").value.replace(/  +/g, " "),
            duration: this.ProjectForm.get("duration").value,
            studentIntake: this.ProjectForm.get("studentIntake").value,
            description: this.ProjectForm.get("description").value.replace(/  +/g, " "),
            program: this.stream
        };
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Updating, Please Wait ....",
            disableClose: true,
            panelClass: "transparent"
        });
        this.projectService.saveProject(project).subscribe((responseAPI: HttpResponseAPI) => {
            this.dialogRefLoad.close();
            const {updated} = responseAPI.result;
            let snackBarRef = this.snackBar.open(responseAPI.message, "Ok");
            if (updated) {
                snackBarRef.afterDismissed().subscribe(() => {
                    this.displayHome({changed: true, change: "add", project: responseAPI.result.project}).then(() => {});
                });
            }
        }, () => {
            this.dialogRefLoad.close();
            this.ngOnInit();
            this.snackBar.open("Some Error Occurred! Try again later.", "OK");
        });
    }

    onEditSubmit(param) {
        const project = {
            title: this.EditForm.get("title").value.replace(/  +/g, " "),
            duration: this.EditForm.get("duration").value,
            studentIntake: this.EditForm.get("studentIntake").value,
            description: this.EditForm.get("description").value.replace(/  +/g, " "),
            project_id: param._id
        };
        this.dialogRefLoad = this.dialog.open(SubmitPopUpComponent, {
            height: "200px",
            width: "400px",
            disableClose: true
        });
        this.dialogRefLoad.afterClosed().subscribe(({message}) => {
            this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                data: "Updating, Please wait ...",
                disableClose: true,
                panelClass: "transparent"
            });
            if (message == "submit") {
                this.projectService.updateProject(project).subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    this.project.title = project.title;
                    this.project.duration = project.duration;
                    this.project.studentIntake = project.studentIntake;
                    this.project.description = project.description;
                    this.snackBar.open(responseAPI.message, "Ok");
                }, () => {
                    this.dialogRefLoad.close();
                });
            } else {
                this.dialogRefLoad.close();
            }
        });
    }

    deleteProject(project) {
        this.dialogRefLoad = this.dialog.open(DeletePopUpComponent, {
            height: "200px",
            width: "400px",
            data: {
                message: "Are you sure you want to delete the project",
                heading: "Confirm Deletion"
            },
            disableClose: true
        });
        this.dialogRefLoad.afterClosed().subscribe(({message}) => {
            if (message == "submit") {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Updating, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.projectService.deleteProject(project._id).subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    if (responseAPI.result.deleted) {
                        let snackBarRef = this.snackBar.open(responseAPI.message, "Ok");
                        snackBarRef.afterDismissed().subscribe(() => {
                            this.displayHome({changed: true, change: "delete", project}).then(() => {});
                        });
                    } else {
                        this.snackBar.open(responseAPI.message, "Ok");
                    }
                }, () => {
                    this.dialogRefLoad.close();
                });
            }
        });
    }

    sortProjectDetails(event) {
        const isAsc = event.direction == "asc";
        this.program_details = this.program_details.sort((a, b) => {
            switch (event.active) {
                case "Program":
                    return this.compare(a.stream, b.stream, isAsc);
                case "Project":
                    return this.compare(a.stage, b.stage, isAsc);
                case "StudentIntake":
                    return this.compare(a.studentIntake, b.studentIntake, isAsc);
                case "StudentsApplied":
                    return this.compare(a.noOfPreferences, b.noOfPreferences, isAsc);
                default:
                    return 0;
            }
        });
        this.program_details = [ ...this.program_details ];
    }

    compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
