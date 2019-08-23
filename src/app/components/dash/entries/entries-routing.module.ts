import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular';
import { EntriesComponent } from '~/app/components/dash/entries/entries.component';

const routes: Routes = [{
  path: '',
  component: EntriesComponent
}];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class EntriesRoutingModule {
}
