import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    ActiveProjects,
    AdminComponent,
    AllotedStudents,
    GetExportDisabled,
    GetIncludedOfTotal,
    GetViolations,
    ProceedPipe,
    SelectedLength,
    StudentIntake,
    TotalIntake
} from "src/app/components/admin/main/admin.component";
import { AdminRoutingModule } from "src/app/components/admin/admin-routing.module";
import { ShowFacultyPreferencesComponent } from "src/app/components/admin/show-faculty-preferences/show-faculty-preferences.component";
import { ShowStudentPreferencesComponent } from "src/app/components/admin/show-student-preferences/show-student-preferences.component";
import { SharedModule } from "src/app/components/shared/shared.module";

@NgModule({
    declarations: [
        ActiveProjects,
        AdminComponent,
        AllotedStudents,
        GetExportDisabled,
        GetIncludedOfTotal,
        GetViolations,
        ProceedPipe,
        SelectedLength,
        StudentIntake,
        TotalIntake,
        ShowFacultyPreferencesComponent,
        ShowStudentPreferencesComponent
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        SharedModule
    ],
    providers: [
        SharedModule
    ]
})
export class AdminModule {}
