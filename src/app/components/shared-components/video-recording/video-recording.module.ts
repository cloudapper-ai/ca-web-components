import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondsToTimePipe } from '../../../pipes/second-to-timestring.pipe';
import { TimeSpanComponent } from './time-span.component';
import { VideoRecorderComponent } from './video-recorder/video-recorder.component';
@NgModule({
    declarations: [VideoRecorderComponent, TimeSpanComponent],
    imports: [CommonModule, SecondsToTimePipe],
    exports: [VideoRecorderComponent]

})
export class VideoRecordingModule { }
