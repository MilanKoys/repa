import { Route } from '@angular/router';
import { ShellComponent } from './shell.component';
import { AttendanceComponent } from '../../attendance/attendance.component';

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
