// Navigation par onglets
const tabBtnVisualizer = document.getElementById('tab-btn-visualizer');
const tabBtnCourse = document.getElementById('tab-btn-course');
const tabVisualizer = document.getElementById('tab-visualizer');
const tabCourse = document.getElementById('tab-course');

tabBtnVisualizer.addEventListener('click', () => {
  tabBtnVisualizer.classList.add('active');
  tabBtnCourse.classList.remove('active');
  tabVisualizer.classList.add('active');
  tabCourse.classList.remove('active');
});

tabBtnCourse.addEventListener('click', () => {
  tabBtnCourse.classList.add('active');
  tabBtnVisualizer.classList.remove('active');
  tabCourse.classList.add('active');
  tabVisualizer.classList.remove('active');
});

// PARTIE 1 : VISUALISEUR DE TRI
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

const ALGO_TEXTS = {
  bubble: `• Principe : Il compare deux éléments voisins et les inverse s'ils sont dans le mauvais ordre. Les plus grandes valeurs remontent petit à petit vers la droite.
• Dans quel but ? Obtenir une liste ordonnée du plus petit au plus grand.
• Utilité en Machine Learning : Le tri est fondamental pour ordonner des prédictions. On l'utilise dans l'algorithme des k plus proches voisins (k-NN) pour classer les distances entre données, ou pour filtrer le top N des meilleures recommandations.`,
  selection: `• Principe : Il parcourt la liste pour trouver la plus petite valeur, puis l'échange avec la première position non triée.
• Dans quel but ? Trier une liste en minimisant le nombre d'échanges en mémoire.
• Utilité en Machine Learning : Ce principe de recherche du « meilleur élément » est similaire à la sélection de variables (Feature Selection). On sélectionne la variable la plus explicative d'un modèle, puis la deuxième, et ainsi de suite.`
};

function updateAlgoDescription() {
  algoDescription.textContent = ALGO_TEXTS[selectAlgo.value];
}

const sleep = () => {
  const delay = 510 - parseInt(speedInput.value, 10);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

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

function resetBarColors() {
  const bars = document.querySelectorAll('.bar');
  bars.forEach(bar => bar.className = 'bar');
}

function setUIState(sorting) {
  isSorting = sorting;
  btnGenerate.disabled = sorting;
  btnStart.disabled = sorting;
  selectAlgo.disabled = sorting;
  btnStop.disabled = !sorting;
}

function stopSorting() {
  if (isSorting) {
    stopRequested = true;
    liveExplanation.textContent = "Interruption en cours...";
  }
}

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

btnGenerate.addEventListener('click', generateArray);
btnStart.addEventListener('click', startSorting);
btnStop.addEventListener('click', stopSorting);
selectAlgo.addEventListener('change', updateAlgoDescription);

updateAlgoDescription();
generateArray();

// PARTIE 2 : DEMONSTRATION INTERACTIVE K-NN
const knnKInput = document.getElementById('knn-k');
const knnKVal = document.getElementById('knn-k-val');
const knnList = document.getElementById('knn-list');
const knnResult = document.getElementById('knn-result');

// Données fictives : distance et classe (Rouge ou Bleu)
const knnData = [
  { distance: 1.2, category: 'Classe Bleue' },
  { distance: 2.5, category: 'Classe Rouge' },
  { distance: 0.8, category: 'Classe Bleue' },
  { distance: 3.1, category: 'Classe Rouge' },
  { distance: 1.9, category: 'Classe Bleue' },
  { distance: 4.0, category: 'Classe Rouge' },
  { distance: 2.1, category: 'Classe Rouge' }
];

function updateKnnDemo() {
  const k = parseInt(knnKInput.value, 10);
  knnKVal.textContent = k;

  // Tri automatique des données selon la distance (concept de tri k-NN)
  const sortedData = [...knnData].sort((a, b) => a.distance - b.distance);

  knnList.innerHTML = '';
  let blueCount = 0;
  let redCount = 0;

  sortedData.forEach((item, index) => {
    const isSelected = index < k;
    const itemEl = document.createElement('div');
    itemEl.className = `knn-item ${isSelected ? 'selected' : ''}`;
    itemEl.textContent = `d = ${item.distance} (${item.category})`;
    knnList.appendChild(itemEl);

    if (isSelected) {
      if (item.category === 'Classe Bleue') blueCount++;
      else redCount++;
    }
  });

  const winner = blueCount > redCount ? 'Classe Bleue' : 'Classe Rouge';
  knnResult.textContent = `Décision k-NN (k = ${k}) : Prédiction = ${winner} (${blueCount} Bleus vs ${redCount} Rouges parmi les k voisins).`;
}

knnKInput.addEventListener('input', updateKnnDemo);
updateKnnDemo();

// PARTIE 3 : QUIZ INTERACTIF
const quizOptions = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');

quizOptions.addEventListener('click', (e) => {
  if (e.target.classList.contains('quiz-opt')) {
    const isCorrect = e.target.getAttribute('data-correct') === 'true';
    if (isCorrect) {
      quizFeedback.textContent = "Correct ! Le tri permet de réordonner les distances de la plus petite à la plus grande pour sélectionner les k plus petits éléments.";
      quizFeedback.style.color = "#10b981";
    } else {
      quizFeedback.textContent = "Incorrect. Réessayez ! Indice : l'algorithme doit isoler les plus petites distances.";
      quizFeedback.style.color = "#ef4444";
    }
  }
});