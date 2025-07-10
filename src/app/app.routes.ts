import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { AsignaturasBubbleChartComponent } from './pages/asignaturas/bubble-chart/echart/asignaturas-bubble-chart.component';
import { CamposFormacionBubbleChartComponent } from './pages/campos-formacion/echart/bubble-chart/campos-formacion-bubble-chart.component';
import { AreasFormacionBubbleChartComponent } from './pages/areas-formacion/echart/bubble-chart/areas-formacion-bubble-chart.component';
import { PlanEstudiosCirclePackingComponent } from './pages/plan-estudios/echart/circle-packing/plan-estudios-circle-packing.component';
import { PrerrequisitosTreeChartComponent } from './pages/prerrequisitos/echart/tree-chart/prerrequisitos-tree-chart/prerrequisitos-tree-chart.component';
import { AsignaturasListaComponent } from './pages/asignaturas/lista/asignaturas-lista/asignaturas-lista.component';
import { CamposFormacionListaComponent } from './pages/campos-formacion/lista/campos-lista/campos-formacion-lista.component';
import { AreasFormacionListaComponent } from './pages/areas-formacion/lista/areas-formacion-lista/areas-formacion-lista.component';

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
      path: 'campos-formacion/lista',
      component: CamposFormacionListaComponent,
    },
    {
      path: 'areas-formacion/echart/bubble-chart',
      component: AreasFormacionBubbleChartComponent,
    },
    {
      path: 'areas-formacion/lista',
      component: AreasFormacionListaComponent,
    },
    {
      path: 'asignaturas/echart/bubble-chart',
      component: AsignaturasBubbleChartComponent,
    },
    {
      path: 'asignaturas/lista',
      component: AsignaturasListaComponent,
    },
    {
    path: 'plan-estudios/echart/circle-packing',
    component: PlanEstudiosCirclePackingComponent,
    },
    {
      path: 'prerrequisitos/echart/tree-chart',
      component: PrerrequisitosTreeChartComponent,
    },

];
