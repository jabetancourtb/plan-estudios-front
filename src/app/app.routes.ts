import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { AsignaturasBubbleChartComponent } from './pages/asignaturas/bubble-chart/echart/asignaturas-bubble-chart.component';
import { CamposFormacionBubbleChartComponent } from './pages/campos-formacion/echart/bubble-chart/campos-formacion-bubble-chart.component';
import { AreasFormacionBubbleChartComponent } from './pages/areas-formacion/echart/bubble-chart/areas-formacion-bubble-chart.component';
import { PlanEstudiosCirclePackingComponent } from './pages/plan-estudios/echart/circle-packing/plan-estudios-circle-packing.component';

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
        path: 'campos-formacion/echart/bubble-chart',
        component: CamposFormacionBubbleChartComponent,
    },
    {
        path: 'areas-formacion/echart/bubble-chart',
        component: AreasFormacionBubbleChartComponent,
    },
    {
        path: 'asignaturas/echart/bubble-chart',
        component: AsignaturasBubbleChartComponent,
    },
    {
        path: 'plan-estudios/echart/circle-packing',
        component: PlanEstudiosCirclePackingComponent,
    },

];
