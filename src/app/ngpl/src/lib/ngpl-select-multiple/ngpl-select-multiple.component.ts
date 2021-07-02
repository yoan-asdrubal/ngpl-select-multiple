import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  forwardRef,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {Changes} from 'ngx-reactivetoolkit';
import {ReplaySubject} from 'rxjs';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {isNotNullOrUndefined, NGPL_FILTER_BASE, NgplFilterBase, NgplFilterService, NgplSelection} from 'ngpl-common';
import {CdkOverlayOrigin, Overlay, OverlayPositionBuilder, OverlayRef} from '@angular/cdk/overlay';
import {NgplItemTemplateDirective} from '../ngpl-item-template.directive';
import {ItemsNotFoundTemplateDirective} from '../items-not-found-template.directive';
import {NoItemsTemplateDirective} from '../no-items-template.directive';
import {TemplatePortal} from '@angular/cdk/portal';

@UntilDestroy()
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngpl-select-multiple',
  templateUrl: './ngpl-select-multiple.component.html',
  styleUrls: ['./ngpl-select-multiple.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgplSelectMultipleComponent),
      multi: true
    },
    {
      provide: NGPL_FILTER_BASE, useExisting: forwardRef(() => NgplSelectMultipleComponent)
    }
  ]
})
export class NgplSelectMultipleComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor, NgplFilterBase {
  /**
   * Items sobre los que se aplicara el filtro, en caso de que se desee mostrar los resultados en el autocomplete se debe
   * especificar
   */
  @Input('items') items: any[] = [];
  @Changes('items') items$;


  /**
   * Ancho del panel del Autocomplete
   */
  @Input() panelWidth = '250px';

  /** Propiedades sobre las que se desea aplicar el filtro en los {@link #items} */
  @Input() filterBy: string | string[] = ['descripcion'];

  /**
   *  Si es un arreglo de objectos define la propiedad dentro del objeto que se manejara como valor , en caso de ser un
   * arreglo de objetos y no ser especificada se tomará como value el item completo
   */
  @Input() propValue = undefined;

  /** Si es un arreglo de objetos define la propiedad dentro del objeto que se mostrara como label en la opción , en caso de ser
   * una cadena de string se mostrara el valor de cada objeto
   * Por defecto se toma la propiedad descripcion
   */
  @Input() propLabel = 'descripcion';

  /**
   * Funcion para generar el label de cada opción, en caso de ser especificada tiene prioridad sobre {@link label}
   */
  @Input() labelFn: (item: any) => string;

  /**
   * Mat-Label que se mostrará en el mat-form-field del autocomplete
   */
  @Input() placeHolder = 'Seleccione';

  @Input() showTotalSelected = true;

  /**
   * Define si el campo de búsqueda tendra posicion sticky o no, por defecto es true
   */

  @Input() stickSearch = true;

  /**
   * Define el comportamiento del floatLabel en el matFormField, acepta los mismos valores que el atributo floatLabel del matFormField
   */
  @Input() floatLabel = '';

  /**
   * Propiedad para identificar los datos en el proceso de seleccion, por defecto 'id'
   */
  @Input() trackBy = 'id';

  /**
   * Define si se muestra el campo para filtrar
   */
  @Input() searcheable = true;
  /** Define el atributo appearance del matFormField, permite los mismos valores */

  @Input() appearance: 'legacy' | 'standard' | 'fill' | 'outline' | 'default' = 'outline';

  /**
   * Define si se aplica la clase no-empty al matFormField
   */
  @Input() noEmptyClass = true;

  /**
   * Define si se le aplica la case hide-theme-color al matFormField
   */
  @Input() hideThemeColorClass = true;

  /**  Controla si el componenten debe mostrar un Skeleton */
  @Input() showLoading = false;
  @Input() showLoadingWidth = '100%';
  @Input() showLoadingHeight = '15px';

  /**  Define si se muestra el orden de seleccion de un item */
  @Input() showSelectionOrder = false;

  @Input() orderColor;

  @Input() orderBackgroundColor;
  /**
   * Define si se muestra el icono en el campo de filtrar
   */
  @Input() showIconSearch = true;

  /**
   * Se utiliza como evento para reaccionar cuando cambia la seleccion
   */
  @Output() valueChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  /** Emite cuando cambia la seleccion, se utiliza para reaccionar desde un componente externo a los cambios de seleccion */
  selectedChange$ = new ReplaySubject(1);

  /** Emite la configuracion del filtro cuando se desea filtrar en otro componente como widget-filtered-datatable */
  @Output() filter: EventEmitter<any> = new EventEmitter();

  /**
   * FormControl que controla el campo sobre el que se realiza la busqueda
   */
  searchFormCtrl = new FormControl('');

