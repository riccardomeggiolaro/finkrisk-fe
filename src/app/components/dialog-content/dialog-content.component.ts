import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { MatButton } from "@angular/material/button";
import { NgFor, NgIf } from "@angular/common";

export interface DialogData {
  title: string;
  description: string[];
  type: 'success' | 'error' | 'warning';
}

@Component({
  selector: 'dialog-content-component',
  templateUrl: 'dialog-content.component.html',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, NgIf, NgFor],
})
export class DialogContentComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}