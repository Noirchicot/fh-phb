# Passage aux modules ES — évaluation (LOT 1)

**Date** : 2026-08-07
**Branche** : `es-modules`, partant de `split-pure-modules` (5d0012b)
**Verdict** : **ARRÊT. Aucune transformation commitée.**

Cette note existe pour qu'on n'ait pas à refaire l'enquête. Le LOT 1
proposait de convertir `fh-utils.js`, `fh-dice-visual.js` et
`fh-player-sheet.js` en modules ES (`import`/`export`) au lieu du patron
actuel « IIFE qui s'enregistre sur `window.FH.*` + ordre de chargement
imposé à la main dans trois listes ».

Deux verrous devaient être levés avant d'écrire la moindre ligne. Le
premier tombe proprement. Le second ne tombe pas.

---

## Verrou A — mkdocs peut-il émettre `<script type="module">` ?

**LEVÉ.** Et sans passer par `overrides/main.html`.

`extra_javascript` n'est plus une simple liste de chaînes depuis MkDocs
1.5 : chaque entrée peut être un dict (`path` / `type` / `defer` /
`async`), matérialisé par la classe `ExtraScriptValue`, et rendu par le
filtre Jinja `script_tag`.

Preuves, sur les versions réellement installables depuis
`requirements.txt` (`mkdocs-material>=9.7` → **mkdocs-material 9.7.7**,
**mkdocs 1.6.1**) :

| Fait | Emplacement |
|------|-------------|
| Le thème rend chaque script via le filtre, pas en dur | `material/templates/base.html` l. 254-255 : `{% for script in config.extra_javascript %}` / `{{ script | script_tag }}` |
| Le filtre existe dans le cœur MkDocs | `mkdocs/utils/templates.py` l. 44 : `def script_tag_filter(context, extra_script: ExtraScriptValue)` |
| La forme dict accepte `type` | `mkdocs/config/config_options.py` l. 918-928 : `class ExtraScriptValue` avec `path`, `type`, `defer`, `async_` |

Vérifié aussi **empiriquement** (build réel d'un site minimal avec les
deux formes côte à côte) :

```yaml
extra_javascript:
  - javascripts/a.js
  - path: javascripts/b.js
    type: module
```

produit dans `site/index.html` :

```html
<script src="javascripts/a.js">
<script src="javascripts/b.js" type="module">
```

Donc : `overrides/main.html` n'aurait rien eu à absorber. Ce fichier peut
rester ce qu'il est (les seules cartes sociales, bloc `extrahead`).

---

## Verrou B — le harnais de tests survit-il ?

**NON LEVÉ. C'est le blocage.**

### Ce que fait le harnais aujourd'hui

Dix fichiers de tests montent le dock de la même façon :

1. ils lisent `docs/javascripts/fh-player-sheet.js` en texte ;
2. ils **injectent** un export des internes en remplaçant la queue de
   l'IIFE par une regex `/\}\)\(\);\s*$/`, ce qui pose
   `globalThis.__fh*= {state, SKILLS, renderSkills, …}` *à l'intérieur*
   de la portée lexicale du fichier — c'est le seul moyen d'atteindre
   `state` et une quarantaine de fonctions privées sans élargir la
   surface publique du fichier de production ;
3. ils exécutent le tout, plus `fh-utils.js` et `fh-dice-visual.js`,
   avec `vm.runInNewContext(source, sandbox)` dans un bac à sable où
   `window`, `localStorage`, `fetch`, `document` sont des doublures.

Les dix fichiers concernés, avec la ligne de la regex d'instrumentation
et celle du dernier `runInNewContext` :

| Fichier | regex `})();` | `runInNewContext` |
|---------|---------------|-------------------|
| `tests/campaign-feed.test.js` | 14 | 54 |
| `tests/dice-pool-resources.test.js` | 25 | 62 |
| `tests/dice-tray.test.js` | 31 | 58 |
| `tests/player-sheet.integration.test.js` | 23 | 48 |
| `tests/player-sheet.test.js` | 11 | 46 |
| `tests/profile-conflict.test.js` | 25 | 62 |
| `tests/roll-engine-adversarial.test.js` | 24 | 47 |
| `tests/roll-vocabulary.test.js` | 25 | 50 |
| `tests/roller-state-machine.test.js` | 9 | 47 |
| `tests/tray-expanded.test.js` | 35 | 60 |

Ces dix fichiers chargent **les trois** fichiers à convertir. Aucun n'est
épargné : la conversion casserait 10 suites sur 19 d'un coup.

### Pourquoi ça ne passe pas

Mesuré sur le Node de ce dépôt (**v22.22.2**) :

