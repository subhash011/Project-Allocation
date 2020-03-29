import { MatDialog } from "@angular/material/dialog";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit, Input } from "@angular/core";
import { SubmitPopUpComponent } from "../submit-pop-up/submit-pop-up.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
  styleUrls: ["./content.component.scss"]
})
export class ContentComponent implements OnInit {
  @Input() public project;
  @Input() public add: boolean;
  @Input() public empty = true;
  @Input() public stream: string;
  @Input() public student_list;

  public ProjectForm = this.formBuilder.group({
    title: ["", Validators.required],
    duration: ["", Validators.required],
    studentIntake: ["", Validators.required],
    description: ["", Validators.required]
  });

  public EditForm = this.formBuilder.group({
    title: ["", Validators.required],
    duration: ["", Validators.required],
    studentIntake: ["", Validators.required],
    description: ["", Validators.required]
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private projectService: ProjectsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  onSubmit() {
    const project = {
      title: this.ProjectForm.get("title").value,
      duration: this.ProjectForm.get("duration").value,
      studentIntake: this.ProjectForm.get("studentIntake").value,
      description: this.ProjectForm.get("description").value,
      stream: this.stream
    };

    this.projectService.saveProject(project).subscribe(data => {
      console.log(data);

      if (data["save"] == "success") {
        this.empty = true;
      } else {
        this.empty = false;
      }
      //Display the messages using flash messages
    });
  }

  onEditSubmit(param) {
    // console.log(param);
    const project = {
      title: this.EditForm.get("title").value,
      duration: this.EditForm.get("duration").value,
      studentIntake: this.EditForm.get("studentIntake").value,
      description: this.EditForm.get("description").value,
      // stream: this.stream,
      project_id: param._id
    };
    let dialogRef = this.dialog.open(SubmitPopUpComponent, {
      height: "60%",
      width: "800px",
      data: project
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result["message"] == "submit") {
        this.snackBar.open("Successfully Updated", "Ok", {
          duration: 3000
        });
      }
    });
  }
  tabChange(event) {
    if (event.index == 2) {
      this.EditForm = this.formBuilder.group({
        title: [this.project.title, Validators.required],
        duration: [this.project.duration, Validators.required],
        studentIntake: [this.project.studentIntake, Validators.required],
        description: [this.project.description, Validators.required]
      });
    }
  }

  deleteProject(project) {
    console.log(project);
    this.projectService.deleteProject(project._id)
      .subscribe(data=>{
        console.log(data) //Reload the page
      })
  }
}
