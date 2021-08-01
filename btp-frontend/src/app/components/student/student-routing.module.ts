import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StudentComponent} from 'src/app/components/student/student.component';
import {ShowAvailableProjectsComponent} from 'src/app/components/student/show-available-projects/show-available-projects.component';
import {ProfileComponent} from 'src/app/components/shared/profile/profile.component';
import {HelpComponent} from 'src/app/components/shared/help/help.component';

const routes: Routes = [
    {
        path: ':id',
        component: StudentComponent
    },
    {
        path: 'projects/:id',
        component: ShowAvailableProjectsComponent
    },
    {
        path: 'preferences/:id',
        component: ShowAvailableProjectsComponent
    },
    {
        path: 'profile/:id',
        component: ProfileComponent
    },
    {
        path: 'help/:id',
        component: HelpComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StudentRoutingModule {
}
