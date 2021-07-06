import {ContentChild, Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: 'ngplItemsNoFoundTemplate'
})
export class NgplItemsNotFoundTemplateDirective {
  @ContentChild(TemplateRef)
  template: TemplateRef<any>;

  constructor() {
  }

}
