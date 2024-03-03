import { domElements } from './domElements';
import { variables as gameVariables } from './variables';
let { xp, health, gold, currentWeapon, fighting, monsterHealth, inventory } = gameVariables;

interface Weapon {
  name: string;
  power: number;
}

const weapons:Weapon[] = [
  { name: 'stick', power: 5 },
  { name: 'dagger', power: 30 },
  { name: 'claw hammer', power: 50 },
  { name: 'sword', power: 100 },
];

interface Monster {
  name: string;
  level: number;
  health: number;
}

const monsters:Monster[] = [
  {
    name: 'slime',
    level: 2,
    health: 15,
  },
  {
    name: 'fanged beast',
    level: 8,
    health: 60,
  },
  {
    name: 'dragon',
    level: 20,
    health: 300,
  },
];
interface Locations {
  name: string;
  'button text': string[];
  'button functions': (() => void)[];
   text: string;
}

const locations: Locations[] = [
  {
    name: 'town square',
    'button text': ['Go to store', 'Go to cave', 'Fight dragon'],
    'button functions': [goStore, goCave, fightDragon],
    text: 'You are in the town square. You see a sign that says "Store".',
  },
  {
    name: 'store',
    'button text': [
      'Buy 10 health (10 gold)',
      'Buy weapon (30 gold)',
      'Go to town square',
    ],
    'button functions': [buyHealth, buyWeapon, goTown],
    text: 'You enter the store.',
  },
  {
    name: 'cave',
    'button text': ['Fight slime', 'Fight fanged beast', 'Go to town square'],
    'button functions': [fightSlime, fightBeast, goTown],
    text: 'You enter the cave. You see some monsters.',
  },
  {
    name: 'fight',
    'button text': ['Attack', 'Dodge', 'Run'],
    'button functions': [attack, dodge, goTown],
    text: 'You are fighting a monster.',
  },
  {
    name: 'kill monster',
    'button text': [
      'Go to town square',
      'Go to town square',
      'Go to town square',
    ],
    'button functions': [goTown, goTown, easterEgg],
    text: 'The monster screams "Arg!" as it dies. You gain experience points and find gold.',
  },
  {
    name: 'lose',
    'button text': ['REPLAY?', 'REPLAY?', 'REPLAY?'],
    'button functions': [restart, restart, restart],
    text: 'You die. &#x2620;',
  },
  {
    name: 'win',
    'button text': ['REPLAY?', 'REPLAY?', 'REPLAY?'],
    'button functions': [restart, restart, restart],
    text: 'You defeat the dragon! YOU WIN THE GAME! &#x1F389;',
  },
  {
    name: 'easter egg',
    'button text': ['2', '8', 'Go to town square?'],
    'button functions': [pickTwo, pickEight, goTown],
    text: 'You find a secret game. Pick a number above. Ten numbers will be randomly chosen between 0 and 10. If the number you choose matches one of the random numbers, you win!',
  },
];

// initialize buttons
domElements.button1.onclick = goStore;
domElements.button2.onclick = goCave;
domElements.button3.onclick = fightDragon;

function update(location: Locations) {
  domElements.monsterStats.style.display = 'none';
  domElements.button1.innerText = location['button text'][0];
  domElements.button2.innerText = location['button text'][1];
  domElements.button3.innerText = location['button text'][2];
  domElements.button1.onclick = location['button functions'][0];
  domElements.button2.onclick = location['button functions'][1];
  domElements.button3.onclick = location['button functions'][2];
  domElements.text.innerHTML = location.text;
}

function goTown() {
  update(locations[0]);
}

function goStore() {
  update(locations[1]);
}

function goCave() {
  update(locations[2]);
}

function buyHealth() {
  if (gold >= 10) {
    gold -= 10;
    health += 10;
    domElements.goldText.innerText = gold.toString();
    domElements.healthText.innerText = health.toString();
  } else {
    domElements.text.innerText = 'You do not have enough gold to buy health.';
  }
}