```
runInNewContext + `export`  -> SyntaxError: Unexpected token 'export'
runInNewContext + `import`  -> SyntaxError: Cannot use import statement outside a module
vm.SourceTextModule         -> undefined  (sans drapeau)
vm.SourceTextModule         -> function   (avec --experimental-vm-modules)
```

`vm.runInNewContext` compile en **script classique**. Un module ES n'est
pas un script : ce n'est pas une limite de configuration qu'on contourne,
c'est le mauvais mode de compilation. Il n'existe pas d'option à passer.

### Ce que la migration imposerait, concrètement

Pour chacun des 10 fichiers :

1. **Remplacer le moteur de chargement** : `vm.createContext(sandbox)`,
   puis `new vm.SourceTextModule(source, {context})`, puis un *linker*
   maison qui résout à la main `./fh-utils.js` et `./fh-dice-visual.js`
   vers `docs/javascripts/`, puis `await module.link(linker)` et
   `await module.evaluate()`.
2. **Rendre le montage asynchrone** : `link()`/`evaluate()` sont des
   promesses. Le montage est aujourd'hui synchrone au niveau du fichier,
   et les assertions qui suivent le sont aussi. Tout le corps de chaque
   test passerait sous `await`, soit une réécriture de la structure des
   10 fichiers, pas seulement de leur en-tête.
3. **Réécrire l'instrumentation** : la regex `/\}\)\(\);\s*$/` n'a plus
   d'ancre — un module ES n'a pas de queue d'IIFE. Il faudrait un autre
   point d'injection dans les 10 fichiers, ou exporter ~40 internes
   (dont `state`) depuis le fichier de production, ce qui reviendrait à
   publier son intérieur pour le confort des tests.
4. **Ajouter `--experimental-vm-modules` à `npm test`.** Drapeau
   *expérimental* : avertissement à chaque exécution, API sans garantie
   de stabilité entre versions de Node. On adosserait la totalité de la
   suite de tests à une API non stabilisée.

C'est très exactement le cas d'arrêt prévu par la mission : « si l'un des
deux verrous impose de réécrire le harnais de tests en profondeur,
ARRÊTE-TOI ». On ne casse pas 10 suites de tests et on n'adosse pas la
CI à un drapeau expérimental pour du confort de découpage.

### Note secondaire, pour mémoire

Même côté navigateur, la bascule n'est pas neutre :
`tools/dock-harness.html` (l. 88-97) injecte les scripts par
`document.write('<script src=…>')`. Un `<script type="module">` est
*différé* par nature : il s'exécuterait après tous les scripts
classiques, ce qui change l'ordre relatif entre le dock et les six
fichiers de panneaux (`fh-panel-*.js`) qui s'enregistrent sur
`window.FH.panels`. Ça se règle, mais ça se règle — ce n'est pas gratuit
non plus.

---

## Ce qui a été fait

- Baseline établie **avant** toute investigation : `npm test` → **19/19**.
- Verrou A vérifié par lecture du code de mkdocs/mkdocs-material **et**
  par un build réel.
- Verrou B vérifié par exécution sur le Node du dépôt.
- **Aucun fichier JS, aucune des trois listes de chargement n'a été
  touché.** `docs/javascripts/`, `mkdocs.yml` et `tools/dock-harness.html`
  sont identiques à `split-pure-modules`.

## Ce qui n'a pas été fait, et pourquoi

- **La conversion `import`/`export` elle-même** : verrou B non levé.
- **La réécriture du harnais en `vm.SourceTextModule`** : c'est une
  décision d'Eric, pas de l'agent. Le coût (10 fichiers restructurés en
  asynchrone + drapeau expérimental permanent) dépasse largement le
  bénéfice visé (ne plus maintenir trois listes d'ordre de chargement).
- **Aucune Pull Request** n'a été ouverte, conformément à la consigne.

## Si on veut quand même y aller un jour

Trois chemins, du moins au plus coûteux — aucun n'est recommandé en
l'état :

1. **Ne rien convertir.** Le patron actuel marche, l'ordre est documenté
   en commentaire aux trois endroits, et la seule vraie douleur est
   d'avoir à toucher trois listes quand on ajoute un fichier. C'est
   supportable.
2. **Bundler pour les tests.** Un `esbuild --bundle --format=cjs` en
   préalable de `npm test` rendrait un script classique à
   `runInNewContext` — mais ajoute une étape de build et une dépendance
   à un dépôt qui n'en a qu'une (`linkedom`), et l'instrumentation par
   regex reste à repenser.
3. **`vm.SourceTextModule`** — décrit ci-dessus. Le plus fidèle, le plus
   cher, et adossé à un drapeau expérimental.
