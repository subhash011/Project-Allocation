import { AddMapComponent } from "src/app/components/super-admin/add-map/add-map.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "src/app/components/faculty/delete-pop-up/delete-pop-up.component";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "src/app/services/user/user.service";
import { Component, HostListener, OnInit, Pipe, PipeTransform, ViewChild } from "@angular/core";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";
import { forkJoin } from "rxjs";

@Pipe({
    name: "getToolTipToRemoveFaculty"
})
export class FacultyTooltipSuper implements PipeTransform {
    transform(isAdmin, adminProgram, branch) {
        if (isAdmin) {
            if (adminProgram == branch) {
                return "Remove co-ordinator Status to delete the faculty";
            } else {
                return ("This faculty is a co-ordinator for " + adminProgram +
                    " please remove the co-ordinator status to remove the faculty"
                );
            }
        } else {
            return "";
        }
    }
}

@Component({
    selector: "app-super-admin",
    templateUrl: "./super-admin.component.html",
    styleUrls: [ "./super-admin.component.scss" ],
    animations: [
        trigger("detailExpand", [
            state("collapsed, void", style({
                height: "0px",
                minHeight: "0",
                display: "flex"
            })),
            state("expanded", style({height: "*"})),
            transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
            transition("expanded <=> void", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)"))
        ])
    ],
    providers: []
})
export class SuperAdminComponent implements OnInit {
    @ViewChild("table") table: MatTable<any>;
    dialogRefLoad: any;
    index = 0;
    background = "primary";
    projects: any = {};
    displayedColumnsFaculty: string[] = [
        "Name", "Stream", "Email-ID", "isAdmin", "Actions"
    ];
    displayedColumnsStudent: string[] = [
        "Name", "Email-ID", "CGPA", "isRegistered", "Actions"
    ];
    displayedColumnsProjects: string[] = [
        "Title", "Faculty", "Stream", "NoOfStudents", "Duration"
    ];
    displayedColumnsMaps: string[] = [
        "Branch", "Short", "Stage", "FacCount", "StudCount", "ProjCount", "Actions"
    ];
    displayedColumnsStreams: string[] = [
        "Stream", "Short", "Actions"
    ];
    faculties: any = {};
    students: any = {};
    faculty;
    project;
    tableHeight: number = window.innerHeight * 0.6;
    map;
    student;
    maps: any = [];
    streams: any = new MatTableDataSource([]);
    programs: any = new MatTableDataSource([]);
    hasAdmins = {};
    stages = {};
    expandedElement;
    isActive;
    indexHover;
    loaded = false;

