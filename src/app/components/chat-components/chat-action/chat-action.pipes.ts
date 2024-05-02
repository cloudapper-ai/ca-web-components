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

@Pipe({
    name: 'attachments',
    standalone: true
})
export class AttachmentAttributePipe implements PipeTransform {
    transform(value: string, ...args: any[]): {
        name: string,
        link: string
    }[] {
        const regex = new RegExp('(\\[.+?\\])(\\(https?:.+?\\))', 'g');
        const links: {
            name: string,
            link: string
        }[] = []
        let match;
        while ((match = regex.exec(value))) {
            if (match && match.length === 3)
                links.push({
                    name: match[1], link: match[2]
                })
        }

        console.log(links)
        return links;
    }
}