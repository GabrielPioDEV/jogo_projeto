// Seleciona elementos do DOM e armazena em variáveis
const gameMusic = document.querySelector('#game-music');
const Personagem = document.querySelector('.Personagem');
const tiro = document.querySelector('.tiro');
const tronco = document.querySelector('.tronco');
const aviao = document.querySelector('.aviao');
const gameOver = document.querySelector('.game-over');
const gameOverSound = document.querySelector('#game-over-sound'); 
const restartButton = document.querySelector('.restart');

// Variável para contar quantos inimigos foram atingidos
let enemiesHitCount = 0;

// Variável para controlar o tempo do último disparo
let lastShotTime = 0; 

// Cria e adiciona ao DOM um elemento para exibir a contagem de inimigos eliminados
const enemiesEliminatedDisplay = document.createElement('div');
enemiesEliminatedDisplay.classList.add('enemies-eliminated');
document.body.appendChild(enemiesEliminatedDisplay);

// Função para atualizar a contagem de inimigos eliminados na tela
const updateEnemiesEliminatedDisplay = () => {
  enemiesEliminatedDisplay.textContent = `Abates: ${enemiesHitCount}`;
};

// Função para atualizar a cor da bala baseada na contagem de inimigos eliminados
const updateBulletColor = () => {
  if (enemiesHitCount >= 14) {
    return 'white';
  } else if (enemiesHitCount >= 7) {
    return 'yellow';
  } else {
    return 'red';
  }
};

// Função que faz o personagem pular
const jump = () => {
  Personagem.classList.add('jump');
  setTimeout(() => {
    Personagem.classList.remove('jump');
  }, 500);
};

// Função para disparar uma bala
const shoot = () => {
  const currentTime = Date.now();
  
  // Verifica se se passaram 1.5 segundos desde o último disparo
  if (currentTime - lastShotTime >= 1500) {
    lastShotTime = currentTime; // Atualiza o tempo do último disparo
    
    // Cria uma nova bala e define suas propriedades
    const newtiro = document.createElement('div');
    newtiro.style.position = 'absolute';
    newtiro.style.top = `${Personagem.offsetTop + Personagem.offsetHeight / 2}px`;
    newtiro.style.left = `${Personagem.offsetLeft}px`;
    newtiro.style.width = '10px';
    newtiro.style.height = '10px';
    newtiro.style.background = updateBulletColor();
    newtiro.style.borderRadius = '50%';
    newtiro.style.animation = 'tiro 1s infinite linear';
    newtiro.className = 'tiro';
    document.body.appendChild(newtiro);

    shootSound.currentTime = 0; // Reinicia o tempo do som
    shootSound.play(); // Toca o som da bala

    let tiroPosition = Personagem.offsetLeft;
    const tiroInterval = setInterval(() => {
      tiroPosition += 5;
      newtiro.style.left = `${tiroPosition}px`;

      // Verifica se a bala colidiu com algum inimigo
      const enemies = document.querySelectorAll('.enemy');
      enemies.forEach((enemy) => {
        const enemyRect = enemy.getBoundingClientRect();
        const tiroRect = newtiro.getBoundingClientRect();
        if (
          tiroRect.left < enemyRect.left + enemyRect.width &&
          tiroRect.left + tiroRect.width > enemyRect.left &&
          tiroRect.top < enemyRect.top + enemyRect.height &&
          tiroRect.top + tiroRect.height > enemyRect.top
        ) {
          enemy.remove();
          newtiro.remove();
          clearInterval(tiroInterval);
          enemiesHitCount++;
          updateEnemiesEliminatedDisplay(); // Atualiza a contagem de inimigos eliminados na tela
        }
      });

      // Remove a bala quando ela sai da tela
      if (tiroPosition >= document.body.offsetWidth) {
        clearInterval(tiroInterval);
        newtiro.remove();
      }
    }, 10);
  }
};

// Função para criar inimigos
const createEnemy = () => {
  const enemy = document.createElement('div');
  enemy.className = 'enemy';
  enemy.style.position = 'absolute';
  enemy.style.width = '50px';
  enemy.style.height = '50px';
  enemy.style.top = 'calc(100% - 250px)';
  enemy.style.left = '100%';
  enemy.style.animation = 'enemy-animation 4s linear';

  const enemyImg = document.createElement('img');
  enemyImg.src = 'assets/imgs/enemy.png';
  enemyImg.style.width = '100%';
  enemyImg.style.height = '100%';
  enemyImg.style.objectFit = 'cover';
  enemy.appendChild(enemyImg);

  document.body.appendChild(enemy);

  // Movimento do inimigo para a esquerda até sair da tela
  const enemyInterval = setInterval(() => {
    const enemyPosition = enemy.offsetLeft;
    if (enemyPosition <= -50) {
      enemy.remove();
      clearInterval(enemyInterval);
    } else {
      enemy.style.left = `${enemyPosition - 10}px`;
    }
  }, 50);
};

