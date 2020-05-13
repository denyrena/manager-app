import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'batch',
})
export class BatchSplitPipe<T> implements PipeTransform {
    transform(value: Array<T>): Array<Array<T>> {
        const R = [];
        for (let i = 0; i < value.length; i += 4) {
            R.push(value.slice(i, i + 4));
        }
        return R;
    }
}
