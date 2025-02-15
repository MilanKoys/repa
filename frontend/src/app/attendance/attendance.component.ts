import {
  Component,
  computed,
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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Nullable } from 'primeng/ts-helpers';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

enum EntryDialogType {
  New,
  Update,
}

interface Season {
  id: string;
  date: number;
  live: boolean;
}

export enum AttendanceStatus {
  New,
  Saved,
  Submited,
  Accepted,
  Rejected,
}

export interface Attendance {
  id: string;
  owner: string;
  week: number;
  content: AttendanceItem[];
  status: AttendanceStatus;
  season: string;
}

export interface AttendanceItem {
  subject: string;
  description: string;
  hours: number;
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
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './attendance.component.html',
  styles: ':host {width:100%}',
})
export class AttendanceComponent {
  private readonly _formsBuilder: FormBuilder = inject(FormBuilder);
  private readonly _dialogForm: FormGroup<{
    subject: FormControl<string | null>;
    description: FormControl<string | null>;
    hours: FormControl<number | null>;
  }> = this._formsBuilder.group<{
    subject: FormControl<string | null>;
    description: FormControl<string | null>;
    hours: FormControl<number | null>;
  }>({
    description: this._formsBuilder.control<string>('', {
      validators: [Validators.required, Validators.min(5)],
    }),
    subject: this._formsBuilder.control<string>('', {
      validators: [Validators.required, Validators.min(3), Validators.max(10)],
    }),
    hours: this._formsBuilder.control<number>(0, [
      Validators.required,
      Validators.max(20),
    ]),
  });
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _confirmDialogService: ConfirmationService =
    inject(ConfirmationService);
  private readonly _entryDialogType: WritableSignal<EntryDialogType> = signal(
    EntryDialogType.New
  );
  private readonly _weekCount: WritableSignal<number> = signal(0);
  private readonly _currentAttendanceItem: WritableSignal<number> = signal(0);
  private readonly _attendances: WritableSignal<Attendance[]> = signal([]);
  private readonly _currentAttendance: WritableSignal<Attendance | null> =
    signal(null);

  private readonly _currentSeason: WritableSignal<Season | null> = signal(null);

  protected readonly currentAttendanceItem: Signal<number> =
    this._currentAttendanceItem.asReadonly();
  protected readonly currentSeason: Signal<Season | null> =
    this._currentSeason.asReadonly();

  protected readonly totalHours: Signal<number> = computed(
    () =>
      this._currentAttendance()
        ?.content.map((c) => c.hours)
        .reduce((a, c) => a + c) ?? 0
  );

  protected readonly currentAttendance: Signal<Attendance | null> =
    this._currentAttendance.asReadonly();
  protected readonly entryDialogType: Signal<EntryDialogType> =
    this._entryDialogType.asReadonly();
  protected readonly entryDialogTypes: typeof EntryDialogType = EntryDialogType;
  protected readonly weekCount: Signal<number> = this._weekCount.asReadonly();
  protected readonly attendances: Signal<Attendance[]> =
    this._attendances.asReadonly();
  protected readonly attendanceStatuses: typeof AttendanceStatus =
    AttendanceStatus;
  protected entryModalVisible: boolean = false;
  protected readonly currentWeek: Signal<null | number> = computed(
    () => this._currentAttendance()?.week ?? null
  );

  constructor() {
    this._load();
  }

  private _load() {
    this._getSeason();
    this._getAttendance();
  }

  private _getAttendance() {
    const headers = new HttpHeaders().append(
      'authorization',
      localStorage.getItem('token') ?? ''
    );
    this._httpClient
      .get<Attendance[]>('http://localhost:3000/attendance', { headers })
      .subscribe((attendances: Attendance[]) => {
        this._attendances.set(attendances);
      });
  }

  private _getSeason() {
    const headers = new HttpHeaders().append(
      'authorization',
      localStorage.getItem('token') ?? ''
    );
    this._httpClient
      .get<Season>('http://localhost:3000/attendance/season', { headers })
      .subscribe((season: Season) => {
        const startDate: Date = new Date(season.date);
        const currentDate: Date = new Date();
        const deltaDate: number = currentDate.getTime() - startDate.getTime();
        const weekCount: number = Math.floor(
          deltaDate / 1000 / 60 / 60 / 24 / 7
        );
        this._currentSeason.set(season);
        this._weekCount.set(weekCount);
      });
  }

