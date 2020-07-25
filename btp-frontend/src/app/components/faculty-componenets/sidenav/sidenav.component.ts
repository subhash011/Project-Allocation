import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  PipeTransform,
  Pipe,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import {
  MatListOption,
  MatSelectionList,
  MatSnackBar,
} from "@angular/material";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoaderComponent } from "../../shared/loader/loader.component";
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { LoginComponent } from "../../shared/login/login.component";

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"],
})
export class SidenavComponent implements OnInit, OnChanges {
  @Input() public projects;
  @Input() public empty: boolean;
  @Input() public programs;
  @Input() public routeParams;
  @Input() public adminStage;
  @Output() projectClicked = new EventEmitter<Event>();
  @Output() addButton = new EventEmitter<Event>();

  public selectedRow;
  selectedProjects:string[] = [];

  constructor(
    private router: Router,
    private projectService: ProjectsService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private navbar: NavbarComponent,
    private loginObject: LoginComponent
  ) {}

  ngOnChanges(simpleChanges:SimpleChanges) {
      if(simpleChanges.projects && simpleChanges.projects.currentValue) {
          simpleChanges.projects.currentValue.forEach(val => {
              if(val.isIncluded) {
                  this.selectedProjects.push(val._id);
              }
          });
      }
  }

  ngOnInit() {
      
  }

  displayAdd(event) {
    this.addButton.emit(event);
    this.empty = false;
    this.selectedRow = null;
  }

  addToList(event) {
      if(event.checked) {
          this.selectedProjects.push(event.source.id);
      } else {
          this.selectedProjects = this.selectedProjects.filter(val => val != event.source.id);
      }
  }

  includeProjects() {
    // var toInclude = [];
    // for (const project of this.includedProjects.selectedOptions.selected.values()) {
    //   toInclude.push(project.value);
    // }
    var dialogRef = this.dialog.open(LoaderComponent, {
      data: "Please wait ....",
      disableClose: true,
      hasBackdrop: true,
    });
    this.projectService.includeProjects(this.selectedProjects).subscribe(
      (result) => {
        dialogRef.close();
        if (result["message"] == "success") {
          for (const project of this.projects) {
            if (this.selectedProjects.indexOf(project._id) == -1) {
                project.isIncluded = false;
            } else {
                project.isIncluded = true;
            }
          }
          this.snackbar.open("Updated Project Preferences", "Ok", {
            duration: 3000,
          });
        }
      },
      () => {
        this.snackbar.open(
          "Some Error Occured! Please re-authenticate.",
          "OK",
          {
            duration: 3000,
          }
        );
        this.navbar.role = "none";
        this.loginObject.signOut();
      }
    );
  }

  onClick(project, index) {
    this.projectClicked.emit(project);
    this.empty = false;
    this.selectedRow = index;
  }

  displayHome() {
    let id = localStorage.getItem("id");
    this.router
      .navigateByUrl("/refresh", { skipLocationChange: true })
      .then(() => {
        this.router.navigate(["/faculty", id], {
          queryParams: {
            name: this.routeParams.name,
            abbr: this.routeParams.abbr,
            mode: "programMode",
          },
        });
      });
  }
}
