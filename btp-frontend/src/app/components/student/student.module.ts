import { NgModule } from "@angular/core";
import { StudentProjectsComponent } from "src/app/components/student/student-projects/student-projects.component";
import {
    IsPreferenceEdit,
    ShowAvailableProjectsComponent
} from "src/app/components/student/show-available-projects/show-available-projects.component";
import { EditPreferencesComponent } from "src/app/components/student/edit-preferences/edit-preferences.component";
import { DisplayPreferencesComponent } from "src/app/components/student/display-preferences/display-preferences.component";
import { SharedModule } from "src/app/components/shared/shared.module";
import { StudentRoutingModule } from "src/app/components/student/student-routing.module";
import { TimelineModule } from "src/app/components/shared/timeline/timeline.component";
import { StudentComponent } from "src/app/components/student/student.component";
import { CdkDroplistContainerModule } from "src/app/components/shared/DragDropContainer/cdk-droplist-container.directive";

@NgModule({
    declarations: [
        StudentComponent,
        StudentProjectsComponent,
        IsPreferenceEdit,
        ShowAvailableProjectsComponent,
        EditPreferencesComponent,
        DisplayPreferencesComponent
    ],
    imports: [
        SharedModule,
        StudentRoutingModule,
        TimelineModule,
        CdkDroplistContainerModule
    ]
})
export class StudentModule {}
