import {MatDialog} from '@angular/material/dialog';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ProjectsService} from 'src/app/services/projects/projects.service';
import {LoaderComponent} from 'src/app/components/shared/loader/loader.component';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';

@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnChanges {
    @Input() public projects;
    @Input() public empty: boolean;
    @Input() public programs;
    @Input() public routeParams;
    @Input() public adminStage;
    @Output() projectClicked = new EventEmitter<Event>();
    @Output() addButton = new EventEmitter<Event>();
    @Output() homeClicked = new EventEmitter<any>();
    public selectedRow;
    selectedProjects: string[] = [];
    id: string;

    constructor(
        private projectService: ProjectsService,
        private snackbar: MatSnackBar,
        private dialog: MatDialog
    ) {
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (simpleChanges.projects && simpleChanges.projects.currentValue) {
            simpleChanges.projects.currentValue.forEach((val) => {
                if (val.isIncluded) {
                    this.selectedProjects.push(val._id);
                }
            });
        }
    }

    ngOnInit() {
        this.id = localStorage.getItem('id');
    }

    displayAdd(event) {
        this.addButton.emit(event);
        this.empty = false;
        this.selectedRow = null;
    }

    addToList(event) {
        if (event.checked) {
            this.selectedProjects.push(event.source.id);
        } else {
            this.selectedProjects = this.selectedProjects.filter((val) => val !== event.source.id);
        }
    }

    includeProjects() {
        const dialogRef = this.dialog.open(LoaderComponent, {
            data: 'Updating, Please wait ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        this.projectService.includeProjects(this.selectedProjects).subscribe((responseAPI: HttpResponseAPI) => {
            dialogRef.close();
            if (responseAPI.result.updated) {
                for (const project of this.projects) {
                    project.isIncluded = this.selectedProjects.indexOf(project._id) !== -1;
                }
                this.snackbar.open('Updated Project Preferences', 'Ok');
            }
        }, () => {
            dialogRef.close();
        });
    }

    onClick(project, index) {
        this.projectClicked.emit(project);
        this.empty = false;
        this.selectedRow = index;
    }

    async displayHome() {
        this.selectedRow = -1;
        this.homeClicked.emit({changed: false});
    }
}
