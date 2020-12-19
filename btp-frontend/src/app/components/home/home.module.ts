import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HomeComponent } from "src/app/components/home/home.component";
import { HomeRoutingModule } from "src/app/components/home/home-routing.module";
import { SharedModule } from "src/app/components/shared/shared.module";

@NgModule({
    declarations: [
        HomeComponent
    ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        SharedModule
    ]
})
export class HomeModule {}