function buyWeapon() {
  if (currentWeapon < weapons.length - 1) {
    if (gold >= 30) {
      gold -= 30;
      currentWeapon++;
      domElements.goldText.innerText = gold.toString();
      let newWeapon = weapons[currentWeapon].name;
      domElements.text.innerText = 'You now have a ' + newWeapon + '.';
      inventory.push(newWeapon);
      domElements.text.innerText += ' In your inventory you have: ' + inventory;
    } else {
      domElements.text.innerText = 'You do not have enough gold to buy a weapon.';
    }
  } else {
    domElements.text.innerText = 'You already have the most powerful weapon!';
    domElements.button2.innerText = 'Sell weapon for 15 gold';
    domElements.button2.onclick = sellWeapon;
  }
}

function sellWeapon() {
  if (inventory.length > 1) {
    gold += 15;
    domElements.goldText.innerText = gold.toString();
    let currentWeapon = inventory.shift();
    domElements.text.innerText = 'You sold a ' + currentWeapon + '.';
    domElements.text.innerText += ' In your inventory you have: ' + inventory;
  } else {
    domElements.text.innerText = "Don't sell your only weapon!";
  }
}

function fightSlime() {
  fighting = 0;
  goFight();
}

function fightBeast() {
  fighting = 1;
  goFight();
}

function fightDragon() {
  fighting = 2;
  goFight();
}

function goFight() {
  update(locations[3]);
  monsterHealth = monsters[fighting].health;
  domElements.monsterStats.style.display = 'block';
  domElements.monsterName.innerText = monsters[fighting].name;
  domElements.monsterHealthText.innerText = monsterHealth.toString();
}

function attack() {
  domElements.text.innerText = 'The ' + monsters[fighting].name + ' attacks.';
  domElements.text.innerText +=
    ' You attack it with your ' + weapons[currentWeapon].name + '.';
  health -= getMonsterAttackValue(monsters[fighting].level);
  if (isMonsterHit()) {
    monsterHealth -=
      weapons[currentWeapon].power + Math.floor(Math.random() * xp) + 1;
  } else {
    domElements.text.innerText += ' You miss.';
  }
  domElements.healthText.innerText = health.toString();
  domElements.monsterHealthText.innerText = monsterHealth.toString();
  if (health <= 0) {
    lose();
  } else if (monsterHealth <= 0) {
    if (fighting === 2) {
      winGame();
    } else {
      defeatMonster();
    }
  }
  if (Math.random() <= 0.1 && inventory.length !== 1) {
    domElements.text.innerText += ' Your ' + inventory.pop() + ' breaks.';
    currentWeapon--;
  }
}

function getMonsterAttackValue(level: number) {
  const hit = level * 5 - Math.floor(Math.random() * xp);
  console.log(hit);
  return hit > 0 ? hit : 0;
}

function isMonsterHit() {
  return Math.random() > 0.2 || health < 20;
}

function dodge() {
  domElements.text.innerText = 'You dodge the attack from the ' + monsters[fighting].name;
}

function defeatMonster() {
  gold += Math.floor(monsters[fighting].level * 6.7);
  xp += monsters[fighting].level;
  domElements.goldText.innerText = gold.toString();
  domElements.xpText.innerText = xp.toString();
  update(locations[4]);
}

function lose() {
  update(locations[5]);
}

function winGame() {
  update(locations[6]);
}

function restart() {
  xp = 0;
  health = 100;
  gold = 50;
  currentWeapon = 0;
  inventory = ['stick'];
  domElements.goldText.innerText = gold.toString();
  domElements.healthText.innerText = health.toString();
  domElements.xpText.innerText = xp.toString();
  goTown();
}

function easterEgg() {
  update(locations[7]);
}

function pickTwo() {
  pick(2);
}

function pickEight() {
  pick(8);
}

function pick(guess: number) {
  const numbers = [];
  while (numbers.length < 10) {
    numbers.push(Math.floor(Math.random() * 11));
  }
  domElements.text.innerText = 'You picked ' + guess + '. Here are the random numbers:\n';
  for (let i = 0; i < 10; i++) {
    domElements.text.innerText += numbers[i] + '\n';
  }
  if (numbers.includes(guess)) {
    domElements.text.innerText += 'Right! You win 20 gold!';
    gold += 20;
    domElements.goldText.innerText = gold.toString();
  } else {
    domElements.text.innerText += 'Wrong! You lose 10 health!';
    health -= 10;
    domElements.healthText.innerText = health.toString();
    if (health <= 0) {
      lose();
    }
  }
}