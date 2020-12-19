import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StudentRoutingModule } from "./student-routing.module";
import { SharedModule } from "src/app/components/shared/shared.module";
import { StudentComponent } from "src/app/components/student/main/student.component";
import { StudentProjectsComponent } from "src/app/components/student/student-projects/student-projects.component";
import {
    IsPreferenceEdit,
    ShowAvailableProjectsComponent
} from "src/app/components/student/show-available-projects/show-available-projects.component";
import { EditPreferencesComponent } from "src/app/components/student/edit-preferences/edit-preferences.component";
import { DisplayPreferencesComponent } from "src/app/components/student/display-preferences/display-preferences.component";
import { CdkDropListActualContainer } from "src/app/components/student/edit-preferences/edit-preferences.directive";

@NgModule({
    declarations: [
        StudentComponent,
        StudentProjectsComponent,
        IsPreferenceEdit,
        ShowAvailableProjectsComponent,
        EditPreferencesComponent,
        DisplayPreferencesComponent,
        CdkDropListActualContainer
    ],
    imports: [
        CommonModule,
        StudentRoutingModule,
        SharedModule
    ]
})
export class StudentModule {}
