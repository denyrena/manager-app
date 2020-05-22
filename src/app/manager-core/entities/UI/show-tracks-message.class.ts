import { Platform } from './../../enums/platform.enum';
import { ShowMode } from '../../enums/show-mode.enum';

export class ShowTracksMessage<T> {
    public action: ShowMode;
    public platform: Platform;
    public parentEntity: T;
}
