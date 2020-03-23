import { NgModule } from "@angular/core";
import { MatSliderModule } from "@angular/material/slider";
import { LayoutModule } from "@angular/cdk/layout";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
const MaterialComponents = [
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
  MatSliderModule,
  LayoutModule,
  MatSidenavModule,
  MatListModule
];

@NgModule({
  declarations: [],
  imports: MaterialComponents,
  exports: MaterialComponents
})
export class MaterialModule {}
