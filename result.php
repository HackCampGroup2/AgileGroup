<?php
require_once('Models/UserAuthentication.php');

$view = new stdClass();
$view->user = new User();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Only allow logged-in users
if (!$view->user->isLoggedIn()) {
    header('Location: index.php');
    exit;
}


$view->goal          = 'Buy a Home';
$view->retirementAge = 65;
$view->targetAmount  = 60000;
$view->finalPot      = 42000;

// Calculate percentage reached
$view->scorePercent = $view->targetAmount > 0
    ? (int) round(($view->finalPot / $view->targetAmount) * 100)
    : 0;

// Simple feedback
if ($view->scorePercent >= 100) {
    $view->resultMessage = "Excellent! You reached or exceeded your financial goal.";
} elseif ($view->scorePercent >= 70) {
    $view->resultMessage = "Strong financial progress — you're close to your goal.";
} elseif ($view->scorePercent >= 40) {
    $view->resultMessage = "Decent progress, but you fell short of your target.";
} else {
    $view->resultMessage = "Your decisions left you far from the goal. Earlier, consistent investing would help.";
}

// Load view
require_once('Views/result.phtml');
