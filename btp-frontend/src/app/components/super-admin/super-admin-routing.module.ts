import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SuperAdminComponent } from "src/app/components/super-admin/super-admin.component";
import { HelpComponent } from "src/app/components/shared/help/help.component";
import { RegisterComponent } from "src/app/components/shared/register/register.component";

const routes: Routes = [
    {
        path: ":id",
        component: SuperAdminComponent
    },
    {
        path: "help/:id",
        component: HelpComponent
    },
    {
        path: "register/:id",
        component: RegisterComponent
    }
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]
})
export class SuperAdminRoutingModule {}
