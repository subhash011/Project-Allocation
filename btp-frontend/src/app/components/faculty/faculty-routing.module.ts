import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FacultyComponent } from "src/app/components/faculty/main/faculty.component";
import { ProfileComponent } from "src/app/components/shared/profile/profile.component";

const routes: Routes = [
    {
        path: ":id",
        component: FacultyComponent,
        runGuardsAndResolvers: "always"
    },
    {
        path: "profile/:id",
        component: ProfileComponent
    }
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]
})
export class FacultyRoutingModule {}
