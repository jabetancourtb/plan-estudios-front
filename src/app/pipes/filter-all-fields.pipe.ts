import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterAllFields',
  standalone: true
})
export class FilterAllFieldsPipe implements PipeTransform {

  transform(items: any[], searchTerm: string): any[] {

    if (!items || !searchTerm) return items;

    const lowerSearch = searchTerm.toLowerCase();

    return items.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(lowerSearch)
      )
    );

  }

}
