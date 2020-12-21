import { NgModule } from "@angular/core";
import { ContentComponent, FacultyPublish } from "src/app/components/faculty/content/content.component";
import { SidenavComponent } from "src/app/components/faculty/sidenav/sidenav.component";
import {
    GetDisplayedColumns,
    PreferencePipe,
    StudentTableComponent
} from "src/app/components/faculty/student-table/student-table.component";
import { SubmitPopUpComponent } from "src/app/components/faculty/submit-pop-up/submit-pop-up.component";
import { DeletePopUpComponent } from "src/app/components/faculty/delete-pop-up/delete-pop-up.component";
import { ResetComponent } from "src/app/components/faculty/reset/reset.component";
import { ShowStudentAllotedComponent } from "src/app/components/faculty/show-student-alloted/show-student-alloted.component";
import { FacultyHomeComponent } from "src/app/components/faculty/faculty-home/faculty-home.component";
import { SharedModule } from "src/app/components/shared/shared.module";
import { FacultyRoutingModule } from "src/app/components/faculty/faculty-routing.module";
import { TimelineModule } from "src/app/components/shared/timeline/timeline.component";
import { FacultyComponent } from "src/app/components/faculty/faculty.component";
import { CdkDroplistContainerModule } from "../shared/DragDropContainer/cdk-droplist-container.directive";

@NgModule({
    declarations: [
        FacultyComponent,
        ContentComponent,
        FacultyPublish,
        SidenavComponent,
        GetDisplayedColumns,
        PreferencePipe,
        StudentTableComponent,
        SubmitPopUpComponent,
        DeletePopUpComponent,
        ResetComponent,
        ShowStudentAllotedComponent,
        FacultyHomeComponent
    ],
    imports: [
        SharedModule,
        FacultyRoutingModule,
        TimelineModule,
        CdkDroplistContainerModule
    ]
})
export class FacultyModule {}