  /**
   * FormControl que controla el valor que se le muestra al usuario al seleccionar un elemento
   */
  inputFormControl = new FormControl('');


  /**
   *  Controla el ultimo valor por el que se realizo la busqueda para mostrarlo en el input manualmente
   */
  lastSearch = '';

  /** Controla internamente la seleccion de elementos */
  itemsSelected: NgplSelection<any> = new NgplSelection<any>();

  /** Controla internamente los elementos filtrados para mostrar en el panel del autocomplete */
  filteredItems$ = new ReplaySubject<any[]>(1);

  /** Elementos resultantes de aplicar los filtros */
  filteredItems = [];

  /** Referencia al input de busqueda */
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  /**
   * Rererencia al panel del autocomplete
   */

  filterConfig = {};
  _selectedValue: any[];
  @Input() customClass = '';

  @Input() disabledControl = false;

  @Input() readOnlyControl = false;

  @Input() showSelectedFirst = true;

  /**
   * Template para mostrar cuando no existan resultados en la búsqueda, es opcional.
   */

  @Input() noItemsText = 'No hay elementos.';

  /**
   * Template para mostrar cuando no existan resultados en la búsqueda, es opcional.
   */
  @Input() noResultText = 'No hay Coincidencias.';


  private overlayRef: OverlayRef;
  ngControl: NgControl;

  @ViewChild(CdkOverlayOrigin, {static: true}) origin: CdkOverlayOrigin;

  @ViewChild('templatePortalContent', {static: true}) templatePortalContent: TemplateRef<any>;

  @ContentChild(NgplItemTemplateDirective, {static: false})
  itemTemplateRef: NgplItemTemplateDirective;

  @ContentChild(ItemsNotFoundTemplateDirective, {static: false})
  itemNoFoundTemplateRef: ItemsNotFoundTemplateDirective;

  @ContentChild(NoItemsTemplateDirective, {static: false})
  noItemsTemplateRef: NoItemsTemplateDirective;

  constructor(private overlay: Overlay,
              private injector: Injector,
              private changeDetectorRef: ChangeDetectorRef,
              private overlayPositionBuilder: OverlayPositionBuilder,
              private _viewContainerRef: ViewContainerRef,
              private ngplFilterService: NgplFilterService) {
  }

