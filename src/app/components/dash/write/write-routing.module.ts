import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular';
import { WriteComponent } from '~/app/components/dash/write/write.component';

const routes: Routes = [{
  path: '',
  component: WriteComponent
}];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class WriteRoutingModule {
}
