import { ChangeDetectionStrategy, Component, EventEmitter, input, Input, Output } from '@angular/core';
import { FilterPaginationDTO } from '../../../dto/filter-pagination.model';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {

  /*@Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalRecordCount: number = 0;
  @Input() pages: number[] = [];
  */


  filterPaginationDTO = input.required<FilterPaginationDTO>();

  @Output() pageChange = new EventEmitter<number>();


  get rangeStart(): number {
    return (this.filterPaginationDTO().currentPage * this.filterPaginationDTO().pageSize) - (this.filterPaginationDTO().pageSize - 1);
  }


  get rangeEnd(): number {
    return this.filterPaginationDTO().currentPage < this.filterPaginationDTO().pages.length
      ? this.filterPaginationDTO().currentPage * this.filterPaginationDTO().pageSize
      : this.filterPaginationDTO().totalItems;
  }


  goToPage(page: number) {
    this.pageChange.emit(page);
  }


  goToPreviousPage() {
    if (this.filterPaginationDTO().currentPage > 1) {
      this.pageChange.emit(this.filterPaginationDTO().currentPage - 1);
    }
  }


  goToNextPage() {
    if (this.filterPaginationDTO().currentPage < this.filterPaginationDTO().pages.length) {
      this.pageChange.emit(this.filterPaginationDTO().currentPage + 1);
    }
  }

}
