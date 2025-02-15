import {
  Component,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

enum EntryDialogType {
  New,
  Update,
}

@Component({
  selector: 'app-attendance',
  imports: [
    ButtonModule,
    TooltipModule,
    DividerModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    TagModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './attendance.component.html',
  styles: ':host {width:100%}',
})
export class AttendanceComponent {
  private readonly _confirmDialogService: ConfirmationService =
    inject(ConfirmationService);
  private readonly _entryDialogType: WritableSignal<EntryDialogType> = signal(
    EntryDialogType.New
  );

  protected readonly entryDialogType: Signal<EntryDialogType> =
    this._entryDialogType.asReadonly();
  protected readonly entryDialogTypes: typeof EntryDialogType = EntryDialogType;
  protected entryModalVisible: boolean = false;
  protected toggleEntryDialog(type?: EntryDialogType) {
    if (type !== undefined) this._entryDialogType.set(type);
    this.entryModalVisible = !this.entryModalVisible;
  }

  protected confirmSubmit() {
    this._confirmDialogService.confirm({
      message: 'Are you sure that you want to submit the attendance?',
      header: 'Confirmation',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Submit',
      },
      accept: () => {},
      reject: () => {},
    });
  }
}
