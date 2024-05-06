import { Component, EventEmitter, Output } from "@angular/core";
import { Assets } from "../../../../models/assets.model";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'chat-scan',
    templateUrl: './chat-scan.component.html',
    styleUrls: ['./chat-scan.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatScanComponent {
    @Output() requestCodeScan: EventEmitter<void> = new EventEmitter();
    protected Assets = Assets;
}