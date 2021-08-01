import {NgModule} from '@angular/core';
import {HomeComponent} from 'src/app/components/home/home.component';
import {CommonModule} from '@angular/common';
import {MaterialModule} from 'src/app/material/material.module';
import {HomeRoutingModule} from './home.routing-module';

@NgModule({
    declarations: [
        HomeComponent
    ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        MaterialModule
    ]
})
export class HomeModule {
}
