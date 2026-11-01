export const html = `


<div class="mx-margin-mobile mt-space-sm mb-space-sm bg-secondary text-on-secondary rounded-xl p-space-md shadow-md flex items-center justify-between transition-all duration-300" id="toastSuccess">
<div class="flex items-center gap-space-sm min-w-0">
<div class="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-[20px]">check_circle</span>
</div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg leading-tight truncate">Enregistrement réussi !</span>
<span class="font-body-sm text-body-sm opacity-90 truncate">2 lecteurs enregistrés avec succès.</span>
</div>
</div>
<button class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 text-on-secondary flex-shrink-0" onclick="document.getElementById('toastSuccess').classList.add('hidden')">
<span class="material-symbols-outlined text-[18px]">close</span>
</button>
</div>

<div class="px-margin-mobile pt-space-xs pb-space-sm">
<div class="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs text-primary">
<span class="material-symbols-outlined text-[20px]">church</span>
<span class="font-label-md text-label-md tracking-wide uppercase">Affectation Fraternité</span>
</div>
<span class="px-space-sm py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm">Session 2024-2025</span>
</div>
<div class="flex flex-col gap-1.5">
<label class="font-label-md text-label-md text-on-surface" for="fratSelector">Choisir la fraternité active</label>
<div class="relative w-full">
<select class="w-full h-12 pl-space-md pr-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-lg text-body-lg shadow-sm appearance-none outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" id="fratSelector">
<option value="1">Fraternité 1 (Sainte Thérèse)</option>
<option selected="" value="2">Fraternité 2 (Saint Jean-Paul II)</option>
<option value="3">Fraternité 3 (Bienheureuse Anuarite)</option>
<option value="4">Fraternité 4 (Saint Tarcisius)</option>
<option value="5">Fraternité 5 (Sainte Maria Goretti)</option>
</select>
<div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-on-surface-variant">
<span class="material-symbols-outlined">expand_more</span>
</div>
</div>
</div>
</div>
</div>

<div class="px-margin-mobile py-space-xs">
<label class="group relative flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm cursor-pointer transition-all active:scale-[0.99]">
<input checked="" class="peer sr-only" id="parentalConsent" type="checkbox"/>
<div class="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 peer-checked:bg-primary transition-colors mt-0.5">
<span class="material-symbols-outlined text-[18px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface group-hover:text-primary transition-colors">Accord parental validé</span>
<span class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">J'ai l'accord formel des parents ou tuteurs pour enregistrer et gérer ces informations paroissiales.</span>
</div>
</label>
</div>

<div class="px-margin-mobile py-space-xs">
<div class="rounded-xl bg-error-container p-space-md text-on-error-container shadow-sm flex items-start gap-space-sm">
<div class="w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center flex-shrink-0 mt-0.5">
<span class="material-symbols-outlined text-[18px]">warning</span>
</div>
<div class="flex flex-col flex-1 min-w-0">
<div class="flex items-center justify-between">
<span class="font-label-lg text-label-lg font-bold">Alerte doublon potentiel</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-error">Info</span>
</div>
<p class="font-body-sm text-body-sm mt-1 leading-snug">
          L'enfant <span class="font-bold underline">MENSAH David</span> né le <span class="font-semibold">14/05/2012</span> est déjà inscrit dans la <span class="font-semibold">Fraternité 1</span>. Vérifiez avec la famille s'il s'agit d'un homonyme avant de poursuivre.
        </p>
</div>
</div>
</div>

<div class="px-margin-mobile py-space-xs">
<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
<div class="flex items-center justify-between pb-space-xs">
<div class="flex items-center gap-space-xs">
<span class="w-2.5 h-6 rounded-full bg-primary inline-block"></span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Fiche du nouvel enfant</h2>
</div>
<span class="font-label-sm text-label-sm px-space-sm py-1 rounded bg-surface-container text-on-surface-variant">Saisie #3</span>
</div>

<div class="flex flex-col gap-1.5">
<label class="font-label-md text-label-md text-on-surface flex items-center justify-between" for="childLastName">
<span>Nom de famille</span>
<span class="font-label-sm text-label-sm text-primary uppercase font-bold">Majuscules</span>
</label>
<div class="relative w-full">
<input class="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-lg text-body-lg outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all uppercase placeholder:normal-case placeholder:text-outline" id="childLastName" placeholder="Ex: KOUASSI" type="text" value="KOUASSI"/>
<div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-on-surface-variant">
<span class="material-symbols-outlined text-[20px]">badge</span>
</div>
</div>
</div>

<div class="flex flex-col gap-1.5">
<label class="font-label-md text-label-md text-on-surface" for="childFirstNames">Prénoms usuels &amp; baptismaux</label>
<div class="relative w-full">
<input class="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-lg text-body-lg outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all placeholder:text-outline" id="childFirstNames" placeholder="Ex: Jean-Eudes Fifamin" type="text" value="Jean-Eudes Fifamin"/>
<div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-on-surface-variant">
<span class="material-symbols-outlined text-[20px]">face</span>
</div>
</div>
</div>

<div class="flex flex-col gap-1.5">
<label class="font-label-md text-label-md text-on-surface" for="childBirthDate">Date de naissance</label>
<div class="relative w-full">
<input class="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-lg text-body-lg outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="childBirthDate" type="date" value="2008-03-24"/>
<div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-on-surface-variant">
<span class="material-symbols-outlined text-[20px]">calendar_month</span>
</div>
</div>
</div>

<div class="flex flex-col gap-1.5">
<label class="font-label-md text-label-md text-on-surface" for="schoolLevel">Classe à l'école</label>
<div class="relative w-full">
<select class="w-full h-12 pl-space-md pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-lg text-body-lg appearance-none outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="schoolLevel" onchange="toggleHighSchoolSerie(this.value)">
<option value="Avant le CM1">Avant le CM1</option>
<option value="CM1">CM1</option>
<option value="CM2">CM2</option>
<option value="6ème">6ème</option>
<option value="5ème">5ème</option>
<option value="4ème">4ème</option>
<option value="3ème">3ème</option>
<option value="Seconde">Seconde</option>
<option selected="" value="Première">Première</option>
<option value="Terminale">Terminale</option>
<option value="Études supérieures">Études supérieures</option>
<option value="Scolarité terminée">Scolarité terminée</option>
</select>
<div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-on-surface-variant">
<span class="material-symbols-outlined">school</span>
</div>
</div>
</div>

<div class="flex flex-col gap-2 p-space-sm rounded-xl bg-surface-container-low" id="serieContainer">
<div class="flex items-center justify-between">
<span class="font-label-md text-label-md text-on-surface">Série au lycée (obligatoire en 1ère/Tle)</span>
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">Lycée</span>
</div>
<div class="flex flex-wrap gap-1.5">

<label class="cursor-pointer">
<input class="peer sr-only" name="serie_choice" type="radio" value="A1"/>
<span class="inline-flex items-center justify-center min-w-[44px] h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all">A1</span>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="serie_choice" type="radio" value="A2"/>
<span class="inline-flex items-center justify-center min-w-[44px] h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all">A2</span>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="serie_choice" type="radio" value="B"/>
<span class="inline-flex items-center justify-center min-w-[44px] h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all">B</span>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="serie_choice" type="radio" value="C"/>
<span class="inline-flex items-center justify-center min-w-[44px] h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all">C</span>
</label>
<label class="cursor-pointer">
<input checked="" class="peer sr-only" name="serie_choice" type="radio" value="D"/>
<span class="inline-flex items-center justify-center min-w-[44px] h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all shadow-sm">D</span>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="serie_choice" type="radio" value="E"/>
<span class="inline-flex items-center justify-center min-w-[44px] h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all">E</span>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="serie_choice" type="radio" value="F1"/>
<span class="inline-flex items-center justify-center min-w-[44px] h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all">F1</span>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="serie_choice" type="radio" value="F2-F4"/>
<span class="inline-flex items-center justify-center min-w-[44px] h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all">F2-F4</span>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="serie_choice" type="radio" value="G1-G3"/>
<span class="inline-flex items-center justify-center min-w-[44px] h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all">G1-G3</span>
</label>
<label class="cursor-pointer flex-1">
<input class="peer sr-only" name="serie_choice" type="radio" value="Autre"/>
<span class="inline-flex items-center justify-center w-full h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md peer-checked:bg-primary peer-checked:text-on-primary transition-all">Autre / Pro</span>
</label>
</div>
</div>

<div class="flex flex-col gap-1.5">
<label class="font-label-md text-label-md text-on-surface">Niveau de catéchisme paroissial</label>
<div class="grid grid-cols-3 gap-1.5">
<label class="cursor-pointer">
<input class="peer sr-only" name="cate_level" type="radio" value="1ère année"/>
<div class="h-11 rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center peer-checked:bg-primary peer-checked:text-on-primary transition-all">
<span class="font-label-md text-label-md leading-none">1ère</span>
<span class="font-label-sm text-label-sm opacity-80 mt-0.5">Année</span>
</div>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="cate_level" type="radio" value="2ème année"/>
<div class="h-11 rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center peer-checked:bg-primary peer-checked:text-on-primary transition-all">
<span class="font-label-md text-label-md leading-none">2ème</span>
<span class="font-label-sm text-label-sm opacity-80 mt-0.5">Année</span>
</div>
</label>
<label class="cursor-pointer">
<input checked="" class="peer sr-only" name="cate_level" type="radio" value="3ème année"/>
<div class="h-11 rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center peer-checked:bg-primary peer-checked:text-on-primary shadow-sm transition-all">
<span class="font-label-md text-label-md leading-none">3ème</span>
<span class="font-label-sm text-label-sm opacity-80 mt-0.5">Année</span>
</div>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="cate_level" type="radio" value="4ème année"/>
<div class="h-11 rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center peer-checked:bg-primary peer-checked:text-on-primary transition-all">
<span class="font-label-md text-label-md leading-none">4ème</span>
<span class="font-label-sm text-label-sm opacity-80 mt-0.5">Année</span>
</div>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="cate_level" type="radio" value="5ème année"/>
<div class="h-11 rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center peer-checked:bg-primary peer-checked:text-on-primary transition-all">
<span class="font-label-md text-label-md leading-none">5ème</span>
<span class="font-label-sm text-label-sm opacity-80 mt-0.5">Année</span>
</div>
</label>
<label class="cursor-pointer">
<input class="peer sr-only" name="cate_level" type="radio" value="Terminé"/>
<div class="h-11 rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center peer-checked:bg-primary peer-checked:text-on-primary transition-all">
<span class="font-label-md text-label-md leading-none">Confirmé</span>
<span class="font-label-sm text-label-sm opacity-80 mt-0.5">Terminé</span>
</div>
</label>
</div>
</div>

<div class="flex flex-col gap-1.5">
<label class="font-label-md text-label-md text-on-surface" for="parentPhone">Téléphone du tuteur légal (Bénin)</label>
<div class="flex gap-2">
<div class="relative flex-1">
<div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-primary">
<span class="material-symbols-outlined text-[20px]">call</span>
</div>
<input class="w-full h-12 pl-10 pr-space-md rounded-lg bg-surface-container-low text-on-surface font-body-lg text-body-lg outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="parentPhone" placeholder="+229 97 00 00 00" type="tel" value="+229 97 12 34 56"/>
</div>
<a class="w-12 h-12 rounded-lg bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0 active:scale-95 shadow-sm transition-transform" href="tel:+22997123456" title="Appeler le parent">
<span class="material-symbols-outlined text-[22px]">phone_in_talk</span>
</a>
</div>
</div>

<button class="w-full h-12 mt-space-xs rounded-xl bg-surface-container-high text-primary hover:bg-surface-container-highest active:scale-[0.98] font-label-lg text-label-lg flex items-center justify-center gap-space-xs transition-all" type="button">
<span class="material-symbols-outlined text-[22px]">group_add</span>
<span>+ Ajouter un autre enfant (3/20 ajoutés)</span>
</button>
</div>
</div>

<div class="px-margin-mobile py-space-sm">
<div class="relative rounded-2xl overflow-hidden shadow-sm bg-primary text-on-primary p-space-md flex items-center justify-between">
<div class="flex flex-col z-10 max-w-[70%]">
<span class="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed-dim">Ministère de la Parole</span>
<span class="font-headline-sm text-headline-sm mt-0.5">Fraternité 2</span>
<p class="font-body-sm text-body-sm text-surface-container-high mt-1">2 enfants prêts à être validés pour le groupe de préparation liturgique.</p>
</div>
<div class="w-16 h-16 rounded-full bg-primary-container/80 flex items-center justify-center flex-shrink-0 z-10">
<span class="material-symbols-outlined text-primary-fixed text-[36px]">auto_stories</span>
</div>
<div class="absolute -right-4 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>
</div>
</div>

<div class="px-margin-mobile flex flex-col gap-space-xs">
<div class="flex items-center justify-between px-space-xs">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-primary text-[20px]">checklist</span>
<h3 class="font-label-lg text-label-lg text-on-surface">Enfants dans ce lot (2)</h3>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Brouillon actif</span>
</div>

<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm transition-transform active:scale-[0.99]">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-headline-sm flex-shrink-0 shadow-sm">
          KJ
        </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">KOUASSI Jean-Eudes</span>
<div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
<span class="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface">1ère D</span>
<span class="text-outline-variant font-bold">•</span>
<span class="font-body-sm text-body-sm text-on-surface-variant truncate">3ème année caté</span>
</div>
<span class="font-body-sm text-body-sm text-primary flex items-center gap-1 mt-0.5">
<span class="material-symbols-outlined text-[14px]">phone</span> +229 97 12 34 56
          </span>
</div>
</div>
<div class="flex items-center gap-1 flex-shrink-0">
<button aria-label="Modifier" class="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button aria-label="Supprimer" class="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:bg-error hover:text-on-error transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</div>

<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm transition-transform active:scale-[0.99]">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-headline-sm flex-shrink-0 shadow-sm">
          AV
        </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg text-on-surface truncate">ADANHO Viviane</span>
<div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
<span class="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface">4ème</span>
<span class="text-outline-variant font-bold">•</span>
<span class="font-body-sm text-body-sm text-on-surface-variant truncate">2ème année caté</span>
</div>
<span class="font-body-sm text-body-sm text-primary flex items-center gap-1 mt-0.5">
<span class="material-symbols-outlined text-[14px]">phone</span> +229 96 45 88 12
          </span>
</div>
</div>
<div class="flex items-center gap-1 flex-shrink-0">
<button aria-label="Modifier" class="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button aria-label="Supprimer" class="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:bg-error hover:text-on-error transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</div>
</div>

<div class="fixed bottom-16 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md px-margin-mobile py-2.5 shadow-lg">
<div class="max-w-lg mx-auto flex items-center gap-space-sm">
<button class="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-md active:bg-primary transition-all" id="saveRegistrationsBtn" onclick="triggerSaveAnimation()" type="button">
<span class="material-symbols-outlined text-[24px]">save</span>
<span>Enregistrer les inscriptions (2 enfants)</span>
</button>
</div>
</div>
</div>

`;
