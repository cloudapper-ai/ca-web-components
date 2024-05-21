/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebCamComponent } from './web-cam/web-cam.component';
import * as faceapi from 'face-api.js';
import { BehaviorSubject } from 'rxjs';
import { EnumFaceDirection } from './lib-models/face-enums.model';


@Component({
    selector: 'lib-face-camera-lib',
    standalone: true,
    imports: [CommonModule, WebCamComponent],
    templateUrl: './face-camera-lib.component.html',
    styleUrls: ['./face-camera-lib.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaceCameraLibComponent implements OnInit {
    protected readonly KEY_MULTIPLE_FACE_FOUND = 'MultipleFaceFound';
    protected readonly KEY_STAY_STILL = 'StayStillInstruction';
    protected readonly KEY_TURN_RIGHT = 'TurnRightInstruction';
    protected readonly KEY_TURN_LEFT = 'TurnLeftInstruction';
    protected readonly KEY_TURN_STRAIGHT = 'TurnStraightInstruction';
    protected readonly KEY_COME_BEFORE_CAMERA = 'NoFaceInstruction';
    protected readonly KEY_POOR_DETECTION_SCORE = 'DetectionScorePoor';

    protected modelLoaded$ = new BehaviorSubject<boolean>(false);
    protected videoReady$ = new BehaviorSubject<boolean>(false);
    protected loadError$ = new BehaviorSubject<string | undefined>(undefined);

    @ViewChild('webcam') webcam?: WebCamComponent;
    @Input() allowMultipleFace: boolean = false;
    private _expectedFaceDirection: EnumFaceDirection = EnumFaceDirection.None;
    @Input()
    get expectedFaceDirection(): EnumFaceDirection { return this._expectedFaceDirection; }
    set expectedFaceDirection(value: EnumFaceDirection) {
        this._expectedFaceDirection = value;
        this.setInstructionText();
    }

    @Input() translation: (key: string) => string = (key: string) => {
        switch (key) {
            case this.KEY_MULTIPLE_FACE_FOUND: return 'Multiple face found.';
            case this.KEY_COME_BEFORE_CAMERA: return 'Please come infront of the camera';
            case this.KEY_STAY_STILL: return 'Please stay still';
            case this.KEY_TURN_LEFT: return 'Please turn to your left';
            case this.KEY_TURN_RIGHT: return 'Please turn to your right';
            case this.KEY_TURN_STRAIGHT: return 'Please look straight to the camera';
            case this.KEY_POOR_DETECTION_SCORE: return 'Poor detection score. Ensure the face is clearly visible and try again.';
        }
        return key;
    }

    protected instructiontext$: BehaviorSubject<string> = new BehaviorSubject<string>('');

    @Output() faceImageReceived = new EventEmitter<File>();

    ngOnInit(): void {
        this.loadModels().then(() => {
            this.modelLoaded$.next(true);
            this.loadError$.next(undefined);
        }).catch(err => {
            this.loadError$.error((err && err.message) ? err.message : err);
            this.modelLoaded$.next(false)
        })
    }

    private timer: NodeJS.Timeout | undefined;
    protected onVideoReady(data: {
        video: HTMLVideoElement,
        canvas: HTMLCanvasElement
    }) {
        const displaySize = { width: data.video.videoWidth, height: data.video.videoHeight };
        faceapi.matchDimensions(data.canvas, displaySize);
        const stillFaceDurationThreshold = 2000;
        let stillFaceDuration: number = 0;
        this.videoReady$.next(true);
        this.timer = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(data.video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
            data.canvas.getContext('2d')?.clearRect(0, 0, data.canvas.width, data.canvas.height);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            resizedDetections.forEach(resizedDetection => {
                const box: faceapi.IRect = {
                    x: resizedDetection.detection.box.left,
                    y: resizedDetection.detection.box.top,
                    width: resizedDetection.detection.box.width,
                    height: resizedDetection.detection.box.height,
                };

                faceapi.draw.drawDetections(data.canvas, box);

            })
            if (detections.length > 0) {
                if (this.expectedFaceDirection !== EnumFaceDirection.None) {
                    if (detections.length > 1) {
                        if (!this.allowMultipleFace) {
                            this.instructiontext$.next(this.KEY_MULTIPLE_FACE_FOUND);
                        } else {
                            let foundDirection: EnumFaceDirection | undefined = undefined;
                            for (let i = 0; i < detections.length; i++) {
                                const direction = this.checkDirection(detections[i])
                                if (direction === this.expectedFaceDirection) {
                                    if (detections[i].detection.score > 0.6) {
                                        const duration = stillFaceDuration + 100;
                                        if (duration < stillFaceDurationThreshold) {
                                            stillFaceDuration = duration;
                                        } else {
                                            this.webcam?.requestCaptureImage();
                                        }
                                        foundDirection = direction;
                                    } else {
                                        this.instructiontext$.next(this.KEY_POOR_DETECTION_SCORE);
                                    }
                                    break;
                                }
                            }
                            if (foundDirection) { this.setInstructionText(foundDirection) }
                            else { stillFaceDuration = 0; this.setInstructionText(); }
                        }
                    } else {
                        const direction = this.checkDirection(detections[0]);
                        this.setInstructionText(direction);
                        if (direction === this.expectedFaceDirection) {
                            const duration = stillFaceDuration + 100;
                            if (duration < stillFaceDurationThreshold) {
                                stillFaceDuration = duration;
                            } else {
                                this.webcam?.requestCaptureImage();
                            }
                        } else {
                            stillFaceDuration = 0;
                        }
                    }
                } else {
                    this.setInstructionText(this.expectedFaceDirection);
                    const duration = stillFaceDuration + 100;
                    if (duration < stillFaceDurationThreshold) {
                        stillFaceDuration = duration;
                    } else {
                        this.webcam?.requestCaptureImage();
                    }
                }
            } else {
                stillFaceDuration = 0;
                this.setInstructionText()
            }
        }, 100)
    }

    protected setInstructionText(direction?: EnumFaceDirection) {
        if (direction) {
            if (direction === this.expectedFaceDirection) {
                this.instructiontext$.next(this.KEY_STAY_STILL);
            } else {
                switch (this.expectedFaceDirection) {
                    case EnumFaceDirection.Left: this.instructiontext$.next(this.KEY_TURN_LEFT); break;
                    case EnumFaceDirection.Right: this.instructiontext$.next(this.KEY_TURN_RIGHT); break;
                    case EnumFaceDirection.Straight: this.instructiontext$.next(this.KEY_TURN_STRAIGHT); break;
                    case EnumFaceDirection.None: this.instructiontext$.next(this.KEY_COME_BEFORE_CAMERA); break;
                }
            }
        } else {
            this.instructiontext$.next(this.KEY_COME_BEFORE_CAMERA);
        }

    }

    protected checkDirection(face: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{
        detection: faceapi.FaceDetection;
    }, faceapi.FaceLandmarks68>>): EnumFaceDirection {
        const leftEye = face.landmarks.getLeftEye();
        const rightEye = face.landmarks.getRightEye();
        // const faceCenterX = (face.box.x + face.box.width / 2);
        const faceCenterX = (face.alignedRect.box.x + (face.alignedRect.box.width / 2));
        const leftEyeX = leftEye[0].x + (leftEye[3].x - leftEye[0].x) / 2;
        const rightEyeX = rightEye[0].x + (rightEye[3].x - rightEye[0].x) / 2;

        const eyeDistance = rightEyeX - leftEyeX;
        const relativePosition = (leftEyeX + rightEyeX) / 2 - faceCenterX;


        if (relativePosition < -0.125 * eyeDistance) {
            return EnumFaceDirection.Right;
        } else if (relativePosition > 0.125 * eyeDistance) {
            return EnumFaceDirection.Left;
        } else {
            return EnumFaceDirection.Straight;
        }
    }

    protected onCaptured(file: File) {
        this.faceImageReceived.next(file)
    }

    protected onVideoEnded() {
        this.videoReady$.next(false);
        if (this.timer) {
            clearInterval(this.timer)
        }
    }

    protected loadModels(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('./assets/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('./assets/models')
            ]).then(() => resolve()).catch(err => reject(err))
        })
    }
}
