export const html = `


<div class="fixed top-24 left-4 right-4 z-50 transform -translate-y-8 opacity-0 pointer-events-none transition-all duration-300 ease-out bg-inverse-surface text-inverse-on-surface p-space-md rounded-xl shadow-xl flex items-start gap-space-sm" id="saveToast">
<div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-on-secondary">
<span class="material-symbols-outlined text-[18px]">verified</span>
</div>
<div class="flex flex-col min-w-0 flex-1">
<span class="font-label-lg text-label-lg text-inverse-on-surface">Caisse Paroissiale à jour</span>
<span class="font-body-sm text-body-sm text-surface-container-high mt-0.5" id="toastMessage">Cotisation de la Fraternité 2 enregistrée : 1 400 F CFA versés dans la caisse paroissiale.</span>
</div>
<button class="w-8 h-8 rounded-full flex items-center justify-center text-surface-variant hover:bg-surface-variant/20" onclick="closeToast()" type="button">
<span class="material-symbols-outlined text-[18px]">close</span>
</button>
</div>

<div class="flex items-center justify-between gap-space-sm mt-space-xs">
<div class="flex items-center gap-space-xs text-on-surface-variant">
<span class="material-symbols-outlined text-[20px] text-surface-tint">calendar_today</span>
<span class="font-label-lg text-label-lg text-on-surface">Dimanche 12 Mai 2024</span>
</div>
<div class="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-high text-primary rounded-full shadow-sm">
<span class="material-symbols-outlined text-[16px] text-secondary">groups</span>
<span class="font-label-sm text-label-sm font-bold uppercase tracking-wider">Fraternité 2</span>
</div>
</div>

<div class="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded-xl">
<div class="w-7 h-7 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-[18px]">gavel</span>
</div>
<div class="flex-1 min-w-0">
<p class="font-label-sm text-label-sm text-on-surface-variant leading-snug">
<span class="font-bold text-on-surface">Règle paroissiale :</span> Cotisation hebdomadaire obligatoire : 
        <span class="font-bold text-primary">100 F CFA</span> par lecteur.
      </p>
</div>
</div>

<div class="bg-primary text-on-primary rounded-xl p-space-md shadow-md flex flex-col gap-space-sm relative overflow-hidden">

<div class="absolute -right-10 -bottom-10 w-36 h-36 bg-surface-tint/30 rounded-full blur-2xl pointer-events-none"></div>
<div class="absolute -left-6 -top-6 w-24 h-24 bg-primary-container/40 rounded-full blur-xl pointer-events-none"></div>
<div class="flex items-center justify-between z-10">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px] text-primary-fixed">point_of_sale</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed">Caisse du Jour</span>
</div>
<span class="px-2.5 py-0.5 bg-surface-container-lowest/15 text-primary-fixed text-label-sm font-label-sm rounded-full backdrop-blur-sm">
        Session active
      </span>
</div>
<div class="flex items-baseline gap-space-xs z-10 my-0.5">
<span class="font-headline-lg-mobile text-headline-lg-mobile tracking-tight font-extrabold text-on-primary" id="collectedAmountDisplay">1 400</span>
<span class="font-headline-sm text-headline-sm text-primary-fixed">F CFA</span>
</div>

<div class="w-full bg-primary-container/80 h-2.5 rounded-full overflow-hidden p-0.5 z-10 flex">
<div class="bg-secondary-container h-full rounded-full transition-all duration-300" id="paymentProgressBar" style="width: 82.35%;"></div>
</div>

<div class="grid grid-cols-2 gap-space-sm pt-space-xs z-10">
<div class="bg-primary-container/60 rounded-lg p-2.5 flex flex-col">
<span class="font-label-sm text-label-sm text-primary-fixed-dim">Encaissés</span>
<span class="font-label-lg text-label-lg text-on-primary font-bold mt-0.5" id="paidRatioText">14 / 17 enfants</span>
</div>
<div class="bg-primary-container/60 rounded-lg p-2.5 flex flex-col">
<span class="font-label-sm text-label-sm text-primary-fixed-dim">Reste à percevoir</span>
<span class="font-label-lg text-label-lg text-tertiary-fixed font-bold mt-0.5" id="unpaidSummaryText">300 F (3 restants)</span>
</div>
</div>
</div>

<div class="flex items-center justify-between pt-1">
<div class="flex items-center gap-1.5">
<span class="font-headline-sm text-headline-sm text-on-surface">Appel de cotisation</span>
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-bold">17</span>
</div>

<button class="h-10 px-3 bg-surface-container text-primary rounded-lg flex items-center gap-1.5 transition-colors hover:bg-surface-container-high active:scale-95 shadow-sm" id="toggleAllBtn" onclick="toggleSelectAll()" type="button">
<span class="material-symbols-outlined text-[18px]">done_all</span>
<span class="font-label-md text-label-md font-bold">Tout cocher</span>
</button>
</div>

<div class="flex flex-col gap-space-sm" id="readersList">

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="1" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            AA
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">ADANHOUNME Abel</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">1ère Lecture</span>
</div>
</div>
</div>
<button aria-label="Basculer statut ADANHOUNME Abel" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(1)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text" value="Cotisation normale"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="2" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            AG
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">AGOSSOU Gloria</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Psaume</span>
</div>
</div>
</div>
<button aria-label="Basculer statut AGOSSOU Gloria" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(2)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text" value="Avance 200 F pour le mois"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm opacity-95" data-id="3" data-paid="false">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            AK
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">AKPADJI Kevin</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-error-container text-on-error-container">
                En attente (100 F)
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">2ème Lecture</span>
</div>
</div>
</div>
<button aria-label="Basculer statut AKPADJI Kevin" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-surface-container text-on-surface-variant shadow-sm" onclick="togglePayment(3)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box_outline_blank</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text" value="Promesse Dimanche prochain"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="4" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            AL
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">ALLADATIN Luc</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Prière Univ.</span>
</div>
</div>
</div>
<button aria-label="Basculer statut ALLADATIN Luc" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(4)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm opacity-95" data-id="5" data-paid="false">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            BA
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">BATONON Aurelle</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-error-container text-on-error-container">
                En attente (100 F)
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Lecteur 1</span>
</div>
</div>
</div>
<button aria-label="Basculer statut BATONON Aurelle" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-surface-container text-on-surface-variant shadow-sm" onclick="togglePayment(5)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box_outline_blank</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text" value="Oubli de monnaie"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="6" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            BE
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">BEHANZIN David</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Lecteur 2</span>
</div>
</div>
</div>
<button aria-label="Basculer statut BEHANZIN David" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(6)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="7" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            BO
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">BOKO Marie-Josée</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Psaume</span>
</div>
</div>
</div>
<button aria-label="Basculer statut BOKO Marie-Josée" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(7)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="8" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            DA
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">DANDJINOU Paul</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">1ère Lecture</span>
</div>
</div>
</div>
<button aria-label="Basculer statut DANDJINOU Paul" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(8)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm opacity-95" data-id="9" data-paid="false">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            DO
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">DOSSOU Samuel</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-error-container text-on-error-container">
                En attente (100 F)
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">2ème Lecture</span>
</div>
</div>
</div>
<button aria-label="Basculer statut DOSSOU Samuel" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-surface-container text-on-surface-variant shadow-sm" onclick="togglePayment(9)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box_outline_blank</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="10" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            GN
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">GNANSOUNOU Grace</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Prière Univ.</span>
</div>
</div>
</div>
<button aria-label="Basculer statut GNANSOUNOU Grace" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(10)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="11" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            HO
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">HOUNNOU Esther</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Psaume</span>
</div>
</div>
</div>
<button aria-label="Basculer statut HOUNNOU Esther" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(11)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="12" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            KO
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">KOUDJO Marc</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">1ère Lecture</span>
</div>
</div>
</div>
<button aria-label="Basculer statut KOUDJO Marc" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(12)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="13" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            LO
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">LOKOSSOU Isaac</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">2ème Lecture</span>
</div>
</div>
</div>
<button aria-label="Basculer statut LOKOSSOU Isaac" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(13)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="14" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            ME
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">MEDEGAN Noémie</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Psaume</span>
</div>
</div>
</div>
<button aria-label="Basculer statut MEDEGAN Noémie" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(14)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="15" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            SO
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">SOGLO Jean</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">1ère Lecture</span>
</div>
</div>
</div>
<button aria-label="Basculer statut SOGLO Jean" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(15)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="16" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            TO
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">TOSSOU Christine</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">2ème Lecture</span>
</div>
</div>
</div>
<button aria-label="Basculer statut TOSSOU Christine" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(16)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>

<div class="reader-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all flex flex-col gap-space-sm" data-id="17" data-paid="true">
<div class="flex items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center flex-shrink-0 font-label-lg text-label-lg">
            VI
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">VIGAN Daniel</span>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="status-badge px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                Payé 100 F
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Lecteur 1</span>
</div>
</div>
</div>
<button aria-label="Basculer statut VIGAN Daniel" class="toggle-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-secondary text-on-secondary shadow-sm" onclick="togglePayment(17)" type="button">
<span class="material-symbols-outlined text-[26px]">check_box</span>
</button>
</div>
<div class="pt-1">
<div class="relative flex items-center">
<span class="material-symbols-outlined text-[16px] absolute left-3 text-outline">edit_note</span>
<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Observation / Don supplémentaire..." type="text"/>
</div>
</div>
</div>
</div>

<div class="sticky bottom-16 z-30 pt-2 pb-3 bg-surface/90 backdrop-blur-md">
<button class="w-full h-[52px] bg-primary-container text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-lg transition-transform active:scale-[0.98] hover:bg-primary" id="submitPaymentBtn" onclick="saveTreasuryData()" type="button">
<span class="material-symbols-outlined text-[22px]">savings</span>
<span id="submitBtnLabel">Enregistrer les cotisations (1 400 F CFA)</span>
</button>
</div>
</div>

`;
