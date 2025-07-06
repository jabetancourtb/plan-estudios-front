import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { AsignaturasBubbleChartComponent } from './pages/echart/bubble-chart/asignaturas/asignaturas-bubble-chart.component';
import { CamposFormacionBubbleChartComponent } from './pages/echart/bubble-chart/campos-formacion/campos-formacion-bubble-chart.component';
import { AreasFormacionBubbleChartComponent } from './pages/echart/bubble-chart/areas-formacion/areas-formacion-bubble-chart.component';
import { PlanEstudiosCirclePackingComponent } from './pages/echart/circle-packing/plan-estudios/plan-estudios-circle-packing.component';

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
        path: 'bubble-chart/campos-formacion',
        component: CamposFormacionBubbleChartComponent,
    },
    {
        path: 'bubble-chart/areas-formacion',
        component: AreasFormacionBubbleChartComponent,
    },
    {
        path: 'bubble-chart/asignaturas',
        component: AsignaturasBubbleChartComponent,
    },
    {
        path: 'circle-packing/plan-estudios',
        component: PlanEstudiosCirclePackingComponent,
    },

];
