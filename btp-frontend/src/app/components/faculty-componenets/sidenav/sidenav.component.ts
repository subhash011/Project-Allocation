import { MatDialog } from '@angular/material/dialog';
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
} from "@angular/core";
import {
  MatListOption,
  MatSelectionList,
  MatSnackBar,
} from "@angular/material";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"],
})
export class SidenavComponent implements OnInit {
  @Input() public projects;
  @Input() public empty: boolean;
  @Input() public programs;
  @Input() public programs_mode;
  @Input() public routeParams;
  @Output() projectClicked = new EventEmitter<Event>();
  @Output() addButton = new EventEmitter<Event>();
  @Output() programClicked = new EventEmitter<Event>();
  @ViewChild("included", { static: false }) includedProjects: MatSelectionList;

  public selectedRow;

  constructor(
    private router: Router,
    private projectService: ProjectsService,
    private snackbar: MatSnackBar,
    private dialog:MatDialog
  ) {}

  ngOnInit() {}

  displayAdd(event) {
    this.addButton.emit(event);
    this.empty = false;
    this.selectedRow = null;
  }

  includeProjects() {
    var toInclude = [];
    for (const project of this.includedProjects.selectedOptions.selected.values()) {
      toInclude.push(project.value);
    }
    for (const project of this.projects) {
      if (toInclude.indexOf(project._id) == -1) {
        project.isIncluded = false;
      } else {
        project.isIncluded = true;
      }
    }
    var dialogRef = this.dialog.open(LoaderComponent, {
      data: "Loading Please Wait ....",
      disableClose: true,
      hasBackdrop: true,
    });
    this.projectService.includeProjects(toInclude).subscribe((result) => {
      dialogRef.close();
      if (result["message"] == "success") {
        this.snackbar.open("Updated Project Preferences", "Ok", {
          duration: 3000,
        });
      }
    });
  }

  onClick(project, index) {
    this.projectClicked.emit(project);
    this.empty = false;
    this.selectedRow = index;
  }

  onProgramClick(program, index) {
    this.programClicked.emit(program);
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
