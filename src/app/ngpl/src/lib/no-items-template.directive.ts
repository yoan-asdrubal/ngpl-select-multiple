import {ContentChild, Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: 'ngplNoItemsTemplate'
})
export class NoItemsTemplateDirective {
  @ContentChild(TemplateRef)
  template: TemplateRef<any>;
  constructor() { }

}
