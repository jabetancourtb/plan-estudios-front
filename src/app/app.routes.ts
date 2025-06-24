import { Routes } from '@angular/router';
import { AsignaturasComponent } from './pages/asignaturas/asignaturas.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'asignaturas',
        pathMatch: 'full'
    },
    {
        path: 'asignaturas',
        component: AsignaturasComponent,
    },
];
