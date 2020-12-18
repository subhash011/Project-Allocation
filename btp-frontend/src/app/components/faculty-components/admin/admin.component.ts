import { ExporttocsvService } from "src/app/services/exporttocsv/exporttocsv.service";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoginComponent } from "src/app/components/shared/login/login.component";
import { MailService } from "src/app/services/mailing/mail.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "src/app/components/faculty-components/delete-pop-up/delete-pop-up.component";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "src/app/services/user/user.service";
import { Component, HostListener, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild } from "@angular/core";
import { MatStepper } from "@angular/material/stepper";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { ResetComponent } from "src/app/components/faculty-components/reset/reset.component";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { ShowStudentPreferencesComponent } from "src/app/components/faculty-components/show-student-preferences/show-student-preferences.component";
import { ShowFacultyPreferencesComponent } from "src/app/components/faculty-components/show-faculty-preferences/show-faculty-preferences.component";
import { saveAs } from "file-saver";
import * as moment from "moment";
import { NavbarComponent } from "src/app/components/shared/navbar/navbar.component";
import { forkJoin } from "rxjs";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";

@Pipe({
    name: "getViolations"
})
export class GetViolations implements PipeTransform {
    transform(stCap, prCap, stPerFac, tooltip?: boolean) {
        let violations = [];
        let flag = true;
        if (stCap) {
            flag = false;
            violations.push("SPP");
        }
        if (prCap) {
            flag = false;
            violations.push("PFE");
        }
        if (stPerFac) {
            flag = false;
            violations.push("SPF");
        }
        if (flag && !tooltip) {
            return "None";
        }
        if (tooltip && violations.length != 0) {
            return "Some faculty has a violation, head to the manage tab to check the violations.";
        }
        return violations.join(", ");
    }
}

@Pipe({
    name: "getExportDisabled"
})
export class GetExportDisabled implements PipeTransform {
    transform(value) {
        if (value) {
            return "You cannot export preferences till the results are either published to the faculties or to the students.";
        }
        return "Export allocation";
    }
}

@Pipe({
    name: "getTotalIntake"
})
export class TotalIntake implements PipeTransform {
    transform(filteredData) {
        let total = 0;
        let included = 0;
        filteredData.forEach((faculty) => {
            total += faculty.total_studentIntake;
            included += faculty.included_studentIntake;
        });
        return `${ included } / ${ total }`;
    }
}

@Pipe({
    name: "proceedPipe"
})
export class ProceedPipe implements PipeTransform {
    transform(value, studentCount, proceedButton, total_intake, emailButton, student_flag) {
        if (studentCount > total_intake) {
            return "Number of students are greater than the number of projects that can be alloted.";
        } else {
            if (emailButton) {
                return "Please set the deadline in order to proceed to the next stage.";
            }
            switch (value) {
                case "1":
                    if (proceedButton) {
                        return "Some faculties have violated the presets. Please navigate to Manage->Faculty to view the violations.";
                    } else {
                        return "Proceed";
                    }
                case "2":
                    if (student_flag) {
                        return "Please ensure that all the students are registered or remove unregistered students to proceed further.";
                    } else if (proceedButton) {
                        return "Some faculties have violated the presets. Please navigate to Manage->Faculty to view the violations.";
                    } else {
                        return "Proceed";
                    }
                case "3":
                    if (proceedButton) {
                        return "Some faculties have violated the presets. Please navigate to Manage->Faculty to view the violations.";
                    } else {
                        return "Proceed";
                    }
            }
        }
    }
}

@Pipe({
    name: "selectedLength"
})
export class SelectedLength implements PipeTransform {
    transform(selected, filteredData) {
        selected = selected.map((val) => val._id);
        filteredData = filteredData.map((val) => val._id);
        let count = 0;
        selected.forEach((project) => {
            count += filteredData.indexOf(project) != -1 ? 1 : 0;
        });
        return count;
    }
}

@Pipe({
    name: "getAllotedStudents"
})
export class AllotedStudents implements PipeTransform {
    transform(alloted) {
        let ans = "";
        for (const allot of alloted) {
            ans += allot.name + ", ";
        }
        ans = ans.substring(0, ans.length - 2);
        return ans;
    }
}

@Pipe({
    name: "getIncludedOfTotal"
})
export class GetIncludedOfTotal implements PipeTransform {
    transform(faculties) {
        let included = 0;
        let total = 0;
        faculties.forEach((faculty) => {
            included += faculty.includedProjectsCount;
            total += faculty.noOfProjects;
            return;
        });
        return included + " / " + total;
    }
}

