export const html = `


<div class="w-full bg-secondary-container text-on-secondary-container px-margin py-space-sm flex items-center justify-between shadow-sm">
<div class="flex items-center gap-space-xs min-w-0">
<span class="material-symbols-outlined text-[18px] text-secondary flex-shrink-0">cloud_done</span>
<span class="font-label-sm text-label-sm truncate">Données synchronisées avec la paroisse</span>
</div>
<span class="font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-2 py-0.5 rounded-full flex-shrink-0">À jour</span>
</div>
<div class="p-margin flex flex-col gap-space-md w-full max-w-xl mx-auto">

<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[20px]">calendar_month</span>
</div>
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Registre Mensuel</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant">Paroisse Ste Thérèse de Cotonou</p>
</div>
</div>

<button class="h-10 px-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-1.5 active:bg-primary-container shadow-sm transition-all active:scale-95" id="btnExport">
<span class="material-symbols-outlined text-[18px]">download</span>
<span>Exporter</span>
</button>
</div>

<div class="grid grid-cols-2 gap-space-sm">
<div class="flex flex-col gap-1">
<label class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1" for="selectYear">
<span class="material-symbols-outlined text-[14px]">event</span> Année
          </label>
<div class="relative bg-surface-container-low rounded-lg overflow-hidden">
<select class="w-full h-11 bg-transparent px-3 pr-8 font-label-md text-label-md text-on-surface appearance-none outline-none focus:bg-surface-container" id="selectYear">
<option value="2023">2023</option>
<option selected="" value="2024">2024</option>
<option value="2025">2025</option>
</select>
<span class="material-symbols-outlined pointer-events-none absolute right-2.5 top-3 text-[18px] text-on-surface-variant">expand_more</span>
</div>
</div>
<div class="flex flex-col gap-1">
<label class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1" for="selectMonth">
<span class="material-symbols-outlined text-[14px]">date_range</span> Mois
          </label>
<div class="relative bg-surface-container-low rounded-lg overflow-hidden">
<select class="w-full h-11 bg-transparent px-3 pr-8 font-label-md text-label-md text-on-surface appearance-none outline-none focus:bg-surface-container" id="selectMonth">
<option value="avril">Avril 2024</option>
<option selected="" value="mai">Mai 2024</option>
<option value="juin">Juin 2024</option>
<option value="juillet">Juillet 2024</option>
</select>
<span class="material-symbols-outlined pointer-events-none absolute right-2.5 top-3 text-[18px] text-on-surface-variant">expand_more</span>
</div>
</div>
</div>

<div class="flex flex-col gap-1.5">
<label class="font-label-sm text-label-sm text-on-surface-variant">Groupe / Fraternité</label>
<div class="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
<button class="frat-filter-btn px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-primary text-on-primary whitespace-nowrap transition-colors flex-shrink-0" data-frat="all">
            Toutes
          </button>
<button class="frat-filter-btn px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface whitespace-nowrap transition-colors flex-shrink-0" data-frat="frat1">
            Fraternité 1 (St Paul)
          </button>
<button class="frat-filter-btn px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface whitespace-nowrap transition-colors flex-shrink-0" data-frat="frat2">
            Fraternité 2 (Ste Cécile)
          </button>
<button class="frat-filter-btn px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface whitespace-nowrap transition-colors flex-shrink-0" data-frat="frat3">
            Fraternité 3 (St Jean)
          </button>
</div>
</div>
</div>

<div class="grid grid-cols-2 gap-space-sm">
<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
<div class="flex items-center justify-between mb-2">
<span class="font-label-sm text-label-sm text-on-surface-variant">Présence Mensuelle</span>
<span class="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
<span class="material-symbols-outlined text-[16px]">how_to_reg</span>
</span>
</div>
<div class="flex items-baseline gap-1.5">
<span class="font-headline-md text-headline-md text-primary">82%</span>
<span class="font-label-sm text-label-sm text-secondary font-bold">+4% vs Avril</span>
</div>

<div class="w-full bg-surface-container-high h-1.5 rounded-full mt-2.5 overflow-hidden">
<div class="bg-secondary h-full rounded-full" style="width: 82%"></div>
</div>
</div>
<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
<div class="flex items-center justify-between mb-2">
<span class="font-label-sm text-label-sm text-on-surface-variant">Cotisations (Mai)</span>
<span class="w-7 h-7 rounded-full bg-surface-container-high text-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[16px]">savings</span>
</span>
</div>
<div class="flex items-baseline gap-1">
<span class="font-headline-md text-headline-md text-on-surface">6 800</span>
<span class="font-label-sm text-label-sm text-on-surface-variant font-bold">F CFA</span>
</div>
<div class="flex items-center gap-1 mt-2.5 text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
<span>17 cotisations à jour</span>
</div>
</div>
</div>

<div class="flex items-center justify-between bg-surface-container-high p-1 rounded-xl">
<button class="flex-1 py-2 px-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 bg-surface-container-lowest text-primary shadow-sm transition-all" id="viewTabMatrix">
<span class="material-symbols-outlined text-[18px]">table_chart</span>
<span>Vue Matricielle</span>
</button>
<button class="flex-1 py-2 px-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-all" id="viewTabList">
<span class="material-symbols-outlined text-[18px]">format_list_bulleted</span>
<span>Vue Détaillée</span>
</button>
</div>

<div class="w-full" id="contentSection">

<div class="flex flex-col gap-space-sm" id="matrixViewBlock">
<div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div class="px-space-md py-2.5 bg-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px] text-primary">swipe</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Faites défiler horizontalement</span>
</div>
<span class="font-label-sm text-label-sm bg-primary-container text-on-primary px-2 py-0.5 rounded-full">Mai 2024</span>
</div>

<div class="overflow-x-auto w-full overscroll-x-contain">
<table class="w-full border-collapse text-left select-none">
<thead>
<tr class="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">

<th class="sticky left-0 z-20 bg-surface-container-low px-space-md py-3 font-label-md text-label-md text-on-surface whitespace-nowrap min-w-[145px] shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                    Lecteur Junior
                  </th>

<th class="px-3 py-3 text-center whitespace-nowrap min-w-[62px]">05 Mai</th>
<th class="px-3 py-3 text-center whitespace-nowrap min-w-[62px]">12 Mai</th>
<th class="px-3 py-3 text-center whitespace-nowrap min-w-[62px]">19 Mai</th>
<th class="px-3 py-3 text-center whitespace-nowrap min-w-[62px]">26 Mai</th>

<th class="px-3 py-3 text-center whitespace-nowrap min-w-[55px] bg-surface-container-high/60">Tot. P</th>
<th class="px-3 py-3 text-center whitespace-nowrap min-w-[55px] bg-surface-container-high/60">Perm</th>
<th class="px-3 py-3 text-center whitespace-nowrap min-w-[55px] bg-surface-container-high/60">Abs</th>
<th class="px-4 py-3 text-center whitespace-nowrap min-w-[70px] bg-surface-container-high">Taux</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md text-on-surface">

<tr class="transition-colors hover:bg-surface-container-low/40">
<td class="sticky left-0 z-10 bg-surface-container-lowest px-space-md py-3 shadow-[2px_0_5px_rgba(0,0,0,0.04)] whitespace-nowrap min-w-[145px]">
<div class="flex items-center gap-2">
<div class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                        AD
                      </div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Aimé DOSSOU</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Frat. 1</span>
</div>
</div>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-tertiary-container text-on-primary font-label-sm text-label-sm items-center justify-center shadow-xs">Perm</span>
</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-secondary bg-surface-container-low/50">3</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-tertiary-container bg-surface-container-low/50">1</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low/50">0</td>
<td class="px-4 py-3 text-center font-label-md text-label-md text-primary bg-surface-container-high/60">75%</td>
</tr>

<tr class="transition-colors hover:bg-surface-container-low/40">
<td class="sticky left-0 z-10 bg-surface-container-lowest px-space-md py-3 shadow-[2px_0_5px_rgba(0,0,0,0.04)] whitespace-nowrap min-w-[145px]">
<div class="flex items-center gap-2">
<div class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                        BK
                      </div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Bérénice KOUASSI</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Frat. 2</span>
</div>
</div>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-secondary bg-surface-container-low/50">4</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low/50">0</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low/50">0</td>
<td class="px-4 py-3 text-center font-label-md text-label-md text-secondary bg-surface-container-high/60">100%</td>
</tr>

<tr class="transition-colors hover:bg-surface-container-low/40">
<td class="sticky left-0 z-10 bg-surface-container-lowest px-space-md py-3 shadow-[2px_0_5px_rgba(0,0,0,0.04)] whitespace-nowrap min-w-[145px]">
<div class="flex items-center gap-2">
<div class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                        CH
                      </div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Cédric HOUNGBO</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Frat. 1</span>
</div>
</div>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-error text-on-error font-label-sm text-label-sm items-center justify-center shadow-xs">A</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-secondary bg-surface-container-low/50">3</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low/50">0</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-error bg-surface-container-low/50">1</td>
<td class="px-4 py-3 text-center font-label-md text-label-md text-primary bg-surface-container-high/60">75%</td>
</tr>

<tr class="transition-colors hover:bg-surface-container-low/40">
<td class="sticky left-0 z-10 bg-surface-container-lowest px-space-md py-3 shadow-[2px_0_5px_rgba(0,0,0,0.04)] whitespace-nowrap min-w-[145px]">
<div class="flex items-center gap-2">
<div class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                        EG
                      </div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Estelle GANDONOU</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Frat. 3</span>
</div>
</div>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-tertiary-container text-on-primary font-label-sm text-label-sm items-center justify-center shadow-xs">Perm</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-error text-on-error font-label-sm text-label-sm items-center justify-center shadow-xs">A</span>
</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-secondary bg-surface-container-low/50">2</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-tertiary-container bg-surface-container-low/50">1</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-error bg-surface-container-low/50">1</td>
<td class="px-4 py-3 text-center font-label-md text-label-md text-error bg-surface-container-high/60">50%</td>
</tr>

<tr class="transition-colors hover:bg-surface-container-low/40">
<td class="sticky left-0 z-10 bg-surface-container-lowest px-space-md py-3 shadow-[2px_0_5px_rgba(0,0,0,0.04)] whitespace-nowrap min-w-[145px]">
<div class="flex items-center gap-2">
<div class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                        FO
                      </div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Félicien OUSSOULOU</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Frat. 2</span>
</div>
</div>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-secondary bg-surface-container-low/50">4</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low/50">0</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low/50">0</td>
<td class="px-4 py-3 text-center font-label-md text-label-md text-secondary bg-surface-container-high/60">100%</td>
</tr>

<tr class="transition-colors hover:bg-surface-container-low/40">
<td class="sticky left-0 z-10 bg-surface-container-lowest px-space-md py-3 shadow-[2px_0_5px_rgba(0,0,0,0.04)] whitespace-nowrap min-w-[145px]">
<div class="flex items-center gap-2">
<div class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                        GT
                      </div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Géraud TOSSOU</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Frat. 3</span>
</div>
</div>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-tertiary-container text-on-primary font-label-sm text-label-sm items-center justify-center shadow-xs">Perm</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm items-center justify-center shadow-xs">P</span>
</td>
<td class="px-3 py-3 text-center">
<span class="inline-flex w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm items-center justify-center">-</span>
</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-secondary bg-surface-container-low/50">2</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-tertiary-container bg-surface-container-low/50">1</td>
<td class="px-3 py-3 text-center font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low/50">0</td>
<td class="px-4 py-3 text-center font-label-md text-label-md text-primary bg-surface-container-high/60">67%</td>
</tr>
</tbody>
</table>
</div>
</div>

<div class="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center justify-around flex-wrap gap-2 text-center">
<div class="flex items-center gap-1.5">
<span class="w-4 h-4 rounded-full bg-secondary text-on-secondary font-label-sm text-[9px] flex items-center justify-center">P</span>
<span class="font-label-sm text-label-sm text-on-surface">Présent</span>
</div>
<div class="flex items-center gap-1.5">
<span class="w-4 h-4 rounded-full bg-tertiary-container text-on-primary font-label-sm text-[8px] flex items-center justify-center">Perm</span>
<span class="font-label-sm text-label-sm text-on-surface">Permission</span>
</div>
<div class="flex items-center gap-1.5">
<span class="w-4 h-4 rounded-full bg-error text-on-error font-label-sm text-[9px] flex items-center justify-center">A</span>
<span class="font-label-sm text-label-sm text-on-surface">Absent</span>
</div>
<div class="flex items-center gap-1.5">
<span class="w-4 h-4 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[9px] flex items-center justify-center">-</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Non renseigné</span>
</div>
</div>
</div>

<div class="hidden flex flex-col gap-space-sm" id="listViewBlock">

<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<div class="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md">AD</div>
<div>
<h3 class="font-label-lg text-label-lg text-on-surface">Aimé DOSSOU</h3>
<span class="font-body-sm text-body-sm text-on-surface-variant">Fraternité 1 • 1ère Lecture</span>
</div>
</div>
<div class="flex flex-col items-end">
<span class="font-headline-sm text-headline-sm text-primary">75%</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Taux présence</span>
</div>
</div>
<div class="grid grid-cols-4 gap-1.5 bg-surface-container-low p-2 rounded-lg text-center">
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">05 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">12 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">19 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">26 Mai</span>
<span class="w-6 h-6 rounded-full bg-tertiary-container text-on-primary font-label-sm text-[9px] flex items-center justify-center">Perm</span>
</div>
</div>
</div>

<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<div class="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md">BK</div>
<div>
<h3 class="font-label-lg text-label-lg text-on-surface">Bérénice KOUASSI</h3>
<span class="font-body-sm text-body-sm text-on-surface-variant">Fraternité 2 • Psaume</span>
</div>
</div>
<div class="flex flex-col items-end">
<span class="font-headline-sm text-headline-sm text-secondary">100%</span>
<span class="font-label-sm text-label-sm text-secondary">Assiduité totale</span>
</div>
</div>
<div class="grid grid-cols-4 gap-1.5 bg-surface-container-low p-2 rounded-lg text-center">
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">05 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">12 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">19 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">26 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
</div>
</div>

<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<div class="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md">CH</div>
<div>
<h3 class="font-label-lg text-label-lg text-on-surface">Cédric HOUNGBO</h3>
<span class="font-body-sm text-body-sm text-on-surface-variant">Fraternité 1 • 2ème Lecture</span>
</div>
</div>
<div class="flex flex-col items-end">
<span class="font-headline-sm text-headline-sm text-primary">75%</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">1 absence</span>
</div>
</div>
<div class="grid grid-cols-4 gap-1.5 bg-surface-container-low p-2 rounded-lg text-center">
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">05 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">12 Mai</span>
<span class="w-6 h-6 rounded-full bg-error text-on-error font-label-sm text-label-sm flex items-center justify-center">A</span>
</div>
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">19 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
<div class="flex flex-col items-center gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">26 Mai</span>
<span class="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center">P</span>
</div>
</div>
</div>
</div>

<div class="hidden flex flex-col gap-space-sm animate-pulse" id="skeletonViewBlock">
<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
<div class="h-5 bg-surface-container-high rounded w-1/3"></div>
<div class="space-y-3">
<div class="h-10 bg-surface-container-high rounded"></div>
<div class="h-10 bg-surface-container-high rounded"></div>
<div class="h-10 bg-surface-container-high rounded"></div>
<div class="h-10 bg-surface-container-high rounded"></div>
</div>
</div>
</div>

<div class="hidden bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col items-center justify-center text-center" id="emptyViewBlock">
<div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-space-sm">
<span class="material-symbols-outlined text-[32px]">event_busy</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Aucune présence enregistrée</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs">
          Les fiches de présence pour ce mois ou cette fraternité n'ont pas encore été renseignées par le secrétaire.
        </p>
<button class="mt-space-md h-11 px-space-lg bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-1.5 active:bg-primary-container">
<span class="material-symbols-outlined text-[18px]">add_circle</span>
<span>Saisir un culte</span>
</button>
</div>
</div>

<div class="fixed bottom-20 left-4 right-4 max-w-sm mx-auto bg-inverse-surface text-inverse-on-surface p-space-md rounded-xl shadow-xl flex items-center justify-between gap-space-sm transition-all duration-300 transform translate-y-24 opacity-0 pointer-events-none z-50" id="exportToast">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-secondary-fixed text-[22px]">check_circle</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md">Exportation lancée</span>
<span class="font-body-sm text-body-sm text-surface-variant">Matrice_Mai_2024.xlsx généré</span>
</div>
</div>
<button class="text-surface-variant hover:text-inverse-on-surface p-1" id="closeToast">
<span class="material-symbols-outlined text-[18px]">close</span>
</button>
</div>

</div>

`;
