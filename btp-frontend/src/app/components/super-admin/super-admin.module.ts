import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SuperAdminRoutingModule } from "./super-admin-routing.module";
import { SharedModule } from "src/app/components/shared/shared.module";
import { FacultyTooltipSuper, SuperAdminComponent } from "src/app/components/super-admin/main/super-admin.component";
import { AddMapComponent } from "src/app/components/super-admin/add-map/add-map.component";
import { EditFormComponent } from "src/app/components/super-admin/edit-form/edit-form.component";

@NgModule({
    declarations: [
        AddMapComponent,
        EditFormComponent,
        SuperAdminComponent,
        FacultyTooltipSuper
    ],
    imports: [
        CommonModule,
        SuperAdminRoutingModule,
        SharedModule
    ]
})
export class SuperAdminModule {}
