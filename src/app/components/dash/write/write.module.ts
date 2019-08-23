import { NgModule } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptUIListViewModule } from 'nativescript-ui-listview/angular';
import { WriteRoutingModule } from '~/app/components/dash/write/write-routing.module';
import { WriteComponent } from '~/app/components/dash/write/write.component';

@NgModule({
  declarations: [WriteComponent],
  imports: [
    NativeScriptCommonModule,
    WriteRoutingModule,
    NativeScriptUIListViewModule,
  ],
})
export class WriteModule {
}
