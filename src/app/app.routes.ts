import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { CamposFormacionBubbleChartComponent } from './pages/campos-formacion/bubble-chart/campos-formacion-bubble-chart.component';
import { CamposFormacionListaComponent } from './pages/campos-formacion/lista/campos-formacion-lista.component';
import { AreasFormacionBubbleChartComponent } from './pages/areas-formacion/bubble-chart/areas-formacion-bubble-chart.component';
import { AreasFormacionListaComponent } from './pages/areas-formacion/lista/areas-formacion-lista.component';
import { AsignaturasBubbleChartComponent } from './pages/asignaturas/bubble-chart/asignaturas-bubble-chart.component';
import { AsignaturasListaComponent } from './pages/asignaturas/lista/asignaturas-lista.component';
import { PlanEstudiosCirclePackingComponent } from './pages/plan-estudios/circle-packing/plan-estudios-circle-packing.component';
import { PrerrequisitosTreeChartComponent } from './pages/prerrequisitos/tree-chart/prerrequisitos-tree-chart.component';
import { PlanEstudiosSemestresComponent } from './pages/plan-estudios/semestres/plan-estudios-semestres.component';
import { PlanEstudiosSemestres2Component } from './pages/plan-estudios/semestres-2/plan-estudios-semestres-2.component';



// Si se editan las rutas o se adicionan,
// !IMPORTANTE! hacerlo también en src/app/utils/app-constants.ts en la sección de ROUTES
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
      path: 'campos-formacion/bubble-chart',
      component: CamposFormacionBubbleChartComponent,
    },
    {
      path: 'campos-formacion/lista',
      component: CamposFormacionListaComponent,
    },
    {
      path: 'areas-formacion/bubble-chart',
      component: AreasFormacionBubbleChartComponent,
    },
    {
      path: 'areas-formacion/lista',
      component: AreasFormacionListaComponent,
    },
    {
      path: 'asignaturas/bubble-chart',
      component: AsignaturasBubbleChartComponent,
    },
    {
      path: 'asignaturas/lista',
      component: AsignaturasListaComponent,
    },
    {
      path: 'prerrequisitos/tree-chart',
      component: PrerrequisitosTreeChartComponent,
    },
    {
      path: 'plan-estudios/circle-packing',
      component: PlanEstudiosCirclePackingComponent
    },
    {
      path: 'plan-estudios/semestres',
      component: PlanEstudiosSemestresComponent
    },
    {
      path: 'plan-estudios/semestres-2',
      component: PlanEstudiosSemestres2Component
    }
];
