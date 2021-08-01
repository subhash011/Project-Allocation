import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {MaterialModule} from 'src/app/material/material.module';
import {HelpModule} from 'src/app/components/shared/help/help.component';
import {PipeModule} from 'src/app/components/shared/Pipes/pipe.module';
import {MatDialogRef} from '@angular/material/dialog';
import {LoaderModule} from 'src/app/components/shared/loader/loader.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MaterialModule,
        HelpModule,
        PipeModule,
        LoaderModule
    ],
    exports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MaterialModule,
        HelpModule,
        PipeModule,
        LoaderModule
    ],
    providers: [
        {
            provide: MatDialogRef,
            useValue: {}
        }
    ]
})
export class SharedModule {
}
