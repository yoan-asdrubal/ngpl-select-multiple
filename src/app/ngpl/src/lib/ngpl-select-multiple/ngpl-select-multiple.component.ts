import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Changes} from 'ngx-reactivetoolkit';
import {ReplaySubject} from 'rxjs';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import {TitleCasePipe} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {NGPL_FILTER_BASE, NgplCustomSelectionModel, NgplFilterBase, NgplFilterPipe} from 'ngpl-common';

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
  @Input() panelWidth = '';

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
  @Input() skeleton = false;

  /**  Define si se muestra el orden de seleccion de un item */
  @Input() orderSelection = false;


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
  itemsSelected: NgplCustomSelectionModel<any> = new NgplCustomSelectionModel<any>();

  /** Controla internamente los elementos filtrados para mostrar en el panel del autocomplete */
  filteredItems$ = new ReplaySubject<any[]>(1);

  /** Elementos resultantes de aplicar los filtros */
  filteredItems = [];

  /** Referencia al input de busqueda */
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  /**
   * Rererencia al panel del autocomplete
   */

  filterPipe = new NgplFilterPipe();

  filterConfig = {};
  _selectedValue: any[];
  @Input() customClass = '';

  @Input() disabledControl = false;

  @Input() readOnlyControl = false;

  /**
   * Template para mostrar cuando no existan resultados en la búsqueda, es opcional.
   */
  @Input() noResultTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder) {
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
    this.itemsSelected.setKey(this.trackBy || 'id');

    this.filteredItems = this.items || [];
    this.filteredItems$.next(this.filteredItems.slice());
    this.items$
      .pipe(
        untilDestroyed(this),
        tap((items: any[]) => {
          this.items = items;
          if (isNotNullOrUndefined(this.items) && this.items.length > 0) {
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
        , debounceTime(300)
        , tap((value) => {
          this.filterConfig = {
            filter: {
              value: value,
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
  }

  select(items: any[]): void {
    const values = [];
    const labels = [];
    const titleCase = new TitleCasePipe();
    items.forEach(item => {
      let label = item;
      let value = item;
      if (!item) {
        label = '';
        value = '';
      } else {
        if (label !== '') {
          label = this.labelFn ? this.labelFn(item) : item[this.propLabel] || item;
        }
        if (value !== '') {
          value = this.propValue ? item[this.propValue] : item;
        }
      }
      labels.push(label);
      values.push(value);
    });

    this.inputFormControl.setValue(titleCase.transform(labels.join(', ')));
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
    const itemsFil = this.filterPipe.transform(items, filter);
    this.filteredItems = this.ordenarItemsSeleccionados(itemsFil);
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

  /**
   * Reacciona al cambio de seleccion de la lista que se muestra en el autocomplete
   */
  onItemsSelectionChange(event: MatAutocompleteSelectedEvent | any): void {
    const {value} = event.option;
    this._updateSelected(value);
    this.searchInput.nativeElement.value = this.lastSearch;
  }

  /** Actualiza el estado de seleccion del item especificado */
  private _updateSelected(item): void {
    this.itemsSelected.toggle(item);
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
    this.inputFormControl.setValue('');
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
      this.searchInput.nativeElement.focus();
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
}
