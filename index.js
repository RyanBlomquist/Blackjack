//Make the deck appear centered and face down.
let deck;
let playerhand;
let dealerhand;
startGame();

function startGame() {
    cards.init({table:'#card-table', type:STANDARD});
    deck = new cards.Deck();
    deck.addCards(cards.all);
    deck.render({immediate:true});
    dealerhand = new cards.Hand({faceUp:false, y:60});
    playerhand = new cards.Hand({faceUp:true, y:340});

    deck.deal(2, [dealerhand, playerhand], 50, () => {
        console.log("dealer hand");
        calculateScore(dealerhand);
        console.log("player hand");
        calculateScore(playerhand);
    });

    deck.click(card => {
        if (card === deck.topCard()){
            drawCard(playerhand);
        }
    });
}

$('#reset').click(() => {
    $('#game-over').hide();
    startGame();
});

function drawCard(hand) {
    hand.addCard(deck.topCard());
    hand.render();
    calculateResult(hand);
}

function calculateResult(hand) {
    let score = calculateScore(hand);
    if (score > 21 && hand == playerhand) {
        gameOver();
    }
}

function calculateScore(hand) {
    let score = 0;
    let aceCount = 0
    for (let i = 0; i < hand.length; i++) {
        setScore(i);
    }
    if (score > 21 && aceCount > 0) {
        setAceValues();
    }
    $('#player-score-display').text(score);
    return score;

    function setScore(i) {
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

    function setAceValues() {
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
    deck.click(() => {});
}