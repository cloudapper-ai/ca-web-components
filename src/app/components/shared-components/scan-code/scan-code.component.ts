import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NgxScannerQrcodeComponent, NgxScannerQrcodeModule, NgxScannerQrcodeService, ScannerQRCodeResult, ScannerQRCodeSymbolType } from "ngx-scanner-qrcode";
import { BehaviorSubject } from "rxjs";
import { Assets } from "../../../models/assets.model";

@UntilDestroy()
@Component({
    selector: "scan-code",
    templateUrl: "./scan-code.component.html",
    styleUrls: ["./scan-code.component.css"],
    standalone: true,
    imports: [CommonModule, NgxScannerQrcodeModule]
})
export class ScanCodeComponent implements OnInit, AfterViewInit, OnDestroy {

    /**
     * Lists available videoInput devices
     * @returns a list of media device info.
     */
    getAvailableDevices(): Promise<MediaDeviceInfo[]> {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return Promise.reject("Couldn't find camera information");
        }

        return new Promise((resolve, reject) => {
            navigator.mediaDevices.enumerateDevices()
                .then((devices: MediaDeviceInfo[]) => {
                    resolve(devices.filter(x => x.kind === 'videoinput'));
                })
                .catch(err => {
                    reject(err.message || err);
                })
        })
    }

    protected rotateCameraClicked() {
        const devices = this.devices$.getValue()
        if (devices.length > 1) {
            const newIndex = (this.deviceIndex + 1) % devices.length;
            this.startScanning(newIndex);
        }
    }

    protected devices$ = new BehaviorSubject<MediaDeviceInfo[]>([]);

    ngOnInit(): void {
        this.getAvailableDevices().then(devices => { this.devices$.next(devices); }).catch(err => { console.error(err.message || err) })
    }

    @ViewChild("scanner") scanner?: NgxScannerQrcodeComponent;

    protected deviceIndex: number = -1;

    protected Assets = Assets;

    ngAfterViewInit(): void {
        this.devices$.pipe(untilDestroyed(this)).subscribe(devices => {
            if (this.scanner && !this.scanner.isStart) {
                if (devices.length > 0) {
                    this.startScanning(0)
                }
            }
        })
    }


    private stopScanning() {
        if (this.scanner) {
            if (!this.scanner.isPause) {
                this.scanner.pause();
            }

            if (this.scanner.isStart) {
                this.scanner.stop();
            }
        }
    }

    private startScanning(index: number) {
        if (this.scanner) {
            const devices = this.devices$.getValue();
            if (devices.length > index) {
                this.stopScanning();
                this.scanner.start(() => {
                    if (this.scanner)
                        this.scanner.playDevice(devices[index].deviceId);
                    this.deviceIndex = index;
                })
            }
        }


    }

    ngOnDestroy(): void {
        this.stopScanning();
    }

    @Output() scanCompleted = new EventEmitter<CodeScanResult>();

    onScannedACode(result: ScannerQRCodeResult[]) {
        // if (this.scanner && this.scanner.isStart) { this.scanner.stop(); }
        if (result.length > 0) {
            const code = result[result.length - 1];
            const obj = new CodeScanResult(code.value, this.formatFromScanResult(code.type));
            this.scanCompleted.next(obj)
        }


    }

    private formatFromScanResult(type: ScannerQRCodeSymbolType): CodeFormats {
        switch (type) {
            case ScannerQRCodeSymbolType.ScannerQRCode_NONE: return CodeFormats.NONE;
            case ScannerQRCodeSymbolType.ScannerQRCode_PARTIAL: return CodeFormats.PARTIAL;
            case ScannerQRCodeSymbolType.ScannerQRCode_EAN2: return CodeFormats.EAN2;
            case ScannerQRCodeSymbolType.ScannerQRCode_EAN5: return CodeFormats.EAN5;
            case ScannerQRCodeSymbolType.ScannerQRCode_EAN8: return CodeFormats.EAN8;
            case ScannerQRCodeSymbolType.ScannerQRCode_UPCE: return CodeFormats.UPCA;
            case ScannerQRCodeSymbolType.ScannerQRCode_ISBN10: return CodeFormats.ISBN10;
            case ScannerQRCodeSymbolType.ScannerQRCode_UPCA: return CodeFormats.UPCA;
            case ScannerQRCodeSymbolType.ScannerQRCode_EAN13: return CodeFormats.EAN13;
            case ScannerQRCodeSymbolType.ScannerQRCode_ISBN13: return CodeFormats.ISBN13;
            case ScannerQRCodeSymbolType.ScannerQRCode_COMPOSITE: return CodeFormats.COMPOSITE;
            case ScannerQRCodeSymbolType.ScannerQRCode_I25: return CodeFormats.I25;
            case ScannerQRCodeSymbolType.ScannerQRCode_DATABAR: return CodeFormats.DATABAR;
            case ScannerQRCodeSymbolType.ScannerQRCode_DATABAR_EXP: return CodeFormats.DATABAR_EXP;
            case ScannerQRCodeSymbolType.ScannerQRCode_CODABAR: return CodeFormats.CODABAR;
            case ScannerQRCodeSymbolType.ScannerQRCode_CODE39: return CodeFormats.CODE39;
            case ScannerQRCodeSymbolType.ScannerQRCode_PDF417: return CodeFormats.PDF417;
            case ScannerQRCodeSymbolType.ScannerQRCode_QRCODE: return CodeFormats.QRCODE
            case ScannerQRCodeSymbolType.ScannerQRCode_SQCODE: return CodeFormats.SQCODE;
            case ScannerQRCodeSymbolType.ScannerQRCode_CODE93: return CodeFormats.CODE93;
            case ScannerQRCodeSymbolType.ScannerQRCode_CODE128: return CodeFormats.CODE128;
            case ScannerQRCodeSymbolType.ScannerQRCode_SYMBOL: return CodeFormats.SYMBOL;
            case ScannerQRCodeSymbolType.ScannerQRCode_ADDON2: return CodeFormats.EAN2;
            case ScannerQRCodeSymbolType.ScannerQRCode_ADDON5: return CodeFormats.EAN5;
            case ScannerQRCodeSymbolType.ScannerQRCode_ADDON: return CodeFormats.COMPOSITE;
        }
    }
}

export enum CodeFormats {
    NONE = 'NONE',
    PARTIAL = 'PARTIAL',
    EAN2 = 'EAN2',
    EAN5 = 'EAN5',
    EAN8 = 'EAN8',
    Upce = 'UPCE',
    ISBN10 = 'ISBN10',
    UPCA = 'UPCA',
    EAN13 = 'EAN13',
    ISBN13 = 'ISBN13',
    COMPOSITE = 'COMPOSITE',
    I25 = 'I25',
    DATABAR = 'DATABAR',
    DATABAR_EXP = 'DATABAR_EXP',
    CODABAR = 'CODABAR',
    CODE39 = 'CODE39',
    PDF417 = 'PDF417',
    QRCODE = 'QRCODE',
    SQCODE = 'SQCODE',
    CODE93 = 'CODE93',
    CODE128 = 'CODE128',
    SYMBOL = 'SYMBOL'
}

export class CodeScanResult {
    constructor(public code: string, public format: CodeFormats) { }
}