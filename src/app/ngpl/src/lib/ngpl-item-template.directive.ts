import {ContentChild, Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: 'ngplItemTemplate'
})
export class NgplItemTemplateDirective {
  @ContentChild(TemplateRef)
  template: TemplateRef<any>;

  constructor() {
  }

}
