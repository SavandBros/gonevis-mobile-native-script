import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NativeScriptFormsModule } from 'nativescript-angular';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptUIListViewModule } from 'nativescript-ui-listview/angular';
import { EntriesRoutingModule } from '~/app/components/dash/entries/entries-routing.module';
import { EntriesComponent } from '~/app/components/dash/entries/entries.component';

@NgModule({
  declarations: [EntriesComponent],
  imports: [
    NativeScriptCommonModule,
    EntriesRoutingModule,
    ReactiveFormsModule,
    NativeScriptFormsModule,
    NativeScriptUIListViewModule,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class EntriesModule {
}
