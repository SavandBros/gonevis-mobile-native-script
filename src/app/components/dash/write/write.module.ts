import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { WriteComponent } from '~/app/components/dash/write/write.component';
import { WriteRoutingModule } from '~/app/components/dash/write/write-routing.module';

@NgModule({
  declarations: [WriteComponent],
  imports: [
    NativeScriptCommonModule,
    WriteRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class WriteModule {
}