@Pipe({
    name: "getStudentIntake"
})
export class StudentIntake implements PipeTransform {
    transform(projects) {
        let sum = 0;
        for (let project of projects) {
            sum += project.studentIntake;
        }
        return sum;
    }
}

@Pipe({
    name: "getActiveProjects"
})
export class ActiveProjects implements PipeTransform {
    transform(projects) {
        let sum = 0;
        projects.forEach((project) => {
            if (project.isIncluded) {
                sum++;
            }
        });
        return sum;
    }
}

@Component({
    selector: "app-admin",
    templateUrl: "./admin.component.html",
    styleUrls: [ "./admin.component.scss" ],
    providers: [ LoginComponent ]
})
export class AdminComponent implements OnInit, OnDestroy {
    public details; // For displaying the projects tab
    public fileToUpload: File = null;
    projectTableHeight: number = window.innerHeight * 0.6;
    studentTableHeight: number = window.innerHeight * 0.6;
    columns: string[] = [
        "select",
        "Title",
        "studentIntake",
        "Faculty",
        "Duration",
        "Preferences",
        "isIncluded",
        "Student"
    ];
    facultyCols = [
        "Name",
        "NoOfProjects",
        "StudentIntake",
        "Email",
        "Actions",
        "Violations"
    ];
    studentCols = [
        "Name",
        "Email",
        "GPA",
        "Registered",
        "ViewPref",
        "Actions"
    ];
    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;
    thirdFormGroup: FormGroup;
    fourthFormGroup: FormGroup;
    fifthFormGroup: FormGroup;
    sixthFormGroup: FormGroup;
    seventhFormGroup: FormGroup;
    public programName;
    public stage_no;
    dateSet = [];
    curr_deadline;
    startDate;
    minDate;
    isActive: boolean = false;
    indexHover: number = -1;
    projects: any = [];
    background = "primary";
    //Buttons
    student_flag = 0;
    proceedButton1 = true;
    proceedButton2 = true;
    proceedButton3 = true;
    proceedButton1_ = true;
    proceedButton2_ = true;
    proceedButton3_ = true;
    publishStudents = true;
    publishFaculty = true;
    index;
    faculties: any = new MatTableDataSource([]);
    students: any = new MatTableDataSource([]);
    student;
    faculty;
    exportDisabled: boolean;
    total_intake = 0;
    studentsPerFaculty;
    projectCap;
    studentCap;
    studentCount = 0;
    project: any;
    dataSource: any = new MatTableDataSource([]);
    selection = new SelectionModel(true, []);
    @ViewChild("stepper") stepper: MatStepper;
    timer;
    currentTime: Date = new Date();

    constructor(
        private userService: UserService,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private mailer: MailService,
        private projectService: ProjectsService,
        private loginService: LoginComponent,
        private exportService: ExporttocsvService,
        private navbar: NavbarComponent
    ) {
        this.firstFormGroup = this.formBuilder.group({
            firstCtrl: [ this.dateSet[0] ]
        });
        this.secondFormGroup = this.formBuilder.group({
            secondCtrl: [ this.dateSet[1] ]
        });
        this.thirdFormGroup = this.formBuilder.group({
            thirdCtrl: [ this.dateSet[2] ]
        });
        this.fourthFormGroup = this.formBuilder.group({
            fourthCtrl: [ this.dateSet[3] ]
        });
        this.fifthFormGroup = this.formBuilder.group({
            fifthCtrl: [ this.projectCap, Validators.min(1) ]
        });
        this.sixthFormGroup = this.formBuilder.group({
            sixthCtrl: [ this.studentCap, Validators.min(1) ]
        });
        this.seventhFormGroup = this.formBuilder.group({
            seventhCtrl: [ this.studentsPerFaculty, Validators.min(1) ]
        });
    }

