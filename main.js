const arrayContainer = document.getElementById('array-container');
const btnGenerate = document.getElementById('btn-generate');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const selectAlgo = document.getElementById('select-algo');
const speedInput = document.getElementById('speed');
const algoDescription = document.getElementById('algo-description');
const liveExplanation = document.getElementById('live-explanation');

let array = [];
const ARRAY_SIZE = 30;
let isSorting = false;
let stopRequested = false;

// Descriptions pédagogiques et cas d'usage ML
const ALGO_TEXTS = {
  bubble: `• C'est quoi ? Un algorithme qui compare deux éléments voisins et les inverse s'ils sont dans le mauvais ordre. Les plus grandes valeurs "remontent" petit à petit vers la droite, comme des bulles d'air dans l'eau.
• Le but : Obtenir une liste ordonnée du plus petit au plus grand.
• Utilité en Machine Learning : Le tri est indispensable pour ordonner des résultats prédictifs. On l'utilise par exemple dans l'algorithme des "k plus proches voisins" (k-NN) pour trier les distances entre données, ou pour classer les scores de confiance d'un modèle pour ne garder que les N meilleures prédictions.`,
  selection: `• C'est quoi ? Un algorithme qui parcourt toute la liste pour dénicher la plus petite valeur, puis la place tout au début. Il recommence ensuite avec le reste des éléments.
• Le but : Trier une liste en effectuant le moins d'échanges de données possible en mémoire.
• Utilité en Machine Learning : Ce principe de sélection du "meilleur élément" sert dans la sélection de variables (Feature Selection). On cherche à identifier la variable qui apporte le plus d'informations au modèle, puis la deuxième, et ainsi de suite pour simplifier les données d'entraînement.`
};

// Mettre à jour la description de l'algorithme sélectionné
function updateAlgoDescription() {
  algoDescription.textContent = ALGO_TEXTS[selectAlgo.value];
}

// Pause synchrone basée sur le curseur de vitesse
const sleep = () => {
  const delay = 510 - parseInt(speedInput.value, 10);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Générer un nouveau tableau aléatoire
function generateArray() {
  if (isSorting) return;
  array = [];
  arrayContainer.innerHTML = '';
  
  for (let i = 0; i < ARRAY_SIZE; i++) {
    const value = Math.floor(Math.random() * 85) + 10;
    array.push(value);
    
    const bar = document.createElement('div');
    bar.classList.add('bar');
    bar.style.height = `${value}%`;
    arrayContainer.appendChild(bar);
  }
  liveExplanation.textContent = "Nouveau tableau généré. Prêt à démarrer.";
}

// Réinitialiser les couleurs des barres
function resetBarColors() {
  const bars = document.querySelectorAll('.bar');
  bars.forEach(bar => bar.className = 'bar');
}

// Gestion des états de l'interface utilisateur
function setUIState(sorting) {
  isSorting = sorting;
  btnGenerate.disabled = sorting;
  btnStart.disabled = sorting;
  selectAlgo.disabled = sorting;
  btnStop.disabled = !sorting;
}

// Demande d'arrêt du tri
function stopSorting() {
  if (isSorting) {
    stopRequested = true;
    liveExplanation.textContent = "Interruption en cours...";
  }
}

// 1. Tri à bulles (Bubble Sort)
async function bubbleSort() {
  const bars = document.querySelectorAll('.bar');
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (stopRequested) return false;

      bars[j].classList.add('comparing');
      bars[j + 1].classList.add('comparing');
      liveExplanation.textContent = `Comparaison : valeur ${array[j]} et valeur ${array[j + 1]}.`;
      await sleep();

      if (array[j] > array[j + 1]) {
        if (stopRequested) return false;

        bars[j].classList.remove('comparing');
        bars[j + 1].classList.remove('comparing');
        bars[j].classList.add('swapping');
        bars[j + 1].classList.add('swapping');
        
        liveExplanation.textContent = `Échange : ${array[j]} est supérieur à ${array[j + 1]}.`;

        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        bars[j].style.height = `${array[j]}%`;
        bars[j + 1].style.height = `${array[j + 1]}%`;
        await sleep();

        bars[j].classList.remove('swapping');
        bars[j + 1].classList.remove('swapping');
      } else {
        bars[j].classList.remove('comparing');
        bars[j + 1].classList.remove('comparing');
      }
    }
    bars[n - i - 1].classList.add('sorted');
    liveExplanation.textContent = `Élément ${array[n - i - 1]} placé à sa position finale.`;
  }
  bars[0].classList.add('sorted');
  return true;
}

// 2. Tri par sélection (Selection Sort)
async function selectionSort() {
  const bars = document.querySelectorAll('.bar');
  const n = array.length;

  for (let i = 0; i < n; i++) {
    let minIndex = i;
    bars[minIndex].classList.add('comparing');
    liveExplanation.textContent = `Recherche du plus petit élément à partir de l'index ${i}.`;

    for (let j = i + 1; j < n; j++) {
      if (stopRequested) return false;

      bars[j].classList.add('comparing');
      await sleep();

      if (array[j] < array[minIndex]) {
        bars[minIndex].classList.remove('comparing');
        minIndex = j;
        bars[minIndex].classList.add('comparing');
        liveExplanation.textContent = `Nouveau minimum trouvé : ${array[minIndex]}.`;
      } else {
        bars[j].classList.remove('comparing');
      }
    }

    if (minIndex !== i) {
      if (stopRequested) return false;

      bars[i].classList.add('swapping');
      bars[minIndex].classList.add('swapping');
      liveExplanation.textContent = `Échange du minimum (${array[minIndex]}) avec la position ${i}.`;

      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      bars[i].style.height = `${array[i]}%`;
      bars[minIndex].style.height = `${array[minIndex]}%`;
      await sleep();

      bars[i].classList.remove('swapping');
      bars[minIndex].classList.remove('swapping');
    }

    bars[minIndex].classList.remove('comparing');
    bars[i].classList.add('sorted');
  }
  return true;
}

// Lancement global
async function startSorting() {
  setUIState(true);
  stopRequested = false;
  resetBarColors();

  const selectedAlgo = selectAlgo.value;
  let completed = false;

  if (selectedAlgo === 'bubble') {
    completed = await bubbleSort();
  } else if (selectedAlgo === 'selection') {
    completed = await selectionSort();
  }

  if (completed) {
    liveExplanation.textContent = "Tri terminé avec succès !";
  } else {
    resetBarColors();
    liveExplanation.textContent = "Tri interrompu par l'utilisateur.";
  }

  setUIState(false);
}

// Écouteurs d'événements
btnGenerate.addEventListener('click', generateArray);
btnStart.addEventListener('click', startSorting);
btnStop.addEventListener('click', stopSorting);
selectAlgo.addEventListener('change', updateAlgoDescription);

// Initialisation au chargement
updateAlgoDescription();
generateArray();