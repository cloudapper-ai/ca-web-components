import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioRecorderComponent } from './audio-recorder/audio-recorder.component';
import { SecondsToTimePipe } from '../../../pipes/second-to-timestring.pipe';

@NgModule({
    declarations: [AudioRecorderComponent],
    imports: [CommonModule, SecondsToTimePipe],
    exports: [AudioRecorderComponent]

})
export class AudioRecordingModule { }
