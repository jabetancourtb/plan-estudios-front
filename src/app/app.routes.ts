import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { CamposFormacionBubbleChartComponent } from './pages/campos-formacion/bubble-chart/campos-formacion-bubble-chart.component';
import { CamposFormacionListaComponent } from './pages/campos-formacion/lista/campos-formacion-lista.component';
import { AreasFormacionBubbleChartComponent } from './pages/areas-formacion/bubble-chart/areas-formacion-bubble-chart.component';
import { AreasFormacionListaComponent } from './pages/areas-formacion/lista/areas-formacion-lista.component';
import { AsignaturasBubbleChartComponent } from './pages/asignaturas/bubble-chart/asignaturas-bubble-chart.component';
import { AsignaturasListaComponent } from './pages/asignaturas/lista/asignaturas-lista.component';
import { PlanEstudiosCirclePackingComponent } from './pages/plan-estudios/circle-packing/plan-estudios-circle-packing.component';
import { AsignaturasTreeChartComponent } from './pages/asignaturas/tree-chart/asignaturas-tree-chart.component';
import { PlanEstudiosSemestresComponent } from './pages/plan-estudios/semestres/plan-estudios-semestres.component';
import { CamposFormacionIndexComponent } from './pages/campos-formacion/index/campos-formacion-index.component';
import { AreasFormacionIndexComponent } from './pages/areas-formacion/index/areas-formacion-index.component';
import { AsignaturasIndexComponent } from './pages/asignaturas/index/asignaturas-index.component';
import { PlanEstudiosIndexComponent } from './pages/plan-estudios/index/plan-estudios-index.component';



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
      path: 'campos-formacion/index',
      component: CamposFormacionIndexComponent,
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
      path: 'areas-formacion/index',
      component: AreasFormacionIndexComponent,
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
      path: 'asignaturas/index',
      component: AsignaturasIndexComponent,
    },
    {
      path: 'asignaturas/bubble-chart',
      component: AsignaturasBubbleChartComponent,
    },
    {
      path: 'asignaturas/tree-chart',
      component: AsignaturasTreeChartComponent,
    },
    {
      path: 'asignaturas/lista',
      component: AsignaturasListaComponent,
    },
    {
      path: 'plan-estudios/index',
      component: PlanEstudiosIndexComponent
    },
    {
      path: 'plan-estudios/semestres',
      component: PlanEstudiosSemestresComponent
    },
    {
      path: 'plan-estudios/circle-packing',
      component: PlanEstudiosCirclePackingComponent
    }
];
