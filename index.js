//Make the deck appear centered and face down.
cards.init({table:'#card-table', type:STANDARD});
let deck;
let playerhand;
let faceUpDealerHand;
let playerWinCount = 0;
let dealerWinCount = 0;
const DEALER_DECK_Y = 60;
const DEALER_DECK_X = 255;
startGame();

function startGame() {
    deck = new cards.Deck();
    deck.addCards(cards.all);
    cards.shuffle(deck);
    deck.render({immediate:true});
    faceUpDealerHand = new cards.Hand({
        faceUp:true
        , y: DEALER_DECK_Y
        , x: DEALER_DECK_X
    });
    faceDownDealerHand = new cards.Hand({faceUp: false
        , y: DEALER_DECK_Y
        , x: DEALER_DECK_X + 80
    });
    playerhand = new cards.Hand({faceUp:true, y:340});

    deck.deal(2, [playerhand], 50, () => {
        decidePlayerHitResult();
    });

    deck.deal(1, [faceUpDealerHand, faceDownDealerHand], 50);

    deck.click(card => {
        playerhand.addCard(card);
        playerhand.render();
        decidePlayerHitResult();
    });
}

$('#next-round').click(() => {
    $('#dealer-score-display').text('');
    $('#round-over').css('z-index', 0);
    startGame();
});

$('#reset').click(() => {
    $('#game-over').hide();
    playerWinCount = 0;
    dealerWinCount = 0;
    $('#dealer-win-count').text(dealerWinCount);
    $('#player-win-count').text(playerWinCount);
    startGame();
});

$('#done').click(() => {
    faceDownDealerHand.faceUp = true;
    faceDownDealerHand.render();
    playerDone();
});

function playerDone() {
    let dealerResult = playDealer();
    let dealerScore = dealerResult.score;
    let playerScore = calculateScore(playerhand);
    if (playerScore <= 21 && (playerScore > dealerScore || dealerScore > 21)) {
        playerWon();
    }
    else {
        playerLost();
    }
    setTimeout(function() {
        $('#round-over').css('z-index', 1000);
    }, 1000 * dealerResult.timeout);
}

function playDealer() {
    score = calculateDealerScore();
    let tempHand = new cards.Hand();
    let tempScores = [];
    while (score < 17) {
        score += deck.topCard().rank;
        tempHand.addCard(deck.topCard());
        tempScores.push(score);
    }
    let j = 0;
    for (let i = 0; i < tempHand.length; i++) {
        setTimeout(function() {
            faceDownDealerHand.addCard(tempHand[0]);
            faceDownDealerHand.render();
            $('#dealer-score-display').text(tempScores[i]);
        }, 1000 * (i + 1));
        j = i + 1;
    }
    if (tempHand.length == 0) {
        $('#dealer-score-display').text(score);
    }
    return { score: score, timeout: j }
}

function calculateDealerScore() {
    tempHand = new cards.Hand();
    let i = 0;
    tempHand[i] = faceUpDealerHand[i];
    i++;
    for (let j = 0; j < faceDownDealerHand.length; j++) {
        tempHand[i] = faceDownDealerHand[j];
        i++;
    }
    tempHand["length"] = i;
    let score = calculateScore(tempHand);
    return score;
}

function decidePlayerHitResult() {
    let score = calculateScore(playerhand);
    $('#player-score-display').text(score);
    if (score > 21) {
        playerLost();
        $('#round-over').css('z-index', 1000);
    }
}

function calculateScore(hand) {
    let score = 0;
    let aceCount = 0
    for (let i = 0; i < hand.length; i++) {
        scoreCards(i);
    }
    if (score > 21 && aceCount > 0) {
        rescoreAces();
    }
    return score;

    function scoreCards(i) {
        let cardValue = hand[i].rank;
        if (cardValue > 10) {
            score += 10;
        }
        else if (cardValue == 1){
            aceCount++;
            score += 11;
        } 
        else {
            score += cardValue;
        }
    }

    function rescoreAces() {
        let i = 0;
        while (score > 21 && i < aceCount) {
            //aces were originally treated as 11, so subtracting 10 treats them as 1
            score -= 10; 
            i++;
        }
    }
}

function playerLost() {
    faceDownDealerHand.faceUp = true;
    faceDownDealerHand.render();
    deck.click(() => {});
    $('#game-result').text('You Lost').css('color', 'red');
    $('#dealer-score-display').text(calculateDealerScore());
    dealerWinCount++;
    $('#dealer-win-count').text(dealerWinCount);
}

function playerWon() {
    playerWinCount++;
    $('#player-win-count').text(playerWinCount);
    $('#game-result').text('You Won').css('color', 'blue');
    deck.click(() => {});
}