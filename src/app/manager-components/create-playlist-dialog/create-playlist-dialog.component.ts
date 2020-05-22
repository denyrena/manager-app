import { NewPlaylistName } from './../../manager-core/entities/new-playlist-name.interface';
import { Platform } from './../../manager-core/enums/platform.enum';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-create-playlist-dialog',
    templateUrl: './create-playlist-dialog.component.html',
    styleUrls: ['./create-playlist-dialog.component.scss'],
})
export class CreatePlaylistDialogComponent implements OnInit {
    platformSelectControl = new FormControl('', Validators.required);
    plsNameInputControl = new FormControl('', Validators.required);
    platforms = Platform;

    constructor(
        public dialogRef: MatDialogRef<CreatePlaylistDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: NewPlaylistName
    ) {}

    ngOnInit(): void {}

    cancel() {
        this.dialogRef.close();
    }
}
