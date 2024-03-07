import { Pipe, PipeTransform } from "@angular/core";
import { IsNullOrUndefinedOrEmptyString } from "../../../helpers/helper-functions.helper";

@Pipe({
    name: 'choices',
    standalone: true,
})
export class ChoiceAttributePipe implements PipeTransform {
    transform(value: string, ...args: any[]): string[] {
        if (value && value.trim().length) {
            return value.trim().split(';').filter(x => !IsNullOrUndefinedOrEmptyString(x)).map(x => x.trim())
        }

        return [];
    }
}