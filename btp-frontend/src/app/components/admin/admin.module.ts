import {NgModule} from '@angular/core';
import {ShowFacultyPreferencesComponent} from 'src/app/components/admin/show-faculty-preferences/show-faculty-preferences.component';
import {ShowStudentPreferencesComponent} from 'src/app/components/admin/show-student-preferences/show-student-preferences.component';
import {AdminRoutingModule} from 'src/app/components/admin/admin-routing.module';
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
} from 'src/app/components/admin/admin.component';
import {SharedModule} from 'src/app/components/shared/shared.module';

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
        SharedModule,
        AdminRoutingModule
    ]
})
export class AdminModule {
}
