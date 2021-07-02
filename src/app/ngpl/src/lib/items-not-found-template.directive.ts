import {ContentChild, Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: 'ngplItemsNoFoundTemplate'
})
export class ItemsNotFoundTemplateDirective {
  @ContentChild(TemplateRef)
  template: TemplateRef<any>;

  constructor() {
  }

}
