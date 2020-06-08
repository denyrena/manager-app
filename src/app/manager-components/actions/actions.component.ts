import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WizardComponent } from '../wizard/wizard.component';

@Component({
    selector: 'app-actions',
    templateUrl: './actions.component.html',
    styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent implements OnInit {
    constructor(private dialog: MatDialog) {}

    ngOnInit(): void {}

    startMigration() {
        const dialogRef = this.dialog.open(WizardComponent, {
            width: '800px',
            height: '480px',
        });
    }
}
