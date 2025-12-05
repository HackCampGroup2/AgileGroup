<?php
require_once('Models/UserAuthentication.php');

$view = new stdClass();
$view->user = new User();

require_once('Views/survey_thankyou.phtml');