    @HostListener("window:resize", [ "$event" ]) onResize(event) {
        if (event.target.innerHeight <= 1400) {
            this.projectTableHeight = event.target.innerHeight * 0.6;
            this.studentTableHeight = event.target.innerHeight * 0.6;
        } else {
            this.projectTableHeight = event.target.innerHeight * 0.6;
            this.studentTableHeight = event.target.innerHeight * 0.6;
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (this.stage_no == 1) {
                if (this.stepper.selectedIndex == 0) {
                    this.stepper.next();
                }
            }
            if (this.stage_no == 2) {
                if (this.stepper.selectedIndex == 0) {
                    this.stepper.next();
                    this.stepper.next();
                }
            }
            if (this.stage_no >= 3) {
                if (this.stepper.selectedIndex == 0) {
                    this.stepper.next();
                    this.stepper.next();
                    this.stepper.next();
                }
            }
        });
    }

    ngOnInit() {
        this.exportDisabled = false;
        if (localStorage.getItem("allocationMap")) {
            this.discardAllocation();
        }
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.timer = setInterval(() => {
            this.currentTime = new Date();
        }, 60000);
        const requests = [
            this.userService.getAdminInfo(),
            this.userService.getMembersForAdmin(),
            this.projectService.getAllStreamProjects()
        ];
        forkJoin(requests).subscribe((response: Array<any>) => {
            const adminInfo = (response[0] as HttpResponseAPI).result;
            /* admin info*/
            this.programName = adminInfo.stream;
            this.stage_no = adminInfo.stage;
            this.dateSet = adminInfo.deadlines;
            this.projectCap = adminInfo.projectCap;
            this.studentCap = adminInfo.studentCap;
            this.studentsPerFaculty = adminInfo.studentsPerFaculty;
            this.publishFaculty = adminInfo.publishFaculty;
            this.publishStudents = adminInfo.publishStudents;
            this.dateSet = this.dateSet.map((date) => new Date(date));
            this.startDate = adminInfo["startDate"];
            this.ngAfterViewInit();
            this.curr_deadline = this.dateSet[this.dateSet.length - 1];
            this.firstFormGroup.controls["firstCtrl"].setValue(this.dateSet[0]);
            this.secondFormGroup.controls["secondCtrl"].setValue(this.dateSet[1]);
            this.thirdFormGroup.controls["thirdCtrl"].setValue(this.dateSet[2]);
            this.fifthFormGroup.controls["fifthCtrl"].setValue(this.projectCap);
            this.sixthFormGroup.controls["sixthCtrl"].setValue(this.studentCap);
            this.seventhFormGroup.controls["seventhCtrl"].setValue(this.studentsPerFaculty);
            /*members for admin*/
            const adminMembers = (response[1] as HttpResponseAPI).result;
            this.faculties.data = adminMembers.users.faculties;
            this.faculties.data.forEach((faculty) => {
                this.total_intake += faculty.included_studentIntake;
            });
            this.students.data = adminMembers.users.students;
            this.sortStudents({
                direction: "asc",
                active: "Email"
            });
            this.studentCount = adminMembers.users.students.length;
            this.faculties.filterPredicate =
                (data: any, filter: string) => !filter || data.name.toLowerCase().includes(filter) ||
                    data.email.toLowerCase().includes(filter);
            this.students.filterPredicate =
                (data: any, filter: string) => !filter || data.name.toLowerCase().includes(filter) ||
                    data.email.toLowerCase().includes(filter);
            let flag = false;
            for (const faculty of this.faculties.data) {
                if (faculty.project_cap || faculty.student_cap || faculty.studentsPerFaculty) {
                    this.proceedButton1_ = true;
                    this.proceedButton2_ = true;
                    this.proceedButton3_ = true;
                    flag = true;
                    break;
                }
            }
            this.student_flag = 0;
            for (let student of this.students.data) {
                if (student.isRegistered == false) {
                    this.student_flag = 1;
                }
            }
            this.getAllocationValidation(flag, this.student_flag);
            /*projects*/
            const {projects} = (response[2] as HttpResponseAPI).result;
            this.projects = projects;
            this.dataSource.data = this.projects;
            this.dataSource.filterPredicate = (data: any, filter: string) => !filter || data.faculty.toLowerCase().includes(filter) ||
                data.title.toLowerCase().includes(filter) ||
                data.description.toLowerCase().includes(filter);
            this.selectIncluded();
            dialogRefLoad.close();
        }, () => {
            dialogRefLoad.close();
        });
    }

    getTooltipInclusion(project) {
        return project.isIncluded ? null : "This faculty has excluded the project. Contact the faculty if needed.";
    }

    proceed() {
        const dialogRef = this.dialog.open(DeletePopUpComponent, {
            width: "400px",
            height: "250px",
            data: {
                heading: "Confirm Proceed",
                message: "Please ensure that mails have been sent. Are you sure you want to proceed to the next stage?"
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result["message"] == "submit") {
                const dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Updating, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                let requests = [
                    this.userService.updateStage(this.stage_no + 1)
                ];
                if (this.stage_no >= 2) {
                    requests.push(this.exportService.generateCSV_projects(), this.exportService.generateCSV_students());
                }
                forkJoin(requests).subscribe(() => {
                    this.stage_no++;
                    this.stepper.next();
                    this.proceedButton1 = true;
                    this.proceedButton2 = true;
                    this.proceedButton3 = true;
                    let snackBarRef = this.snackBar.open("Successfully moved to the next stage!", "Ok");
                    snackBarRef.afterDismissed().subscribe(() => {
                        if (this.stage_no >= 3) {
                            this.snackBar.open("Please go to the project tab to start the allocation", "Ok", {
                                duration: 5000
                            });
                        }
                    });
                    dialogRefLoad.close();
                }, () => {
                    dialogRefLoad.close();
                });
            }
        });
    }

    discardAllocation() {
        localStorage.removeItem("allocationMap");
    }

    removeFaculty(id) {
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: "200px",
            width: "300px",
            data: {
                heading: "Confirm Deletion",
                message: "Are you sure you want to remove the Faculty?"
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result["message"] == "submit") {
                const dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Removing, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.removeFacultyAdmin(id).subscribe((responseAPI: HttpResponseAPI) => {
                    dialogRefLoad.close();
                    this.faculties.data = this.faculties.data.filter((val) => {
                        return val._id != id;
                    });
                    this.dataSource.data = this.dataSource.data.filter((val) => {
                        return val.faculty_id != id;
                    });
                    this.snackBar.open(responseAPI.message, "Ok");
                }, () => {
                    dialogRefLoad.close();
                });
            }
        });
    }

    removeStudent(student) {
        const id = student._id;
        let dialogRef = this.dialog.open(DeletePopUpComponent, {
            height: "200px",
            width: "300px",
            data: {
                heading: "Confirm Deletion",
                message: "Are you sure you want to remove the Student?"
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result["message"] == "submit") {
                const dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Removing, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.removeStudentAdmin(id).subscribe((responseAPI: HttpResponseAPI) => {
                    dialogRefLoad.close();
                    this.studentCount--;
                    this.students.data = this.students.data.filter((val) => {
                        return val._id != id;
                    });
                    this.dataSource.data.forEach((project) => {
                        project.students_id = project.students_id.filter((val) => {
                            return (val.roll_no != student.email.split("@")[0]);
                        });
                    });
                    this.snackBar.open(responseAPI.message, "Ok");
                }, () => {
                    dialogRefLoad.close();
                });
            }
        });
    }

    setDeadline() {
        let date;
        this.curr_deadline = this.dateSet[this.dateSet.length - 1];
        if (this.stage_no == 0) {
            date = this.firstFormGroup.get("firstCtrl").value;
        } else if (this.stage_no == 1) {
            date = this.secondFormGroup.get("secondCtrl").value;
        } else if (this.stage_no == 2) {
            date = this.thirdFormGroup.get("thirdCtrl").value;
        }
        if (date != null && date != "") {
            const dialogRef = this.dialog.open(DeletePopUpComponent, {
                width: "400px",
                height: "200px",
                data: {
                    heading: "Confirm Deadline",
                    message: "Are you sure you want to fix the deadline?"
                },
                disableClose: true
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result.message == "submit") {
                    const dialogRefLoad = this.dialog.open(LoaderComponent, {
                        data: "Updating, Please wait ...",
                        disableClose: true,
                        panelClass: "transparent"
                    });
                    date = moment(new Date(date)).format();
                    this.userService.setDeadline(date).subscribe((data) => {
                        dialogRefLoad.close();
                        this.snackBar.open("Deadline set successfully!!", "Ok");
                        this.ngOnInit();
                    }, () => {
                        dialogRefLoad.close();
                    });
                }
            });
        } else {
            this.snackBar.open("Please choose the deadline", "Ok");
        }
    }

    startAllocation() {
        let selectedProjects = this.selection.selected;
        const dialogRef = this.dialog.open(LoaderComponent, {
            data: "Allocating projects, Please wait as this may take a while",
            disableClose: true,
            panelClass: "transparent"
        });
        const length = this.students.data.filter((val) => val.isRegistered).length;
        this.userService.validateAllocation(selectedProjects, length).subscribe((responseAPI: HttpResponseAPI) => {
            if (responseAPI.result.valid) {
                this.projectService
                    .startAllocation(selectedProjects)
                    .subscribe((responseAPI: HttpResponseAPI) => {
                        dialogRef.close();
                        this.exportDisabled = true;
                        selectedProjects = selectedProjects.map((val) => String(val._id));
                        this.dataSource = new MatTableDataSource(responseAPI.result.projects);
                        this.selection.clear();
                        this.dataSource.data.forEach((row) => {
                            if (selectedProjects.indexOf(row._id.toString()) != -1) {
                                this.selection.select(row);
                            }
                        });
                        localStorage.setItem("allocationMap", JSON.stringify(responseAPI.result.allocationMap));
                        this.userService
                            .updatePublish("reset")
                            .subscribe(() => {
                                this.publishStudents = false;
                                this.publishFaculty = false;
                                if (this.stage_no == 3) {
                                    this.userService
                                        .updateStage(this.stage_no + 1)
                                        .subscribe((responseAPI: HttpResponseAPI) => {
                                            if (responseAPI.result.updated) {
                                                this.snackBar.open("Allocation completed successfully", "Ok");
                                            }
                                            dialogRef.close();
                                        }, () => {
                                            dialogRef.close();
                                        });
                                } else {
                                    this.snackBar.open("Allocation completed successfully", "Ok");
                                    dialogRef.close();
                                }
                            }, () => {
                                dialogRef.close();
                            });
                    }, () => {
                        dialogRef.close();
                    });
            } else {
                dialogRef.close();
                this.snackBar.open(responseAPI.message, "Ok");
            }
        }, () => {
            dialogRef.close();
        });
    }

    sendEmails() {
        const dialogRef = this.dialog.open(DeletePopUpComponent, {
            width: "400px",
            height: "200px",
            disableClose: false,
            hasBackdrop: true,
            data: {
                heading: "Confirm Sending Mails",
                message: "Are you sure you want to send the mails? This cannot be undone."
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result["message"] == "submit") {
                const dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Sending mails, Please wait as this may take a while",
                    disableClose: true,
                    panelClass: "transparent"
                });
                if (this.stage_no == 0 || this.stage_no == 2) {
                    this.userService.getFacultyStreamEmails().subscribe((responseAPI: HttpResponseAPI) => {
                        const {emails, programFull} = responseAPI.result;
                        this.mailer
                            .adminToFaculty(this.stage_no, emails, this.curr_deadline, programFull)
                            .subscribe((responseAPI: HttpResponseAPI) => {
                                this.snackBar.open(responseAPI.message, "Ok");
                                dialogRefLoad.close();
                            });
                    }, () => {
                        dialogRefLoad.close();
                    });
                } else if (this.stage_no == 1) {
                    this.userService.getStudentStreamEmails().subscribe((responseAPI: HttpResponseAPI) => {
                        const {emails, programFull} = responseAPI.result;
                        this.mailer
                            .adminToStudents(emails, this.curr_deadline, programFull)
                            .subscribe((responseAPI: HttpResponseAPI) => {
                                this.snackBar.open(responseAPI.message, "Ok");
                                dialogRefLoad.close();
                            });
                    }, () => {
                        dialogRefLoad.close();
                    });
                } else {
                    this.userService.fetchAllMails().subscribe((result) => {
                        this.mailer
                            .allocateMail(result["result"], result["streamFull"])
                            .subscribe((responseAPI: HttpResponseAPI) => {
                                this.snackBar.open(responseAPI.message, "Ok");
                                dialogRefLoad.close();
                            });
                    }, () => {
                        dialogRefLoad.close();
                    });
                }
            }
        });
    }

    setProjectCap() {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Updating, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.userService
            .setProjectCap(this.fifthFormGroup.get("fifthCtrl").value)
            .subscribe((responseAPI: HttpResponseAPI) => {
                dialogRefLoad.close();
                this.snackBar.open(responseAPI.message, "Ok");
                this.validateFields();
            }, () => {
                dialogRefLoad.close();
            });
    }

    setStudentCap() {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Updating, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.userService
            .setStudentCap(this.sixthFormGroup.get("sixthCtrl").value)
            .subscribe((responseAPI: HttpResponseAPI) => {
                dialogRefLoad.close();
                this.snackBar.open(responseAPI.message, "Ok");
                this.validateFields();
            }, () => {
                dialogRefLoad.close();
            });
    }

    setStudentsPerFaculty() {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Updating, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.userService
            .setStudentsPerFaculty(this.seventhFormGroup.get("seventhCtrl").value)
            .subscribe((responseAPI: HttpResponseAPI) => {
                this.snackBar.open(responseAPI.message, "Ok");
                this.validateFields();
                dialogRefLoad.close();
            }, () => {
                dialogRefLoad.close();
            });
    }

    validateFields() {
        this.userService.getMembersForAdmin().subscribe((responseAPI: HttpResponseAPI) => {
            const {users} = responseAPI.result;
            this.faculties.data = users.faculties;
            this.students.data = users.students;
            let flag = false;
            for (const faculty of this.faculties.data) {
                if (faculty.project_cap || faculty.student_cap || faculty.studentsPerFaculty) {
                    this.proceedButton1_ = true;
                    this.proceedButton2_ = true;
                    this.proceedButton3_ = true;
                    flag = true;
                    break;
                }
            }
            this.student_flag = 0;
            for (let student of this.students.data) {
                if (student.isRegistered == false) {
                    flag = true;
                    this.student_flag = 1;
                }
            }
            this.getAllocationValidation(flag, this.student_flag);
        });
    }

    getAllocationValidation(flag, student_flag) {
        const length = this.students.data.filter((val) => val.isRegistered).length;
        this.userService
            .validateAllocation(this.selection.selected, length)
            .subscribe((responseAPI: HttpResponseAPI) => {
                if (responseAPI.result.valid) {
                    if (this.dateSet.length == 1) {
                        if (this.firstFormGroup.controls["firstCtrl"]) {
                            this.proceedButton1 = false;
                            if (!flag) {
                                this.proceedButton1_ = false;
                            }
                        }
                    }
                } else {
                    if (this.dateSet.length == 1) {
                        if (this.firstFormGroup.controls["firstCtrl"]) {
                            this.proceedButton1 = false;
                            this.proceedButton1_ = true;
                        }
                    }
                }
                if (this.dateSet.length == 2) {
                    if (this.secondFormGroup.controls["secondCtrl"]) {
                        this.proceedButton2 = false;
                        if (!flag && student_flag == 0) {
                            this.proceedButton2_ = false;
                        }
                    }
                }
                if (this.dateSet.length == 3) {
                    if (this.thirdFormGroup.controls["thirdCtrl"]) {
                        this.proceedButton3 = false;
                    }
                    if (!flag) {
                        this.proceedButton3_ = false;
                    }
                }
                this.minDate = new Date();
            });
    }

    isAllSelected() {
        const numSelected = this.selection.selected ? this.selection.selected.length : 0;
        let numRows = 0;
        if (this.dataSource.data) {
            this.dataSource.data.forEach((row) => {
                numRows += row.isIncluded ? 1 : 0;
            });
        }
        return numSelected === numRows;
    }

    masterToggle() {
        this.isAllSelected() ? this.selection.clear() : this.selectIncluded();
    }

    selectIncluded() {
        this.selection.clear();
        this.dataSource.data.forEach((row) => {
            row.isIncluded ? this.selection.select(row) : this.selection.deselect(row);
        });
    }

    checkboxLabel(row): string {
        if (!row) {
            return `${ this.isAllSelected() ? "select" : "deselect" } all`;
        }
        return `${ this.selection.isSelected(row) ? "deselect" : "select" } row ${ row.position + 1 }`;
    }

    stepDownStage() {
        const dialogRef = this.dialog.open(DeletePopUpComponent, {
            width: "400px",
            height: "250px",
            data: {
                heading: "Confirm Proceed",
                message: "Are you sure you want to revert back to the previous stage?"
            },
            disableClose: true
        });
        const currStage = this.stage_no;
        dialogRef.afterClosed().subscribe((result) => {
            if (result.message == "submit") {
                const dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Updating, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.revertStage(currStage).subscribe((responseAPI: HttpResponseAPI) => {
                    this.publishFaculty = false;
                    this.publishStudents = false;
                    this.proceedButton1_ = true;
                    this.proceedButton2_ = true;
                    this.proceedButton3_ = true;
                    this.proceedButton1 = true;
                    this.proceedButton2 = true;
                    this.proceedButton3 = true;
                    this.stepper.previous();
                    this.ngOnInit();
                    this.snackBar.open(responseAPI.message, "Ok");
                    dialogRefLoad.close();
                }, () => {
                    dialogRefLoad.close();
                });
            }
        });
    }

    showPreferencesProject(project) {
        this.dialog.open(ShowFacultyPreferencesComponent, {
            disableClose: false,
            maxHeight: "700px",
            minWidth: "800px",
            data: project,
            panelClass: [ "custom-dialog-container" ]
        });
    }

    showPreferences(student) {
        this.dialog.open(ShowStudentPreferencesComponent, {
            disableClose: false,
            maxHeight: "700px",
            minWidth: "800px",
            data: student,
            panelClass: [ "custom-dialog-container" ]
        });
    }

    resetProcess() {
        const dialogRef = this.dialog.open(ResetComponent, {
            width: "400px",
            height: "300px",
            disableClose: false,
            hasBackdrop: true
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result["message"] == "submit") {
                const dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Resetting, Please wait ...",
                    disableClose: true,
                    panelClass: "transparent"
                });
                this.userService.resetUsers().subscribe((responseAPI: HttpResponseAPI) => {
                    dialogRefLoad.close();
                    this.snackBar.open(responseAPI.message, "Ok");
                    this.stepper.reset();
                    this.ngOnInit();
                }, () => {
                    dialogRefLoad.close();
                });
            }
        });
    }

    downloadFile_project() {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.exportService.download("project").subscribe((data) => {
            dialogRefLoad.close();
            saveAs(data, `${ this.programName }_faculty.csv`);
        }, () => {
            dialogRefLoad.close();
        });
    }

    downloadFile_student() {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.exportService.download("student").subscribe((data) => {
            dialogRefLoad.close();
            saveAs(data, `${ this.programName }_students.csv`);
        }, () => {
            dialogRefLoad.close();
        });
    }

    downloadFile_format() {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.exportService.download("format").subscribe((data) => {
            dialogRefLoad.close();
            saveAs(data, `${ this.programName }_format.csv`);
        }, () => {
            dialogRefLoad.close();
        });
    }

    downloadFile_allocation() {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Loading, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.exportService.download("allocation").subscribe((data) => {
            dialogRefLoad.close();
            saveAs(data, `${ this.programName }_allocation.csv`);
        }, () => {
            dialogRefLoad.close();
        });
    }

    handleFileInput(event) {
        const target = event.target;
        const files = target.files;
        this.fileToUpload = files.item(0);
        if (this.fileToUpload.name.split(".")[1] == "csv") {
            const dialogRef = this.dialog.open(DeletePopUpComponent, {
                width: "450px",
                height: "200px",
                data: {
                    heading: "Confirm Upload",
                    message: `Are you sure that you want to upload ${ this.fileToUpload.name } ?`
                }
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result && result["message"] == "submit") {
                    const dialogRefLoad = this.dialog.open(LoaderComponent, {
                        data: "Updating, Please wait ...",
                        disableClose: true,
                        panelClass: "transparent"
                    });
                    this.exportService
                        .uploadStudentList(this.fileToUpload, this.programName)
                        .subscribe((responseAPI: HttpResponseAPI) => {
                            target.value = "";
                            this.snackBar.open(responseAPI.message);
                            dialogRefLoad.close();
                        }, (e) => {
                            if (e.status == 400) {
                                this.snackBar.open(e.error.result.error.message, "Ok");
                            }
                            dialogRefLoad.close();
                        });
                }
            });
        } else {
            this.snackBar.open("Only .csv files are to imported. Other files types are not supported.", "Ok");
        }
    }

    publishToFaculty() {
        const dialogRef = this.dialog.open(DeletePopUpComponent, {
            width: "400px",
            height: "200px",
            data: {
                heading: "Confirm Publish",
                message: `Are you sure that you want to publish this allocation to faculty ? Do note that mails will be sent automatically.`
            },
            disableClose: true
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result.message == "submit") {
                const dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Sending mails, Please wait as this may take a while",
                    disableClose: true,
                    panelClass: "transparent"
                });
                const requests = [
                    this.userService.updatePublish("faculty"),
                    this.userService.uploadAllocationFile(),
                    this.userService.getFacultyStreamEmails()
                ];
                forkJoin(requests).subscribe((response: Array<HttpResponseAPI>) => {
                    const data = response[0].result.projects;
                    const {emails, programFull} = response[2].result;
                    this.exportDisabled = false;
                    if (localStorage.getItem("allocationMap")) {
                        this.discardAllocation();
                        this.dataSource = new MatTableDataSource(data);
                    }
                    this.selectIncluded();
                    this.publishFaculty = true;
                    this.mailer.publishMail("faculty", emails, programFull)
                        .subscribe(() => {
                            dialogRefLoad.close();
                            this.snackBar.open("Successfully published to faculties and mails have been sent.", "Ok");
                        }, () => {
                            dialogRefLoad.close();
                        });
                }, () => {
                    dialogRefLoad.close();
                });
            }
        });
    }

    publishToStudents() {
        const dialogRef = this.dialog.open(DeletePopUpComponent, {
            width: "400px",
            height: "250px",
            data: {
                heading: "Confirm Publish",
                message: `Are you sure that you want to publish this allocation to students? Please ensure that the results are published to faculties before it is published to the students. Do note that mails will be sent automatically.`
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result["message"] == "submit") {
                const dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: "Sending mails, Please wait as this may take a while",
                    disableClose: true,
                    panelClass: "transparent"
                });
                const requests = [
                    this.userService.updatePublish("student"),
                    this.userService.uploadAllocationFile(),
                    this.userService.getStudentStreamEmails()
                ];
                forkJoin(requests).subscribe((response: Array<any>) => {
                    const data = response[0].result.projects;
                    const {emails, programFull} = response[2].result;
                    this.exportDisabled = false;
                    if (localStorage.getItem("allocationMap")) {
                        this.discardAllocation();
                        this.dataSource = new MatTableDataSource(data);
                    }
                    this.selectIncluded();
                    this.publishStudents = true;
                    localStorage.setItem("ps", "true");
                    this.mailer
                        .publishMail("student", emails, programFull)
                        .subscribe(() => {
                            dialogRefLoad.close();
                            this.snackBar.open("Successfully published to students and mails have been sent.", "Ok");
                        }, () => {
                            dialogRefLoad.close();
                        });
                }, () => {
                    dialogRefLoad.close();
                });
            }
        });
    }

    applyFilter(event: Event, who: string) {
        const filterValue = (event.target as HTMLInputElement
        ).value;
        if (who == "project") {
            this.dataSource.filter = filterValue.trim().toLowerCase();
        } else if (who == "student") {
            this.students.filter = filterValue.trim().toLowerCase();
            this.studentCount = this.students.filteredData.length;
        } else if (who == "faculty") {
            this.faculties.filter = filterValue.trim().toLowerCase();
        }
    }

    ngOnDestroy() {
        clearInterval(this.timer);
    }

    sortStudents(event) {
        const isAsc = event.direction == "asc";
        this.students.data = this.students.data.sort((a, b) => {
            switch (event.active) {
                case "Name":
                    return this.compare(a.name, b.name, isAsc);
                case "GPA":
                    return this.compare(a.gpa, b.gpa, isAsc);
                case "Registered":
                    return this.compare(a.isRegistered, b.isRegistered, isAsc);
                case "Email":
                    return this.compare(Number(a.email.split("@")[0]), Number(b.email.split("@")[0]), isAsc);
                default:
                    return 0;
            }
        });
    }

    sortFaculty(event) {
        const isAsc = event.direction == "asc";
        this.faculties.data = this.faculties.data.sort((a, b) => {
            switch (event.active) {
                case "Name":
                    return this.compare(a.name, b.name, isAsc);
                case "GPA":
                    return this.compare(a.gpa, b.gpa, isAsc);
                case "Registered":
                    return this.compare(a.isRegistered, b.isRegistered, isAsc);
                case "NoOfProjects":
                    return this.compare(a.noOfProjects, b.noOfProjects, isAsc);
                case "StudentIntake":
                    return this.compare(a.included_studentIntake, b.included_studentIntake, isAsc);
                default:
                    return 0;
            }
        });
    }

    sortProjects(event) {
        const isAsc = event.direction == "asc";
        this.dataSource.data = this.dataSource.data.sort((a, b) => {
            switch (event.active) {
                case "select":
                    return this.compare(this.selection.isSelected(a), this.selection.isSelected(b), isAsc);
                case "Title":
                    return this.compare(a.title, b.title, isAsc);
                case "Faculty":
                    return this.compare(a.faculty, b.faculty, isAsc);
                case "Duration":
                    return this.compare(a.duration, b.duration, isAsc);
                case "isIncluded":
                    return this.compare(a.isIncluded, b.isIncluded, isAsc);
                case "studentIntake":
                    return this.compare(a.studentIntake, b.studentIntake, isAsc);
                case "NoOfStudents":
                    return this.compare(a.numberOfPreferences, b.numberOfPreferences, isAsc);
                default:
                    return 0;
            }
        });
    }

    compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
