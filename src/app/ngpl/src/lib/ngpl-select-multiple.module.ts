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
import {NoItemsTemplateDirective} from './no-items-template.directive';
import {ItemsNotFoundTemplateDirective} from './items-not-found-template.directive';
import {ScrollingModule} from '@angular/cdk/scrolling';

const components = [
  NgplSelectMultipleComponent
];

@NgModule({
  declarations: [components, NgplItemTemplateDirective, NoItemsTemplateDirective, ItemsNotFoundTemplateDirective],
  exports: [components, NgplItemTemplateDirective, NoItemsTemplateDirective, ItemsNotFoundTemplateDirective],
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
    NgplCommonDirectivesModule
  ]
})
export class NgplSelectMultipleModule {
}
