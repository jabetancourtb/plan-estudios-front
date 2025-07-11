import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, Output, SimpleChanges, effect  } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterPaginationDTO } from '../../../dto/filter-pagination.model';


@Component({
  selector: 'app-filter-pagination',
  imports: [ReactiveFormsModule, NgbDropdownModule],
  templateUrl: './filter-pagination.component.html',
  styleUrl: './filter-pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPaginationComponent {

  private fb = inject(FormBuilder);

  filterPaginationDTO = input.required<FilterPaginationDTO>();

  @Output() filterResponse: EventEmitter<any> = new EventEmitter();


  filterForm = this.fb.group({
    pageSize : [10],
    field : '',
    ascending : [true],
    searchTerm : [''],
  });


  ngOnChanges(changes: SimpleChanges): void {
    if(changes['filterPaginationDTO']){
      const dto = this.filterPaginationDTO();

      this.filterForm.patchValue({
        pageSize: dto.pageSize,
        field: dto.field,
        ascending: dto.ascending,
        searchTerm: dto.searchTerm
      }, { emitEvent: false });
    }
  }


  updateFilters(filterForm: any) {
    this.filterResponse.emit({
      pageSize: filterForm.pageSize,
      field: filterForm.field,
      ascending: filterForm.ascending,
      searchTerm: filterForm.searchTerm,
      action: 'filter'
    });
  }


  clearFilters() {
    this.filterForm.get('pageSize')?.setValue(10);
    this.filterForm.get('field')?.setValue(this.filterPaginationDTO().fieldsOptions[0].value);
    this.filterForm.get('ascending')?.setValue(true);
    this.filterForm.get('searchTerm')?.setValue('');

    this.filterResponse.emit({
      pageSize: this.filterForm.get('pageSize')?.value,
      field: this.filterForm.get('field')?.value,
      ascending:  this.filterForm.get('ascending')?.value,
      searchTerm: this.filterForm.get('searchTerm')?.value,
      action: 'clear'
    });
  }


  /*
  public onSubmit(filterForm: any): void {
    this.filterResponse.emit({
      currentPage: filterForm.currentPage,
      pageSize: filterForm.pageSize,
      field: filterForm.field,
      ascending: filterForm.ascending,
      searchTerm: filterForm.searchTerm
    });
  }
  */


}
