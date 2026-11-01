export const html = `


<div class="px-margin pt-space-sm pb-space-xs">
<div class="flex items-center justify-between px-space-md py-space-xs rounded-xl bg-surface-container-high text-on-surface-variant">
<div class="flex items-center gap-space-xs">
<span class="inline-block w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
<span class="font-label-sm text-label-sm text-on-surface">Mode Paroisse Connecté</span>
</div>
<span class="font-body-sm text-body-sm text-outline">Synchronisation active</span>
</div>
</div>

<div class="px-margin py-space-xs">
<div class="relative overflow-hidden rounded-xl bg-primary text-on-primary p-space-md shadow-md">
<div class="absolute -right-4 -bottom-6 opacity-15 pointer-events-none">
<svg fill="currentColor" height="140" viewbox="0 0 100 100" width="140">
<path d="M50 0 L58 35 L93 35 L65 55 L76 90 L50 70 L24 90 L35 55 L7 35 L42 35 Z"></path>
</svg>
</div>
<div class="relative z-10 flex items-center justify-between">
<div>
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[20px] text-tertiary-fixed">church</span>
<span class="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider">Feuille d'Appel Dimanche</span>
</div>
<h1 class="font-headline-sm text-headline-sm text-on-primary mt-0.5">Appel des Lecteurs</h1>
</div>
<div class="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-primary-fixed">
<span class="material-symbols-outlined text-[22px]">calendar_month</span>
</div>
</div>
</div>
</div>

<div class="px-margin py-space-sm space-y-space-sm">

<div class="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
<label class="block font-label-md text-label-md text-on-surface mb-space-xs flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[18px] text-primary">event</span>
        Date de célébration liturgique
      </label>
<div class="relative">
<select class="w-full h-12 bg-surface-container-low text-on-surface font-body-lg text-body-lg rounded-lg px-space-md pr-10 appearance-none focus:outline-none focus:bg-surface-container-high transition-colors" id="date-select">
<option selected="" value="2024-05-12">Dimanche 12 Mai 2024 (Aujourd'hui)</option>
<option value="2024-05-05">Dimanche 05 Mai 2024</option>
<option value="2024-04-28">Dimanche 28 Avril 2024</option>
<option value="2024-04-21">Dimanche 21 Avril 2024</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
</div>
</div>

<div class="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[22px]">groups</span>
</div>
<div>
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase">Fraternité d'Assignation</span>
<span class="font-headline-sm text-headline-sm text-on-surface">Fraternité 2 (Saint Jean)</span>
</div>
</div>
<span class="px-space-sm py-1 bg-surface-container-high text-primary font-label-sm text-label-sm rounded-full">17 Inscrits</span>
</div>
</div>

<div class="sticky top-20 z-30 px-margin py-space-xs bg-surface/90 backdrop-blur-md">
<div class="p-space-sm bg-surface-container-lowest rounded-xl shadow-sm">
<div class="flex items-center justify-between mb-space-xs px-1">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-secondary">donut_large</span>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Pointage en direct</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Total : <strong class="text-on-surface" id="stat-total">17</strong> enfants</span>
</div>
<div class="grid grid-cols-3 gap-space-xs">

<div class="flex flex-col items-center justify-center p-space-xs rounded-lg bg-secondary text-on-secondary shadow-sm transition-all duration-200">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">check_circle</span>
<span class="font-headline-sm text-headline-sm" id="stat-p">12</span>
</div>
<span class="font-label-sm text-label-sm opacity-90">Présents</span>
</div>

<div class="flex flex-col items-center justify-center p-space-xs rounded-lg bg-on-tertiary-container text-on-tertiary shadow-sm transition-all duration-200">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">hourglass_top</span>
<span class="font-headline-sm text-headline-sm" id="stat-perm">2</span>
</div>
<span class="font-label-sm text-label-sm opacity-95">Permissions</span>
</div>

<div class="flex flex-col items-center justify-center p-space-xs rounded-lg bg-error text-on-error shadow-sm transition-all duration-200">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">cancel</span>
<span class="font-headline-sm text-headline-sm" id="stat-a">3</span>
</div>
<span class="font-label-sm text-label-sm opacity-90">Absents</span>
</div>
</div>
</div>
</div>

<div class="px-margin pt-space-md pb-space-xs flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[20px]">sort_by_alpha</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Liste alphabétique</h2>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Cocher pour modifier</span>
</div>

<div class="px-margin space-y-space-sm" id="roster-list">

<div class="child-card bg-surface-container-lowest p-space-md rounded-xl shadow-sm transition-all duration-150" data-id="1">
<div class="flex items-start justify-between gap-space-sm mb-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-11 h-11 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0">
            AR
          </div>
<div class="min-w-0">
<h3 class="font-body-lg text-body-lg text-on-surface font-bold truncate">AGBOSSOU Rodrigue</h3>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="px-2 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-full">CM2 • Liturgie B</span>
<span class="font-body-sm text-body-sm text-secondary flex items-center gap-0.5">
<span class="material-symbols-outlined text-[14px]">auto_stories</span> 1ère Lecture
              </span>
</div>
</div>
</div>
<span class="status-indicator px-2 py-1 bg-secondary text-on-secondary rounded-full font-label-sm text-label-sm flex-shrink-0">Présent</span>
</div>

<div class="grid grid-cols-3 gap-space-xs pt-space-xs">
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-secondary text-on-secondary shadow-sm" data-status="P" type="button">
<span class="material-symbols-outlined text-[20px]">check</span>
<span>Présent</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="Perm" type="button">
<span class="material-symbols-outlined text-[18px]">hourglass_empty</span>
<span>Perm</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="A" type="button">
<span class="material-symbols-outlined text-[18px]">close</span>
<span>Absent</span>
</button>
</div>
</div>

<div class="child-card bg-surface-container-lowest p-space-md rounded-xl shadow-sm transition-all duration-150" data-id="2">
<div class="flex items-start justify-between gap-space-sm mb-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-11 h-11 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0">
            AM
          </div>
<div class="min-w-0">
<h3 class="font-body-lg text-body-lg text-on-surface font-bold truncate">AKODJENOU Marjolaine</h3>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="px-2 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-full">6ème • Soliste</span>
<span class="font-body-sm text-body-sm text-secondary flex items-center gap-0.5">
<span class="material-symbols-outlined text-[14px]">music_note</span> Psaume
              </span>
</div>
</div>
</div>
<span class="status-indicator px-2 py-1 bg-secondary text-on-secondary rounded-full font-label-sm text-label-sm flex-shrink-0">Présent</span>
</div>
<div class="grid grid-cols-3 gap-space-xs pt-space-xs">
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-secondary text-on-secondary shadow-sm" data-status="P" type="button">
<span class="material-symbols-outlined text-[20px]">check</span>
<span>Présent</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="Perm" type="button">
<span class="material-symbols-outlined text-[18px]">hourglass_empty</span>
<span>Perm</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="A" type="button">
<span class="material-symbols-outlined text-[18px]">close</span>
<span>Absent</span>
</button>
</div>
</div>

<div class="child-card bg-surface-container-lowest p-space-md rounded-xl shadow-sm transition-all duration-150" data-id="3">
<div class="flex items-start justify-between gap-space-sm mb-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-11 h-11 rounded-full bg-tertiary-fixed text-tertiary-container flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0">
            AC
          </div>
<div class="min-w-0">
<h3 class="font-body-lg text-body-lg text-on-surface font-bold truncate">ASSOGBA Christian</h3>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="px-2 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-full">5ème</span>
<span class="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm rounded-full flex items-center gap-1">
<span class="material-symbols-outlined text-[12px]">flight_takeoff</span>
                Voyage familial
              </span>
</div>
</div>
</div>
<span class="status-indicator px-2 py-1 bg-on-tertiary-container text-on-tertiary rounded-full font-label-sm text-label-sm flex-shrink-0">Permission</span>
</div>
<div class="grid grid-cols-3 gap-space-xs pt-space-xs">
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="P" type="button">
<span class="material-symbols-outlined text-[20px]">check</span>
<span>Présent</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-on-tertiary-container text-on-tertiary shadow-sm" data-status="Perm" type="button">
<span class="material-symbols-outlined text-[18px]">hourglass_top</span>
<span>Perm</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="A" type="button">
<span class="material-symbols-outlined text-[18px]">close</span>
<span>Absent</span>
</button>
</div>
</div>

<div class="child-card bg-surface-container-lowest p-space-md rounded-xl shadow-sm transition-all duration-150" data-id="4">
<div class="flex items-start justify-between gap-space-sm mb-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-11 h-11 rounded-full bg-error-container text-on-error-container flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0">
            BK
          </div>
<div class="min-w-0">
<h3 class="font-body-lg text-body-lg text-on-surface font-bold truncate">BIO Kévin</h3>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="px-2 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-full">CM1</span>
<span class="font-body-sm text-body-sm text-outline">Non pointé à la répétition</span>
</div>
</div>
</div>
<span class="status-indicator px-2 py-1 bg-error text-on-error rounded-full font-label-sm text-label-sm flex-shrink-0">Absent</span>
</div>
<div class="grid grid-cols-3 gap-space-xs pt-space-xs">
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="P" type="button">
<span class="material-symbols-outlined text-[20px]">check</span>
<span>Présent</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="Perm" type="button">
<span class="material-symbols-outlined text-[18px]">hourglass_empty</span>
<span>Perm</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-error text-on-error shadow-sm" data-status="A" type="button">
<span class="material-symbols-outlined text-[18px]">close</span>
<span>Absent</span>
</button>
</div>
</div>

<div class="child-card bg-surface-container-lowest p-space-md rounded-xl shadow-sm transition-all duration-150" data-id="5">
<div class="flex items-start justify-between gap-space-sm mb-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-11 h-11 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0">
            DG
          </div>
<div class="min-w-0">
<h3 class="font-body-lg text-body-lg text-on-surface font-bold truncate">DOSSOU Grâce</h3>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="px-2 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-full">4ème</span>
<span class="font-body-sm text-body-sm text-secondary flex items-center gap-0.5">
<span class="material-symbols-outlined text-[14px]">auto_stories</span> 2ème Lecture
              </span>
</div>
</div>
</div>
<span class="status-indicator px-2 py-1 bg-secondary text-on-secondary rounded-full font-label-sm text-label-sm flex-shrink-0">Présent</span>
</div>
<div class="grid grid-cols-3 gap-space-xs pt-space-xs">
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-secondary text-on-secondary shadow-sm" data-status="P" type="button">
<span class="material-symbols-outlined text-[20px]">check</span>
<span>Présent</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="Perm" type="button">
<span class="material-symbols-outlined text-[18px]">hourglass_empty</span>
<span>Perm</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="A" type="button">
<span class="material-symbols-outlined text-[18px]">close</span>
<span>Absent</span>
</button>
</div>
</div>

<div class="child-card bg-surface-container-lowest p-space-md rounded-xl shadow-sm transition-all duration-150" data-id="6">
<div class="flex items-start justify-between gap-space-sm mb-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-11 h-11 rounded-full bg-error-container text-on-error-container flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0">
            HS
          </div>
<div class="min-w-0">
<h3 class="font-body-lg text-body-lg text-on-surface font-bold truncate">HOUNGBO Sèdjro</h3>
<div class="flex items-center gap-space-xs mt-0.5">
<span class="px-2 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-full">CM2</span>
<span class="font-body-sm text-body-sm text-outline">Prières Universelles</span>
</div>
</div>
</div>
<span class="status-indicator px-2 py-1 bg-error text-on-error rounded-full font-label-sm text-label-sm flex-shrink-0">Absent</span>
</div>
<div class="grid grid-cols-3 gap-space-xs pt-space-xs">
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="P" type="button">
<span class="material-symbols-outlined text-[20px]">check</span>
<span>Présent</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-surface-container text-on-surface-variant hover:bg-surface-container-high" data-status="Perm" type="button">
<span class="material-symbols-outlined text-[18px]">hourglass_empty</span>
<span>Perm</span>
</button>
<button class="btn-state h-12 rounded-lg flex items-center justify-center gap-1 font-label-lg text-label-lg transition-colors bg-error text-on-error shadow-sm" data-status="A" type="button">
<span class="material-symbols-outlined text-[18px]">close</span>
<span>Absent</span>
</button>
</div>
</div>
</div>

<div class="px-margin pt-space-lg">
<div class="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-md">
<div class="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-[24px]">verified</span>
</div>
<div>
<h4 class="font-label-lg text-label-lg text-on-surface">Fidélité et Dévotion</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
          "Que ta parole soit vérité et ton service empreint d'humilité." Les présences non enregistrées avant 11h sont archivées d'office.
        </p>
</div>
</div>
</div>

<div class="fixed bottom-16 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl px-margin py-space-sm shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
<div class="max-w-lg mx-auto flex items-center gap-space-sm">
<button class="w-full h-[52px] bg-primary-container text-on-primary font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-space-sm shadow-md active:bg-primary transition-all duration-150" id="btn-save-attendance" type="button">
<span class="material-symbols-outlined text-[22px]">save</span>
<span>Enregistrer la présence</span>
</button>
</div>
</div>

<div class="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-inverse-surface/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300" id="confirmation-modal">
<div class="w-full max-w-sm bg-surface-container-lowest rounded-xl p-space-lg shadow-xl flex flex-col items-center text-center transform scale-95 transition-transform duration-300" id="modal-box">
<div class="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-space-md">
<span class="material-symbols-outlined text-[36px]">task_alt</span>
</div>
<span class="px-space-sm py-1 bg-surface-container-high text-primary font-label-sm text-label-sm rounded-full uppercase tracking-wider mb-space-xs">
        Confirmation Paroisse
      </span>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">
        Présence Enregistrée !
      </h3>
<p class="font-body-md text-body-md text-on-surface-variant mt-space-sm leading-relaxed" id="modal-message">
        Présence du 12 Mai enregistrée avec succès pour la Fraternité 2 (12 Présents, 2 Permissions, 3 Absents).
      </p>
<div class="w-full grid grid-cols-3 gap-2 my-space-md p-space-sm bg-surface-container-low rounded-lg">
<div class="text-center">
<span class="block font-headline-sm text-headline-sm text-secondary font-bold" id="modal-stat-p">12</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Présents</span>
</div>
<div class="text-center">
<span class="block font-headline-sm text-headline-sm text-on-tertiary-container font-bold" id="modal-stat-perm">2</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Perm.</span>
</div>
<div class="text-center">
<span class="block font-headline-sm text-headline-sm text-error font-bold" id="modal-stat-a">3</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Absents</span>
</div>
</div>
<button class="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg rounded-xl flex items-center justify-center transition-colors" id="btn-close-modal" type="button">
        Terminer et Continuer
      </button>
</div>
</div>
</div>

`;
