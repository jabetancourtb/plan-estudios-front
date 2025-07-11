import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterPaginationDTO } from '../../../../dto/filter-pagination.model';


@Component({
  selector: 'app-filter-pagination',
  imports: [ReactiveFormsModule, NgbDropdownModule],
  templateUrl: './filter-pagination.component.html',
  styleUrl: './filter-pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPaginationComponent {

  private fb = inject(FormBuilder);

  filterRequest = input.required<FilterPaginationDTO>();

  @Output() filterResponse: EventEmitter<any> = new EventEmitter();


  filterForm = this.fb.group({
    pageSize : [10],
    field : '',
    ascending : [true],
    searchTerm : [''],
  });


  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['filterRequest']) {
      this.filterForm.get('pageSize')?.setValue(this.filterRequest().pageSize);
      this.filterForm.get('field')?.setValue(this.filterRequest().field);
      this.filterForm.get('ascending')?.setValue(this.filterRequest().ascending);
    }
  }


  updateFilters(filterForm: any) {
    this.filterResponse.emit({
      currentPage: filterForm.currentPage,
      pageSize: filterForm.pageSize,
      field: filterForm.field,
      ascending: filterForm.ascending,
      searchTerm: filterForm.searchTerm
    });
  }


  clearFilters() {
    this.filterForm.get('pageSize')?.setValue(10);
    this.filterForm.get('field')?.setValue('');
    this.filterForm.get('ascending')?.setValue(true);
    this.filterForm.get('searchTerm')?.setValue('');
    this.filterResponse.emit(this.filterForm.value);
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
