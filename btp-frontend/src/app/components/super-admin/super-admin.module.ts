import {NgModule} from '@angular/core';
import {AddMapComponent} from 'src/app/components/super-admin/add-map/add-map.component';
import {EditFormComponent} from 'src/app/components/super-admin/edit-form/edit-form.component';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {SuperAdminRoutingModule} from 'src/app/components/super-admin/super-admin-routing.module';
import {SatPopoverModule} from '@ncstate/sat-popover';
import {FacultyTooltipSuper, SuperAdminComponent} from 'src/app/components/super-admin/super-admin.component';

@NgModule({
    declarations: [
        AddMapComponent,
        EditFormComponent,
        SuperAdminComponent,
        FacultyTooltipSuper
    ],
    imports: [
        SharedModule,
        SuperAdminRoutingModule,
        SatPopoverModule
    ]
})
export class SuperAdminModule {
}
