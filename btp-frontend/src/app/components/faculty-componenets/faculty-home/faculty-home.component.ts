import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'app-faculty-home',
    templateUrl: './faculty-home.component.html',
    styleUrls: ['./faculty-home.component.scss'],
})
export class FacultyHomeComponent implements OnInit {
    public stageTableCols = ['Program', 'Abbreviation', 'Stage', 'Time'];
    public allProjectCols = [
        'Program',
        'Project',
        'StudentsApplied',
        'StudentIntake',
        'StudentsAlloted',
    ];
    @Input() projectDetails: any = new MatTableDataSource([]);
    @Input() stageDetails: any = new MatTableDataSource([]);
    @Input() publishFaculty;
    @Input() publishStudents;
    currentTime: Date = new Date();

    constructor() {}

    ngOnInit() {}

    sortStages(event) {
        const isAsc = event.direction == 'asc';
        this.stageDetails = this.stageDetails.sort((a, b) => {
            switch (event.active) {
                case 'Program':
                    return this.compare(a.full, b.full, isAsc);
                case 'Stage':
                    return this.compare(a.stage, b.stage, isAsc);
                case 'Abbreviation':
                    return this.compare(a.stream, b.stream, isAsc);
                default:
                    return 0;
            }
        });
        this.stageDetails = [...this.stageDetails];
    }

    sortProjectDetails(event) {
        const isAsc = event.direction == 'asc';
        this.projectDetails = this.projectDetails.sort((a, b) => {
            switch (event.active) {
                case 'Program':
                    return this.compare(a.stream, b.stream, isAsc);
                case 'Project':
                    return this.compare(a.stage, b.stage, isAsc);
                case 'StudentIntake':
                    return this.compare(a.studentIntake, b.studentIntake, isAsc);
                case 'StudentsApplied':
                    return this.compare(a.noOfPreferences, b.noOfPreferences, isAsc);
                default:
                    return 0;
            }
        });
        this.projectDetails = [...this.projectDetails];
    }

    compare(
        a: number | string | boolean,
        b: number | string | boolean,
        isAsc: boolean
    ) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