  protected createAttendance(week: number) {
    const headers = new HttpHeaders().append(
      'authorization',
      localStorage.getItem('token') ?? ''
    );
    this._httpClient
      .post<Attendance>(
        'http://localhost:3000/attendance',
        { week },
        { headers }
      )
      .subscribe((attendance: Attendance) => {
        this._load();
        this._currentAttendance.set(attendance);
      });
  }

  protected numberToArray(number: number) {
    return new Array(number).map((item, index) => index);
  }

  protected getAttendaceWeek(week: number): Nullable<Attendance> {
    return this._attendances().find((a) => a.week == week) ?? null;
  }

  protected toggleEntryDialog(type?: EntryDialogType) {
    if (type !== undefined) this._entryDialogType.set(type);
    this.entryModalVisible = !this.entryModalVisible;
  }

  protected addAttendanceItem() {
    const headers = new HttpHeaders().append(
      'authorization',
      localStorage.getItem('token') ?? ''
    );
    const attendance: Nullable<Attendance> = this._currentAttendance();
    if (!attendance) return;
    this._httpClient
      .post<boolean>(
        `http://localhost:3000/attendance/${attendance.id}`,
        {
          content: [
            ...attendance.content,
            {
              subject: this.dialogForm.controls.subject.value ?? '',
              description: this.dialogForm.controls.description.value ?? '',
              hours: this.dialogForm.controls.hours.value ?? 0,
            },
          ],
        },
        { headers }
      )
      .subscribe(() => {
        this.dialogForm.controls.subject.setValue(null);
        this.dialogForm.controls.description.setValue(null);
        this.dialogForm.controls.hours.setValue(null);
        this.toggleEntryDialog();
        this.createAttendance(attendance.week);
      });
  }

  protected newAttendanceItem() {
    this.dialogForm.controls.subject.setValue(null);
    this.dialogForm.controls.description.setValue(null);
    this.dialogForm.controls.hours.setValue(null);
    this.dialogForm.controls.subject.reset();
    this.dialogForm.controls.description.reset();
    this.dialogForm.controls.hours.reset();
    this.toggleEntryDialog(EntryDialogType.New);
  }

  protected editAttendanceItem(index: number) {
    const attendance: Nullable<Attendance> = this._currentAttendance();
    if (!attendance) return;
    this._currentAttendanceItem.set(index);

    this.dialogForm.controls.subject.setValue(
      attendance.content[index].subject
    );
    this.dialogForm.controls.description.setValue(
      attendance.content[index].description
    );
    this.dialogForm.controls.hours.setValue(attendance.content[index].hours);
    this.toggleEntryDialog(EntryDialogType.Update);
  }

  protected updateAttendanceItem(index: number) {
    const headers = new HttpHeaders().append(
      'authorization',
      localStorage.getItem('token') ?? ''
    );
    const attendance: Nullable<Attendance> = this._currentAttendance();
    if (!attendance) return;
    this._httpClient
      .post<boolean>(
        `http://localhost:3000/attendance/${attendance.id}`,
        {
          content: attendance.content.map((attendance, position) => {
            if (position == index) {
              attendance.subject = this.dialogForm.controls.subject.value ?? '';
              attendance.description =
                this.dialogForm.controls.description.value ?? '';
              attendance.hours = this.dialogForm.controls.hours.value ?? 0;
            }
            return attendance;
          }),
        },
        { headers }
      )
      .subscribe(() => {
        this.dialogForm.controls.subject.setValue(null);
        this.dialogForm.controls.description.setValue(null);
        this.dialogForm.controls.hours.setValue(null);
        this.toggleEntryDialog();
        this.createAttendance(attendance.week);
      });
  }

  protected getWeekStatusColor(week: number): string {
    const attendnace = this.getAttendaceWeek(week);
    if (!attendnace) return 'bg-gray-500';
    switch (attendnace.status) {
      case AttendanceStatus.New:
        return 'bg-primary-200';
      default:
        return 'bg-gray-500';
    }
  }

  protected getWeekDateString(week: number) {
    const season = this._currentSeason();
    if (!season) return '';
    const dateStart = new Date(season.date + week * 7 * 24 * 60 * 60 * 1000);
    const dateEnd = new Date(
      season.date + (week + 1) * 7 * 24 * 60 * 60 * 1000
    );
    return `${dateStart.getDate()}.${
      dateStart.getMonth() + 1
    }.${dateStart.getFullYear()} - ${dateEnd.getDate()}.${
      dateEnd.getMonth() + 1
    }.${dateEnd.getFullYear()}`;
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

  protected get dialogForm() {
    return this._dialogForm;
  }
}
