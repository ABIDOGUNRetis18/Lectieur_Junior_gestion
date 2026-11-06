# Authentification e-mail (SPF / DKIM / DMARC)

Nos OTP sont envoyés via `smtp.gmail.com` (app password). Gmail signe automatiquement les envois
depuis `lecteursjuniors@gmail.com` (SPF + DKIM de Google). Il n'y a donc **rien à configurer** tant que
l'`SMTP_FROM` reste hébergé chez Gmail.

## Quand migrer vers un domaine propre (ex. `noreply@paroisse.org`)

Si l'`SMTP_FROM` devient un domaine que tu possèdes, ajoute chez ton registrar/DNS :

### SPF (TXT sur le domaine)
```
v=spf1 include:_spf.google.com ~all
```
Vérification : `dig TXT paroisse.org +short | grep spf`

### DKIM
Dans Google Workspace Admin → Applications → Apps Google → Gmail → Authentifier l'e-mail,
génère la clé DKIM 2048 bits, puis ajoute le TXT fourni par Google :
```
<selector>._domainkey  "v=DKIM1; k=rsa; p=..."
```

### DMARC (TXT sur `_dmarc`)
```
v=DMARC1; p=none; rua=mailto:dmarc@paroisse.org
```
Passer à `p=quarantine` puis `p=reject` après 2 semaines de monitoring (aucun spam légitime rejeté).

## Test
Envoyer un OTP, puis vérifier les headers du mail reçu :
- `Authentication-Results:` doit contenir `spf=pass` et `dkim=pass`
- Outils : https://www.mail-tester.com ou https://dkimtest.com

## Actuel (Gmail)
Commande de contrôle (doit répondre) :
```bash
dig TXT _dmarc.gmail.com +short
dig TXT gmail.com +short | grep spf
```
