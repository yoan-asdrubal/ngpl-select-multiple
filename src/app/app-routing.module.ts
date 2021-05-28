import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NgplSelectMultipleTestComponent} from './app-test/ngpl-select-multiple-test/ngpl-select-multiple-test.component';

const routes: Routes = [
  {
    path: 'ngpl-select-multiple',
    component: NgplSelectMultipleTestComponent
  }, {
    path: '**',
    component: NgplSelectMultipleTestComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