// Cria inimigos em intervalos regulares
const enemyInterval = setInterval(createEnemy, 2400);

// Função para verificar colisão entre dois retângulos
const isCollision = (rect1, rect2) => {
  return !(
    rect1.top > rect2.bottom ||
    rect1.bottom < rect2.top ||
    rect1.right < rect2.left ||
    rect1.left > rect2.right
  );
};

let gameLoop;

// Função que inicia o loop do jogo
const startGameLoop = () => {
  gameLoop = setInterval(() => {
    const troncoPosition = tronco.offsetLeft;
    const PersonagemPosition = +window.getComputedStyle(Personagem).bottom.replace('px', '');
    const aviaoPosition = +window.getComputedStyle(aviao).left.replace('px', '');

    gameMusic.play();

    // Verifica colisão do personagem com o tronco se enemiesHitCount for menor que 15
    if (enemiesHitCount < 15 && troncoPosition <= 100 && troncoPosition > 0 && PersonagemPosition < 60) {
      tronco.style.animation = 'none';
      tronco.style.left = `${troncoPosition}px`;

      Personagem.style.animation = 'none';
      Personagem.style.bottom = `${PersonagemPosition}px`;

      Personagem.src = 'assets/imgs/game-over.png';
      Personagem.style.width = '70px';
      Personagem.style.marginLeft = '35px';

      aviao.style.animation = 'aviao 20s infinite linear';
      aviao.style.left = `${aviaoPosition}px`;

      gameOver.style.visibility = 'visible';
      clearInterval(gameLoop);
      gameMusic.pause();
      // Reproduz o som de game over
      gameOverSound.play(); // Adicionado a reprodução do som de game over
    }

    const PersonagemRect = Personagem.getBoundingClientRect();
    const enemies = document.querySelectorAll('.enemy');
    enemies.forEach((enemy) => {
      const enemyRect = enemy.getBoundingClientRect();
      if (isCollision(PersonagemRect, enemyRect)) {
        tronco.style.animation = 'none';
        tronco.style.left = `${troncoPosition}px`;

        Personagem.style.animation = 'none';
        Personagem.style.bottom = `${PersonagemPosition}px`;

        Personagem.src = 'assets/imgs/game-over.png';
        Personagem.style.width = '70px';
        Personagem.style.marginLeft = '35px';

        aviao.style.animation = 'aviao 20s infinite linear';
        aviao.style.left = `${aviaoPosition}px`;

        gameOverSound.play(); // Adicionado a reprodução do som de game over
        gameOver.style.visibility = 'visible';

        clearInterval(gameLoop);
      }
    });
  }, 10);
};

// Função para reiniciar o jogo
const restart = () => {
  gameMusic.play();
  gameOver.style.visibility = 'hidden';

  tronco.style.animation = 'tronco-animations 1.5s infinite linear';
  tronco.style.left = '';

  Personagem.src = 'assets/imgs/Personagem.gif';
  Personagem.style.width = '190px';
  Personagem.style.bottom = '0px';
  Personagem.style.marginLeft = '';
  Personagem.style.animation = '';

  aviao.style.left = '';

  enemiesHitCount = 0;
  updateEnemiesEliminatedDisplay();

  const enemies = document.querySelectorAll('.enemy');
  enemies.forEach((enemy) => enemy.remove());

  startGameLoop();
};

// Adiciona eventos de teclado para pulo e disparo
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    shoot();
  } else if (event.key === 'ArrowUp') {
    jump();
  }
});

// Adiciona eventos de toque para dispositivos móveis para pulo e disparo
document.addEventListener('touchstart', (event) => {
  if (event.target === Personagem) {
    if (event.touches.length === 1) {
      shoot();
    } else if (event.touches.length === 2) {
      jump();
    }
  }
});

// Adiciona evento para reiniciar o jogo ao clicar no botão de reinício
restartButton.addEventListener('click', restart);
