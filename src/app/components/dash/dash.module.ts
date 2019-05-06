import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { DashComponent } from '~/app/components/dash/dash.component';
import { DashRoutingModule } from '~/app/components/dash/dash-routing.module';

@NgModule({
  declarations: [DashComponent],
  imports: [
    NativeScriptCommonModule,
    DashRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class DashModule {
}
