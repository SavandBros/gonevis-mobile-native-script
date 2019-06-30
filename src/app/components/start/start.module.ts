import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { StartComponent } from '~/app/components/start/start.component';
import { StartRoutingModule } from '~/app/components/start/start-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [StartComponent],
  imports: [
    NativeScriptCommonModule,
    StartRoutingModule,
    ReactiveFormsModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class StartModule {
}
