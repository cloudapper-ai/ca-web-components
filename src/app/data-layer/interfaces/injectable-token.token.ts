import { InjectionToken } from "@angular/core";
import { IFileService } from "./file-service.interface";

export const TOKEN_FILE_SERVICE = new InjectionToken<IFileService>('file-service');