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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Nullable } from 'primeng/ts-helpers';
import { FormsModule } from '@angular/forms';

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
  ],
  providers: [ConfirmationService],
  templateUrl: './attendance.component.html',
  styles: ':host {width:100%}',
})
export class AttendanceComponent {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _confirmDialogService: ConfirmationService =
    inject(ConfirmationService);
  private readonly _entryDialogType: WritableSignal<EntryDialogType> = signal(
    EntryDialogType.New
  );
  private readonly _weekCount: WritableSignal<number> = signal(0);
  private readonly _attendances: WritableSignal<Attendance[]> = signal([]);
  private readonly _currentAttendance: WritableSignal<Attendance | null> =
    signal(null);

  private readonly _currentSeason: WritableSignal<Season | null> = signal(null);

  private readonly currentSeason: Signal<Season | null> =
    this._currentSeason.asReadonly();

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
  protected entryDescription: string = '';
  protected entrySubject: string = '';
  protected entryHours: number = 0;

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
        console.log(attendances);
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
              subject: this.entrySubject,
              description: this.entryDescription,
              hours: this.entryHours,
            },
          ],
        },
        { headers }
      )
      .subscribe(() => {
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
}
