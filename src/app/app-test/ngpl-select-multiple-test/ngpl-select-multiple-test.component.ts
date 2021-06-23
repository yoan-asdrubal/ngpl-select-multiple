import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'ngpl-select-test',
  templateUrl: './ngpl-select-multiple-test.component.html',
  styleUrls: ['./ngpl-select-multiple-test.component.scss']
})
export class NgplSelectMultipleTestComponent implements OnInit {


  items: any[] = [];

  formGroup: FormGroup;
  disableControl = new FormControl();
  readOnlyControl = new FormControl();
  loadingControl = new FormControl();


  constructor(private _formB: FormBuilder) {
  }

  ngOnInit(): void {
    this.formGroup = this._formB.group({
      select: [],
      select1: [],
      select2: [],
      select3: [],
      select4: [],
      select5: [],
      select6: [],
      select7: [],
      select8: [],
      select9: []
    });

    this.items = Array(1000).fill(1).map((i, index) => {

      return {
        id: index,
        descripcion: String.getRandomSentence(3)
      };
    });

  }

  labelFn(item): string {
    return `${item.id} - ${item.descripcion}`;
  }

}
