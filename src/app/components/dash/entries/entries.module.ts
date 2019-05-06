import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { EntriesRoutingModule } from '~/app/components/dash/entries/entries-routing.module';
import { EntriesComponent } from '~/app/components/dash/entries/entries.component';
import { NativeScriptFormsModule } from 'nativescript-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { NativeScriptUIListViewModule } from 'nativescript-ui-listview/angular';

@NgModule({
  declarations: [EntriesComponent],
  imports: [
    NativeScriptCommonModule,
    EntriesRoutingModule,
    ReactiveFormsModule,
    NativeScriptFormsModule,
    NativeScriptUIListViewModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class EntriesModule { }
