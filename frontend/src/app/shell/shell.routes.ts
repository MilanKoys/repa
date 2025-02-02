import { Route } from '@angular/router';
import { AttendanceComponent } from '../attendance/attendance.component';
import { ShellComponent } from './shell.component';

export const routes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'attendance',
        component: AttendanceComponent,
      },
    ],
  },
];
