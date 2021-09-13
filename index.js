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
    setTimeout(function() {
        deck.click(() => {});
        if (playerScore <= 21 && (playerScore > dealerScore || dealerScore > 21)) {
            playerWon();
        }
        else {
            playerLost();
        }
        $('#round-over').css('z-index', getTopZIndex());
    }, 1000 * dealerResult.timeout);
}

function playDealer() {
    let tempHand = combineDealerHands();
    let score = calculateScore(tempHand);
    let originalHandEndIndex = tempHand.length;
    let tempScores = [];
    let i = 0;
    while (score < 17) {
        drawCard(i); //pass i so function has the value, instead of the variable.
        i++;
    }
    //Update score display when dealer's score is already >17.
    if (tempHand.length == originalHandEndIndex) {
        $('#dealer-score-display').text(score);
    }
    return { score: score, timeout: i + 1 }

    function drawCard(index) {
        tempHand.addCard(deck.topCard());
        score = calculateScore(tempHand);
        tempScores.push(score);
        setDisplayUpdateTime(index);
    }
    
    //setTimeout does not stop the program from executing, so to display 
    //things at human speed we need to store the values at each step and
    //display them later.
    function setDisplayUpdateTime(index) {
        setTimeout(function() {
            //using the addCard function removes the card from the other hand, 
            //and downshifts its remaining cards, so we can use the same index
            //each time.
            faceDownDealerHand.addCard(tempHand[originalHandEndIndex]);
            faceDownDealerHand.render();
            $('#dealer-score-display').text(tempScores[index]);
        }, 1000 * (index + 1)); //index starts at 0 so we add 1
    }
}

function calculateDealerScore() {
    return calculateScore(combineDealerHands());
}

function combineDealerHands() {
    combinedHand = new cards.Hand();
    let i = 0;
    combinedHand[i] = faceUpDealerHand[i]; //faceUpDealerHand always has just 1 card.
    i++;
    for (let j = 0; j < faceDownDealerHand.length; j++) {
        combinedHand[i] = faceDownDealerHand[j];
        i++;
    }
    combinedHand["length"] = i;
    return combinedHand;
}

function decidePlayerHitResult() {
    let score = calculateScore(playerhand);
    $('#player-score-display').text(score);
    if (score > 21) {
        playerLost();
        $('#round-over').css('z-index', getTopZIndex());
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

function getTopZIndex() {
    return cards.getZIndexCounter() + 1;
}

function playerLost() {
    faceDownDealerHand.faceUp = true;
    faceDownDealerHand.render();
    $('#game-result').text('You Lost').css('color', 'red');
    $('#dealer-score-display').text(calculateDealerScore());
    dealerWinCount++;
    $('#dealer-win-count').text(dealerWinCount);
}

function playerWon() {
    playerWinCount++;
    $('#player-win-count').text(playerWinCount);
    $('#game-result').text('You Won').css('color', 'blue');
}