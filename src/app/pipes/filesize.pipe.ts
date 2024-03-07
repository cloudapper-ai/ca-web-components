import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'filesize',
    standalone: true
})
export class FileSizePipe implements PipeTransform {
    transform(value: number, ...args: any[]): string {
        if (value < 1024) {
            return `${value.toFixed(2)} Byte`
        } else {
            const kb = value / 1024;
            if (kb >= 1024) {
                const mb = kb / 1024;
                if (mb >= 1024) {
                    const gb = mb / 1024;
                    return `${gb.toFixed(2)} GB`;
                } else {
                    return `${mb.toFixed(2)} MB`;
                }
            } else {
                return `${kb.toFixed(2)} KB`
            }
        }

    }

}