# Lot 26 — `26-verbe-clear`

**En clair : aujourd'hui un joueur ne peut pas changer d'avis.** Le moteur sait
poser une décision et la remplacer, jamais l'**enlever**. Et un MJ qui a forcé
une valeur par erreur ne peut plus la lever — l'override survit à tout, par
conception. Tu ajoutes le sixième verbe qui manque.

**Worktree** : `~/tools/fhpc-worktrees/26-verbe-clear`
**Branche** : `26-verbe-clear`, coupée de `main` = `6afa930`
⛔ **Jamais `main`, jamais de `git push`.** **Départ : `npm test` → 530/530.**

---

## 1. La mesure qui motive le lot — refaite avant d'être écrite ici

`src/build/block.mjs:127`, `place()` est le **seul** chemin d'écriture de
`build.choices` et `build.overrides` :

```js
const index = list.findIndex((item) => item && item.path === entry.path);
if (index < 0) list.push(entry);
else list[index] = entry;
```

Elle **pose ou remplace**. Les cinq verbes sont `choose · set · override ·
rebuild · validate`, et `grep "clear\|remove\|unset\|delete" src/build/` ne
rend **rien**. C'était défendable sans interface — personne n'avait besoin de
revenir en arrière. Ça ne l'est plus.

## 2. ⛔ La forme est TRANCHÉE par l'architecte — ne la rouvre pas

**Un sixième verbe nommé : `clear`.** Les deux autres formes envisagées sont
**écartées**, et voici pourquoi, pour que tu ne les reproposes pas :

| Forme écartée | Ce qu'elle casse |
|---|---|
| `set({value: null})` | `set` refuse déjà explicitement `undefined` — *« un choix vide est un rejet »*. Y glisser un sens caché rouvre un refus écrit **et testé** |
| `choose({ref: null})` | même faute, sur `override` qui refuse `value === undefined` — *« un override sans valeur ne dit rien »* |

Un verbe nommé se teste, se publie au catalogue MCP, et se lit dans un journal.
Un `null` qui veut dire deux choses, non.

## 3. Ce que tu construis

`clear({path, kind})` — **il retire une entrée de `build.choices` OU de
`build.overrides`**, jamais des deux à l'aveugle : c'est le geste qui doit
nommer sa cible.

Les questions que tu dois trancher **et écrire dans ton inventaire** :

- **Retirer un chemin absent** : silence, ou refus nommé ? *(Réfléchis à qui
  appelle : une interface qui nettoie plusieurs chemins d'un coup, ou un joueur
  qui clique. Loi §0.5 : pas de repli silencieux — mais « rien à retirer »
  n'est peut-être pas une erreur.)*
- **Le nom exact du second paramètre** — suis la convention des cinq voisins.
- ⚠️ **La reconstruction suit-elle ?** `rebuild` est un verbe séparé
  aujourd'hui ; `clear` ne doit pas le faire tout seul si `choose` ne le fait
  pas. **Reste symétrique de tes voisins**, quoi qu'ils fassent.

⛔ **Tu ne touches à rien d'autre** — pas aux `violations`, pas à `derive.mjs`.
Deux autres lots visent `block.mjs` derrière toi ; plus ton diff est petit,
moins ils rebasent.

## 4. Les tests — accept ET rejet pour chaque clause

1. **Un choix posé puis retiré disparaît de `build.choices`**, et une
   reconstruction rend un document où son effet n'est plus.
2. **Un override posé puis levé disparaît**, et la valeur **revient à celle des
   règles** — c'est le cœur du besoin : la parole du MJ est réversible.
3. **`clear` ne touche pas l'autre collection** : un override et un choix au
   même `path` cohabitent ; en retirer un laisse l'autre intact.
4. **Le chemin est vérifié À L'ENTRÉE**, comme dans `place()` — un chemin mal
   formé est refusé là où le geste a lieu, pas à la reconstruction.
5. **Le verbe est publié au catalogue MCP** s'il doit l'être — vérifie ce que
   font les cinq autres et **fais pareil**. ⚠️ Une IA lit un catalogue comme un
   contrat : un verbe publié doit fonctionner, un verbe qui fonctionne et n'est
   pas publié est une porte cachée. Dis dans ton inventaire ce que tu as choisi.
6. ⚔️ **ATTAQUE** : casse ton propre garde de chemin et prouve qu'un test
   rougit. Restaure et prouve-le par `git status`.

## 5. Ce que tu livres

- Le verbe, ses tests, la mise à jour de `contracts/build.md` (la liste des
  verbes y est — **elle deviendrait fausse sans toi**).
- `INVENTAIRE-LOT-26.md` : tes arbitrages, tes attaques et ce qui a rougi.
- Commits **en local**, message par **heredoc ou fichier**, jamais `-m "…"`.
