<?php
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['game'])) {
    $_SESSION['game'] = initializeGame();
}

if (!isset($_SESSION['leaderboard'])) {
    $_SESSION['leaderboard'] = [];
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'rollDice':
        if ($_SESSION['game']['rollCount'] < 3) {
            foreach ($_SESSION['game']['dice'] as &$die) {
                if (!$die['selected']) {
                    $die['value'] = rand(1, 6);
                }
            }
            $_SESSION['game']['rollCount']++;
        }
        break;

    case 'selectDie':
        $index = $_POST['index'];
        if (isset($_SESSION['game']['dice'][$index])) {
            $_SESSION['game']['dice'][$index]['selected'] = !$_SESSION['game']['dice'][$index]['selected'];
        }
        break;

    case 'selectCategory':
        $category = $_POST['category'];
        if (is_null($_SESSION['game']['scoreCategories'][$category]['score'])) {
            $_SESSION['game']['scoreCategories'][$category]['score'] = calculateScore($category);
            $_SESSION['game']['totalScore'] += $_SESSION['game']['scoreCategories'][$category]['score'];
            $_SESSION['game']['rollCount'] = 0;
            $_SESSION['game']['dice'] = initializeDice();
        }
        break;

    case 'resetGame':
        $_SESSION['game'] = initializeGame();
        break;

    case 'getLeaderboard':
        echo json_encode(['leaderboard' => $_SESSION['leaderboard']]);
        exit;

    case 'saveScore':
        $name = $_POST['name'];
        $score = $_SESSION['game']['totalScore'];
        $_SESSION['leaderboard'][] = ['name' => $name, 'score' => $score];
        usort($_SESSION['leaderboard'], function ($a, $b) {
            return $b['score'] - $a['score'];
        });
        $_SESSION['leaderboard'] = array_slice($_SESSION['leaderboard'], 0, 10);
        $_SESSION['game'] = initializeGame();
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
        exit;
}

echo json_encode($_SESSION['game']);

function initializeGame() {
    return [
        'dice' => initializeDice(),
        'rollCount' => 0,
        'scoreCategories' => array_fill_keys([
            'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
            'Three of a kind', 'Four of a kind', 'Full House',
            'Small Straight', 'Large Straight', 'Yatzy', 'Chance'
        ], ['score' => null]),
        'totalScore' => 0
    ];
}

function initializeDice() {
    return array_fill(0, 5, ['value' => 1, 'selected' => false]);
}

function calculateScore($category) {
    $dice = $_SESSION['game']['dice'];
    $counts = array_count_values(array_column($dice, 'value')) + [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0, 6 => 0];
    switch ($category) {
        case 'Ones': return $counts[1] * 1;
        case 'Twos': return $counts[2] * 2;
        case 'Threes': return $counts[3] * 3;
        case 'Fours': return $counts[4] * 4;
        case 'Fives': return $counts[5] * 5;
        case 'Sixes': return $counts[6] * 6;
        case 'Three of a kind': return max($counts) >= 3 ? array_sum(array_column($dice, 'value')) : 0;
        case 'Four of a kind': return max($counts) >= 4 ? array_sum(array_column($dice, 'value')) : 0;
        case 'Full House': return in_array(3, $counts) && in_array(2, $counts) ? 25 : 0;
        case 'Small Straight': return (isset($counts[1], $counts[2], $counts[3], $counts[4]) || isset($counts[2], $counts[3], $counts[4], $counts[5]) || isset($counts[3], $counts[4], $counts[5], $counts[6])) ? 30 : 0;
        case 'Large Straight': return (isset($counts[1], $counts[2], $counts[3], $counts[4], $counts[5]) || isset($counts[2], $counts[3], $counts[4], $counts[5], $counts[6])) ? 40 : 0;
        case 'Yatzy': return max($counts) === 5 ? 50 : 0;
        case 'Chance': return array_sum(array_column($dice, 'value'));
        default: return 0;
    }
}
?>