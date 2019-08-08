import { NgModule } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { WriteComponent } from '~/app/components/dash/write/write.component';
import { WriteRoutingModule } from '~/app/components/dash/write/write-routing.module';

@NgModule({
  declarations: [WriteComponent],
  imports: [
    NativeScriptCommonModule,
    WriteRoutingModule
  ]
})
export class WriteModule {
}
