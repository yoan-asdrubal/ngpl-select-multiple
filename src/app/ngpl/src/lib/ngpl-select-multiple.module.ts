import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {OverlayModule} from '@angular/cdk/overlay';
import {NgplCommonDirectivesModule, NgplCommonModule} from 'ngpl-common';
import {NgplSelectMultipleComponent} from './ngpl-select-multiple/ngpl-select-multiple.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {NgplItemTemplateDirective} from './ngpl-item-template.directive';
import {NgplNoItemsTemplateDirective} from './ngpl-no-items-template.directive';
import {NgplItemsNotFoundTemplateDirective} from './ngpl-items-not-found-template.directive';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgplFilterModule} from 'ngpl-filter';

const components = [
  NgplSelectMultipleComponent
];

@NgModule({
  declarations: [components, NgplItemTemplateDirective, NgplNoItemsTemplateDirective, NgplItemsNotFoundTemplateDirective],
  exports: [components, NgplItemTemplateDirective, NgplNoItemsTemplateDirective, NgplItemsNotFoundTemplateDirective],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatIconModule,
    OverlayModule,
    ScrollingModule,
    NgplCommonModule,
    NgplFilterModule,
    NgplCommonDirectivesModule
  ]
})
export class NgplSelectMultipleModule {
}
