import { Routes } from '@angular/router';
import { AsignaturasComponent } from './pages/asignaturas/asignaturas.component';
import { IndexComponent } from './pages/index/index.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'index',
        pathMatch: 'full'
    },
    {
        path: 'index',
        component: IndexComponent,
    },
    {
        path: 'index/:tipoGrafico',
        component: IndexComponent,
    },
];
