import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FacultyComponent} from 'src/app/components/faculty/faculty.component';
import {ProfileComponent} from 'src/app/components/shared/profile/profile.component';
import {HelpComponent} from 'src/app/components/shared/help/help.component';
import {RegisterComponent} from 'src/app/components/shared/register/register.component';

const routes: Routes = [
    {
        path: ':id',
        component: FacultyComponent
    },
    {
        path: 'profile/:id',
        component: ProfileComponent
    },
    {
        path: 'help/:id',
        component: HelpComponent
    },
    {
        path: 'register/:id',
        component: RegisterComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FacultyRoutingModule {
}
