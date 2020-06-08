import { MigrationSettings } from './../../manager-core/entities/migration-settings.class';
import { SpotifyUserInfoService } from 'src/app/services/spotify/spotify-user-info.service';
import { DeezerUserInfoService } from './../../services/deezer/deezer-user-info.service';
import { UIPlaylist } from 'src/app/manager-core/entities/UI/ui-playlist.class';
import { DataSourceType } from './../../manager-core/enums/data-source-type.enum';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { Platform } from 'src/app/manager-core/enums/platform.enum';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MigrationService } from 'src/app/services/migration.service';
import { UITrack } from 'src/app/manager-core/entities/UI/ui-track.class';

@Component({
    selector: 'app-wizard',
    templateUrl: './wizard.component.html',
    styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit {
    platforms = Platform;

    searchProgress: Observable<{
        ok: number;
        notOk: number;
        total: number;
    }>;
    insertProgress: Observable<{
        ok: number;
        total: number;
    }>;
    isBusy = false;
    currentStep: number = 1;
    @ViewChild('stepper') private stepper: MatStepper;
    sourcePlatformSelectControl = new FormControl('', Validators.required);
    sourcePlaylistSelectControl = new FormControl('');
    targetPlatformSelectControl = new FormControl('', Validators.required);
    sourceLinkInputControl = new FormControl('');
    targetPlaylistInputControl = new FormControl('');

    migrationSettings: MigrationSettings = new MigrationSettings();
    sourcePlaylists: Observable<UIPlaylist[]>;
    foundTracks: UITrack[];

    constructor(
        public dialogRef: MatDialogRef<WizardComponent>,
        private dzInfo: DeezerUserInfoService,
        private spotyInfo: SpotifyUserInfoService,
        private migrator: MigrationService
    ) {
        dialogRef.disableClose = true;
    }

    ngOnInit(): void {
        this.loadPlaylists();
    }

    loadPlaylists() {
        this.sourcePlaylists =
            this.migrationSettings.sourcePlatform === Platform.Deezer
                ? this.dzInfo
                      .fetchUserPlaylists()
                      .pipe(
                          map((responce) =>
                              responce.data.map((rawPls) =>
                                  UIPlaylist.createFromDeezerRawData(rawPls)
                              )
                          )
                      )
                : this.spotyInfo
                      .fetchUserPlaylists()
                      .pipe(
                          map((responce) =>
                              responce.map((rawPls) =>
                                  UIPlaylist.createFromSpotifyRawData(rawPls)
                              )
                          )
                      );
    }

    selectSourceType(type: DataSourceType) {
        this.migrationSettings.sourceType = type;
    }
    selectTargetType(type: DataSourceType) {
        this.migrationSettings.targetType = type;
    }

    nextStep() {
        if (this.currentStep < 3) {
            switch (this.currentStep) {
                case 1:
                    this.InitLoadingAndSearch();
                    break;
                case 2:
                    this.InitImport();
                    break;
                default:
                    break;
            }
            this.stepper.next();
            this.currentStep++;
        } else {
            this.dialogRef.close();
        }
    }
    InitImport() {
        this.isBusy = true;
        this.migrator.importToTarget(this.migrationSettings, this.foundTracks);
        this.insertProgress =
            this.migrationSettings.targetPlatform === Platform.Deezer
                ? this.dzInfo.insertStatusObservable$
                : this.spotyInfo.insertStatusObservable$;
        this.insertProgress.subscribe((p) => {
            this.isBusy = this.calcInsertProgress(p) < 100;
            console.log(p);
        });
    }
    InitLoadingAndSearch() {
        this.isBusy = true;
        this.migrator
            .loadSourceAndSearch(this.migrationSettings)
            .subscribe((found) => {
                this.foundTracks = found;
            });

        this.searchProgress =
            this.migrationSettings.targetPlatform === Platform.Deezer
                ? this.dzInfo.searchStatusObservable$
                : this.spotyInfo.searchStatusObservable$;
        this.searchProgress.subscribe(
            (p) => (this.isBusy = this.calcSearchProgress(p) < 100)
        );
    }

    getNextStepActionName() {
        if (this.currentStep < 3) {
            return 'Next';
        } else {
            return 'Finish';
        }
    }
    calcSearchProgress(progress: {
        ok: number;
        notOk: number;
        total: number;
    }): number {
        return Math.ceil(
            ((progress.ok + progress.notOk) / progress.total) * 100
        );
    }
    calcInsertProgress(progress: { ok: number; total: number }): number {
        return Math.ceil((progress.ok / progress.total) * 100);
    }

    cancel() {
        this.dialogRef.close();
    }
}
