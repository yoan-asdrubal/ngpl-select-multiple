import {ContentChild, Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: 'ngplNoItemsTemplate'
})
export class NgplNoItemsTemplateDirective {
  @ContentChild(TemplateRef)
  template: TemplateRef<any>;
  constructor() { }

}