  /**
   * Establece configuracion inicial de filtro para el componente
   *
   * Si se deben mostrar los elementos en un autocomplete en el componente se valida qeu se hallan especificado
   * las referencias a los templates para generar el nombre de las columnas y las filas de datos
   *
   * Se subscribe al cambio en los {@link items} para aplicar el filtro nuevamente sobre los elementos
   *
   * Se subscribe al cambio en el campo de busqueda para emitir filtro
   *
   * Se subscribe al cambio en los elementos seleccionados para emitir estos valores.
   */
  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, 2);

    this.itemsSelected.setKey(this.trackBy || 'id');

    this.filteredItems = this.items || [];
    this.filteredItems$.next(this.filteredItems.slice());
    this.items$
      .pipe(
        untilDestroyed(this),
        tap((items: any[]) => {
          this.items = items;
          if (isNotNullOrUndefined(this.items) && this.items.length > 0) {
            this.updateSelectedFirst();
            this.updateSelectedValues();
          }
          this.applyFilter(this.items, this.filterConfig);
        })
      )
      .subscribe();
    this.searchFormCtrl.valueChanges
      .pipe(
        untilDestroyed(this)
        , distinctUntilChanged()
        , debounceTime(250)
        , tap((value) => {
          this.filterConfig = {
            filter: {
              value,
              keys: typeof this.filterBy === 'string' ? this.filterBy.split(',') : this.filterBy
            }
          };
          this.applyFilter(this.items, this.filterConfig);
        })
      )
      .subscribe();

    this.itemsSelected.selectionChange
      .pipe(
        untilDestroyed(this),
        tap((curr: any[]) => {
          this.select(curr);
        })
      )
      .subscribe();

    // this.filteredItems$
    //     .pipe(
    //         untilDestroyed(this),
    //         tap(val => this.itemsSelected.updateSelectedIfNotFound(val))
    //     )
    //     .subscribe();

    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.origin.elementRef)
      .withPositions([{
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: -22
      }
      ]);

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy
    });
    this.overlayRef.backdropClick()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.overlayRef.detach();
      });

  }

  openPanelWithBackdrop(event): void {
    console.log('event', event);
    event.stopPropagation();
    event.preventDefault();
    if (this.disabledControl || this.readOnlyControl || !!this.showLoading) {
      return;
    }
    if (this.overlayRef.hasAttached())
      this.overlayRef.detach();

    this.overlayRef.attach(new TemplatePortal(
      this.templatePortalContent,
      this._viewContainerRef));

  }

  select(items: any[]): void {
    console.log('select items', items);
    const values = [];
    let labels = '';
    items.forEach((item, index) => {
      let label = item;
      let value = item;
      if (!item) {
        label = '';
        value = '';
      } else {
        if (label !== '') {
          labels += (index === 0 ? '' : ', ') + (!!this.labelFn ? this.labelFn(item) : (item[this.propLabel] || item));
        }
        if (value !== '') {
          value = this.propValue ? item[this.propValue] : item;
        }
      }

      values.push(value);
    });

    this.inputFormControl.setValue(labels);
    this._selectedValue = values;

    this.emit();
  }

  public emit(): void {
    if (this._selectedValue && this._selectedValue.length === 0) {
      this._selectedValue = null;
    }
    this.valueChange.emit(this._selectedValue);
    this.onChange(this._selectedValue);
    this.onTouch(this._selectedValue);
  }

  ngOnChanges(): void {
  }

  ngOnDestroy(): void {
  }

  /**
   * Aplica los filtros { @param filter} sobre los elementos {@param  items} y emite el resultado de la busqueda.
   *
   * @param items
   * @param filter
   */
  applyFilter(items, filter): void {
    this.filteredItems = this.ngplFilterService.filter(items, filter);
    // this.filteredItems = this.ordenarItemsSeleccionados(itemsFil);
    this.filteredItems$.next(this.filteredItems);
  }

  ordenarItemsSeleccionados(items: any[]): any[] {
    const itemsFil = items.slice();
    const length = itemsFil.length;

    for (let i = 0; i < length; i++) {
      for (let j = i + 1; j < length; j++) {
        if (!this.itemsSelected.isSelected(itemsFil[i]) && this.itemsSelected.isSelected(itemsFil[j])) {
          const a = itemsFil[i];
          itemsFil[i] = itemsFil[j];
          itemsFil[j] = a;
        }
      }
    }
    return itemsFil;
  }


  toogleSelected(item): void {
    // this.overlayRef.detach();
    this.itemsSelected.toggle(item);
    if (!!this.searchInput) {
      this.searchInput.nativeElement.value = this.lastSearch;
    }
    this.changeDetectorRef.markForCheck();
  }

  onChange: any = () => {
  };
  onTouch: any = () => {
  };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledControl = isDisabled;
  }

  writeValue(obj: any[]): void {
    if (!obj || obj.length === 0) {
      this.inputFormControl.setValue('');
    } else {
      this._selectedValue = obj;
      this.updateSelectedValues();
    }
  }

  updateSelectedValues(): void {
    if (!this.items || !this._selectedValue || this.items.length === 0 || this._selectedValue.length === 0) {
      return;
    }

    this.itemsSelected.select(this._selectedValue.map(it => this.findItemByValue(it)).filter(it => !!it));
  }

  findItemByValue(value: any): any {
    if (!value || !this.items) {
      return null;
    }
    return this.items.find(item => {
      if (typeof value === typeof item && typeof item === 'object') {
        return item[this.trackBy] === value[this.trackBy];
      } else if (typeof value === typeof item && typeof item === 'string') {
        return value.toString().trim().toLowerCase() === item.toString().trim().toLowerCase();
      } else if (!!this.propValue) {
        return item[this.propValue].toString() === value.toString();
      }
      return false;
    });
  }

  /**
   * Limpia el campo de búsqueda, previeve la propagacion del evento para que no se cierre el panel del autocomplete
   * @param event
   */
  clearSearch(event): void {
    // this.inputFormControl.setValue('');
    this.searchFormCtrl.setValue('');
    event.preventDefault();
    event.stopPropagation();
  }

  cleanSelection(): void {
    this.itemsSelected.clear();
    this._selectedValue = [];
    this.filteredItems = [];
  }

  inputSearchFocus(): void {
    setTimeout(() => {
      if (!!this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 200);
  }

  clearValue(): void {
    this.inputFormControl.setValue('');
    this._selectedValue = null;
    this.emit();
  }

  newValue(value: any): void {
    this.writeValue(value);
  }

  masterToggle(event): void {
    // console.log('masterToggle event', event);
    this.itemsSelected.masterToggle(this.filteredItems);
  }

  updateSelectedFirst(): void {
    if (this.showSelectedFirst === true) {
      this.items = this.items.sort((a, b) => {
        if (this.itemsSelected.isSelected(a) && this.itemsSelected.isSelected(b)) {
          return 0;
        }
        if (this.itemsSelected.isSelected(a) && !this.itemsSelected.isSelected(b)) {
          return -1;
        }
        return 1;
      });
    }
  }

}
