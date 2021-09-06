//Make the deck appear centered and face down.
cards.init({table:'#card-table', type:STANDARD});
let deck;
let playerhand;
let faceUpDealerHand;
const DEALER_DECK_Y = 60;
const DEALER_DECK_X = 255;
startGame();

function startGame() {
    deck = new cards.Deck();
    cards.shuffle(deck);
    deck.addCards(cards.all);
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
        decideResult(playerhand);
    });

    deck.deal(1, [faceUpDealerHand, faceDownDealerHand], 50);

    deck.click(card => {
        playerhand.addCard(card);
        playerhand.render();
        decideResult(playerhand);
    });
}

$('#reset').click(() => {
    $('#game-over').hide();
    startGame();
});

$('#done').click(() => {
    faceDownDealerHand.faceUp = true;
    faceDownDealerHand.render();
    determineGameOutcome();
});

function determineGameOutcome() {
    let dealerScore = calculateDealerScore();

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
    let k = 1;
    while (score < 17) {
        score += deck.topCard().rank;
        setTimeout(function() {
            faceDownDealerHand.addCard(deck.topCard());
            faceDownDealerHand.render();
            $('#dealer-score-display').text(score);
        }, 1000 * k);
        k++;
    }
    return score;
}

function decideResult(hand) {
    let score = calculateScore(hand);
    console.log(score);
    if (hand === playerhand) {
        $('#player-score-display').text(score);
        if (score > 21) {
            gameOver();
        }
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

function gameOver() {
    $('#game-over').show();
    faceDownDealerHand.faceUp = true;
    faceDownDealerHand.render();
    deck.click(() => {});
    $('#dealer-score-display').text(calculateDealerScore(faceUpDealerHand));
}