import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoRecorderComponent } from './video-recorder/video-recorder.component';
import { SecondsToTimePipe } from '../../../pipes/second-to-timestring.pipe';
@NgModule({
    declarations: [VideoRecorderComponent],
    imports: [CommonModule, SecondsToTimePipe],
    exports: [VideoRecorderComponent]

})
export class VideoRecordingModule { }