    constructor(
        private userService: UserService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    @HostListener("window:resize", [ "$event" ]) onResize(event) {
        if (event.target.innerWidth <= 1400) {
            this.tableHeight = event.target.innerHeight * 0.6;
        } else {
            this.tableHeight = event.target.innerHeight * 0.6;
        }
    }

    ngOnInit() {
        const requests = [
            this.userService.getAllBranches(),
            this.userService.getAllMaps(),
            this.userService.getAllProjects(),
            this.userService.getAllAdminDetails(),
            this.userService.getAllFaculties(),
            this.userService.getAllStudents()
        ];
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, please wait.",
            disableClose: true,
            panelClass: "transparent"
        });
        forkJoin(requests).subscribe((response: Array<HttpResponseAPI>) => {
            /* Get all streams */
            this.streams.data = response[0].result.streams.map((val) => {
                return {
                    full: val.full,
                    short: val.short
                };
            });
            /* Get all programs */
            this.programs.data = response[1].result.programs.map((val) => {
                this.faculties[val.short] = new MatTableDataSource([]);
                this.students[val.short] = new MatTableDataSource([]);
                return {
                    full: val.full,
                    short: val.short
                };
            });
            /* Get all projects */
            for (const program of this.programs.data) {
                const projectsTemp = response[2].result.projects.filter((val) => {
                    return val.stream == program.short;
                });
                this.projects[program.short] = new MatTableDataSource(projectsTemp);
                this.sortProjects({
                    direction: "asc",
                    active: "Title"
                }, program);
                this.projects[program.short].filterPredicate = (data: any, filter: string) => !filter ||
                    data.faculty.toLowerCase().includes(filter) ||
                    data.title.toLowerCase().includes(filter) ||
                    data.description.toLowerCase().includes(filter);
            }
            /* Get all admins */
            const adminObj = response[3].result.admins;
            for (const program in adminObj) {
                if (adminObj.hasOwnProperty(program)) {
                    const admin = adminObj.program;
                    if (admin) {
                        this.stages[program] = admin.stage + (admin.stage == 4 ? 0 : 1
                        );
                    } else {
                        this.stages[program] = null;
                    }
                }
            }
            /* Get all faculties */
            for (const program of this.programs.data) {
                this.faculties[program.short] = new MatTableDataSource(response[4].result.faculties[program.short]);
                this.sortFaculties({
                    direction: "asc",
                    active: "Name"
                }, program);
                this.faculties[program.short].filterPredicate = (data: any, filter: string) => !filter ||
                    data.name.toLowerCase().includes(filter) ||
                    data.stream.toLowerCase().includes(filter) ||
                    data.email.toLowerCase().includes(filter);
                this.hasAdmins[program.short] = this.faculties[program.short].data.filter((val) => {
                    return (val.adminProgram && val.adminProgram == program.short
                    );
                }).length > 0;
            }
            /* Get all students */
            for (const branch of this.programs.data) {
                this.students[branch.short] = new MatTableDataSource(response[5].result.students[branch.short]);
                this.sortStudents({
                    direction: "asc",
                    active: "Name"
                }, branch);
                this.students[branch.short].filterPredicate = (data: any, filter: string) => !filter ||
                    data.name.toLowerCase().includes(filter) ||
                    data.roll_no.toLowerCase().includes(filter);
            }
            this.loaded = true;
            this.dialogRefLoad.close();
        }, () => {
            this.dialogRefLoad.close();
        });
    }

    getAllProjects() {
        const branches = this.programs.data;
        this.userService.getAllProjects().subscribe((responseAPI: HttpResponseAPI) => {
            for (const branch of branches) {
                const projectsTemp = responseAPI.result.projects.filter((val) => {
                    return val.stream == branch.short;
                });
                this.projects[branch.short] = new MatTableDataSource(projectsTemp);
                this.sortProjects({
                    direction: "asc",
                    active: "Title"
                }, branch);
                this.projects[branch.short].filterPredicate = (data: any, filter: string) => !filter ||
                    data.faculty.toLowerCase().includes(filter) ||
                    data.title.toLowerCase().includes(filter) ||
                    data.description.toLowerCase().includes(filter);
            }
        }, () => {
            this.dialogRefLoad.close();
        });
    }

    addAdmin(faculty, branch) {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Adding admin, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.userService.addAdmin(faculty._id, branch).subscribe(() => {
            this.dialogRefLoad.close();
            this.hasAdmins[branch] = true;
            for (const program of this.programs.data) {
                this.faculties[program.short].data = this.faculties[program.short].data.map((val) => {
                    if (val._id == faculty._id) {
                        val.isAdmin = true;
                        val.adminProgram = branch;
                    }
                    return val;
                });
            }
        }, () => {
            this.dialogRefLoad.close();
        });
    }

    removeAdmin(faculty, branch) {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Removing admin, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.userService.removeAdmin(faculty._id).subscribe((responseAPI: HttpResponseAPI) => {
            this.dialogRefLoad.close();
            this.hasAdmins[branch] = false;
            for (const program of this.programs.data) {
                this.faculties[program.short].data = this.faculties[program.short].data.map((val) => {
                    if (val._id == faculty._id) {
                        val.isAdmin = false;
                        val.adminProgram = responseAPI["result"];
                    }
                    return val;
                });
            }
        }, () => {
            this.dialogRefLoad.close();
        });
    }

    checkIfPresent(field, newValue) {
        let isPresent: boolean = false;
        switch (field) {
            case "programFull":
                for (const program of this.programs.data) {
                    if (program.full == newValue) {
                        isPresent = true;
                        break;
                    }
                }
                return isPresent;
            case "programShort":
                for (const program of this.programs.data) {
                    if (program.short == newValue) {
                        isPresent = true;
                        break;
                    }
                }
                return isPresent;
            case "streamFull":
                for (const stream of this.streams.data) {
                    if (stream.full == newValue) {
                        isPresent = true;
                        break;
                    }
                }
                return isPresent;
            case "streamShort":
                for (const stream of this.streams.data) {
                    if (stream.short == newValue) {
                        isPresent = true;
                        break;
                    }
                }
                return isPresent;
            default:
                return !isPresent;
        }
    }

    addPrograms() {
        let dialogRef = this.dialog.open(AddMapComponent, {
            width: "40%",
            data: {
                heading: "Program",
                message: "Are you sure you want to proceed to add program",
                add: "program"
            }
        });
        dialogRef.afterClosed().subscribe((data) => {
            if (data && data["message"] == "submit") {
                if (this.checkIfPresent("programFull", data.map.full) || this.checkIfPresent("programShort", data.map.short)) {
                    this.snackBar.open("Duplicate entries are not allowed! Enter a unique name for every field.", "Ok");
                    return;
                }
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Adding Program, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.addProgram(data["map"]).subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    const val = responseAPI.result.program;
                    const newMap = {
                        full: val.full,
                        short: val.short
                    };
                    this.programs.data.push(newMap);
                    this.programs.data = [ ...this.programs.data ];
                    this.faculties[val.short] = new MatTableDataSource([]);
                    this.students[val.short] = new MatTableDataSource([]);
                    this.projects[val.short] = new MatTableDataSource([]);
                    this.snackBar.open(responseAPI.message, "Ok");
                }, () => {
                    this.dialogRefLoad.close();
                });
            }
        });
    }

    addBranches() {
        let dialogRef = this.dialog.open(AddMapComponent, {
            width: "40%",
            data: {
                heading: "Stream",
                message: "Are you sure you want to proceed to add stream",
                add: "branch"
            }
        });
        dialogRef.afterClosed().subscribe((data) => {
            if (data && data["message"] == "submit") {
                if (this.checkIfPresent("streamFull", data.map.full) || this.checkIfPresent("streamShort", data.map.short)) {
                    this.snackBar.open("Duplicate entries are not allowed! Enter a unique name for every field.", "Ok");
                    return;
                }
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Updating, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.addStream(data["map"]).subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    const val = responseAPI.result.stream;
                    const newMap = {
                        full: val.full,
                        short: val.short
                    };
                    this.streams.data.push(newMap);
                    this.streams.data = [ ...this.streams.data ];
                    this.snackBar.open(responseAPI.message, "Ok");
                }, () => {
                    this.dialogRefLoad.close();
                });
            }
        });
    }

    deleteStream(stream) {
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: "200px",
            data: {
                heading: "Confirm Deletion",
                message: "Are you sure you want to remove the stream"
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result["message"] == "submit") {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Removing stream, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.removeStream(stream).subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    this.snackBar.open(responseAPI.message, "Ok");
                    this.streams.data = this.streams.data.filter((val) => val.short != stream.short);
                }, () => {
                    this.dialogRefLoad.close();
                });
            }
        });
    }

    deleteProgram(program) {
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: "200px",
            data: {
                heading: "Confirm Deletion",
                message: "Are you sure you want to remove the program"
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result["message"] == "submit") {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Removing Program, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.removeProgram(program).subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    this.snackBar.open(responseAPI.message, "Ok");
                    this.programs.data = this.programs.data.filter((val) => val.short != program.short);
                }, () => {
                    this.dialogRefLoad.close();
                });
            }
        });
    }

    deleteFaculty(faculty) {
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: "200px",
            data: {
                heading: "Confirm Removal",
                message: "Are you sure you want to remove this faculty"
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result["message"] == "submit") {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Removing faculty, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.removeFaculty(faculty._id).subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    for (const program of this.programs.data) {
                        this.faculties[program.short].data = this.faculties[program.short].data.filter((val) => val._id != faculty._id);
                        this.projects[program.short].data = this.projects[program.short].data.filter((val) => val.faculty_id !=
                            faculty._id);
                    }
                    this.snackBar.open(responseAPI.message, "OK");
                }, () => {
                    this.dialogRefLoad.close();
                });
            }
        });
    }

    deleteStudent(student) {
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: "200px",
            data: {
                heading: "Confirm Removal",
                message: "Are you sure you want to remove this student"
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result["message"] == "submit") {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Removing student, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.removeStudent(student._id).subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    this.students[student.stream].data = this.students[student.stream].data.filter((val) => val._id != student._id);
                    this.students[student.stream].data = [
                        ...this.students[student.stream].data
                    ];
                    this.snackBar.open(responseAPI.message, "OK");
                    this.getAllProjects();
                }, () => {
                    this.dialogRefLoad.close();
                });
            }
        });
    }

    applyFilter(event: Event, branch: any, who: string) {
        const filterValue = (event.target as HTMLInputElement
        ).value;
        if (who == "faculty") {
            this.faculties[branch.short].filter = filterValue.trim().toLowerCase();
        } else if (who == "student") {
            this.students[branch.short].filter = filterValue.trim().toLowerCase();
        } else if (who == "project") {
            this.projects[branch.short].filter = filterValue.trim().toLowerCase();
        }
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1
        ) * (isAsc ? 1 : -1
        );
    }

    sortFaculties(event, branch) {
        const isAsc = event.direction == "asc";
        this.faculties[branch.short].data = this.faculties[branch.short].data.sort((a, b) => {
            switch (event.active) {
                case "Name":
                    return this.compare(a.name, b.name, isAsc);
                default:
                    return 0;
            }
        });
    }

    sortStudents(event, branch) {
        const isAsc = event.direction == "asc";
        this.students[branch.short].data = this.students[branch.short].data.sort((a, b) => {
            switch (event.active) {
                case "Name":
                    return this.compare(a.name, b.name, isAsc);
                case "CGPA":
                    return this.compare(a.gpa, b.gpa, isAsc);
                case "isRegistered":
                    return this.compare(a.isRegistered, b.isRegistered, isAsc);
                default:
                    return 0;
            }
        });
    }

    sortProjects(event, branch) {
        const isAsc = event.direction == "asc";
        this.projects[branch.short].data = this.projects[branch.short].data.sort((a, b) => {
            switch (event.active) {
                case "Faculty":
                    return this.compare(a.faculty, b.faculty, isAsc);
                case "NoOfStudents":
                    return this.compare(a.numberOfPreferences, b.numberOfPreferences, isAsc);
                case "Duration":
                    return this.compare(a.duration, b.duration, isAsc);
                case "Title":
                    return this.compare(a.title, b.title, isAsc);
                default:
                    return 0;
            }
        });
    }

    checkStreamDuplicates(curMap, newMap) {
        const streams = this.streams.data;
        let presence = {
            full: 0,
            short: 0
        };
        for (const stream of streams) {
            if (stream.short == curMap.short) {
                continue;
            }
            presence.full += stream.full === newMap.full ? 1 : 0;
            presence.short += stream.short === newMap.short ? 1 : 0;
        }
        if (presence.full >= 1) {
            return 1;
        }
        if (presence.short >= 1) {
            return 2;
        }
        return 0;
    }

    checkProgramDuplicates(curMap, newMap) {
        const programs = this.programs.data;
        let presence = {
            full: 0,
            short: 0
        };
        for (const program of programs) {
            if (program.short == curMap.short) {
                continue;
            }
            presence.full += program.full == newMap.full ? 1 : 0;
            presence.short += program.short == newMap.short ? 1 : 0;
        }
        if (presence.full >= 1) {
            return 1;
        }
        if (presence.short >= 1) {
            return 2;
        }
        return 0;
    }

    updateStream(event, map) {
        let full = event.full;
        let short = event.short;
        let curMap = JSON.parse(JSON.stringify(map));
        if (full != map.full || short != map.short) {
            let status = this.checkStreamDuplicates(map, {
                full,
                short
            });
            if (status != 0) {
                this.snackBar.open("No changes made. Please check for duplicate entries!", "Ok");
            } else {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Updating, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.updateStream(map, {
                    full,
                    short
                }).subscribe((responseAPI: HttpResponseAPI) => {
                    this.dialogRefLoad.close();
                    for (const stream of this.streams.data) {
                        if (stream.short == curMap.short) {
                            stream.short = short.toUpperCase();
                            stream.full = full;
                        }
                    }
                    for (const program of this.programs.data) {
                        for (const faculty of this.faculties[program.short].data) {
                            if (faculty.stream == curMap.short) {
                                faculty.stream = short;
                            }
                            this.faculties[program.short].data = [
                                ...this.faculties[program.short].data
                            ];
                        }
                    }
                    this.streams.data = [ ...this.streams.data ];
                    this.snackBar.open(responseAPI.message, "Ok");
                }, () => {
                    this.dialogRefLoad.close();
                });
            }
        }
    }

    updateProgram(event, map) {
        let full = event.full;
        let short = event.short;
        let curMap = JSON.parse(JSON.stringify(map));
        if (full != curMap.full || short != curMap.short) {
            let status = this.checkProgramDuplicates(curMap, {
                full,
                short
            });
            if (status != 0) {
                this.snackBar.open("No changes made. Please check for duplicate entries!", "Ok");
            } else {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Updating, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService
                    .updateProgram(curMap, {
                        full,
                        short
                    })
                    .subscribe((responseAPI: HttpResponseAPI) => {
                        this.dialogRefLoad.close();
                        this.snackBar.open(responseAPI.message, "Ok");
                        for (const program of this.programs.data) {
                            if (program.short == curMap.short) {
                                program.short = short.toUpperCase();
                                program.full = full;
                            }
                        }
                        this.programs.data = [ ...this.programs.data ];
                        this.students[short] = this.students[curMap.short];
                        this.projects[short] = this.projects[curMap.short];
                        this.faculties[short] = this.faculties[curMap.short];
                        for (const program of this.programs.data) {
                            for (const faculty of this.faculties[program.short].data) {
                                if (faculty.isAdmin && faculty.adminProgram == curMap.short) {
                                    faculty.adminProgram = short;
                                }
                                this.faculties[program.short].data = [
                                    ...this.faculties[program.short].data
                                ];
                            }
                        }
                        for (const program of this.programs.data) {
                            this.hasAdmins[program.short] = this.faculties[program.short].data.filter((faculty) => {
                                if (faculty.isAdmin && faculty.adminProgram == program.short) {
                                    return faculty;
                                }
                            }).length > 0;
                        }
                    }, () => {
                        this.dialogRefLoad.close();
                    });
            }
        }
    }
}
