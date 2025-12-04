<?php
require_once('Models/Database.php');

$_dbInstance = Database::getInstance();
$_dbHandle = $_dbInstance->getdbConnection();

$statement = $_dbHandle->query("SELECT id, password_hash FROM users");
$users = $statement->fetchAll(PDO::FETCH_ASSOC);

foreach ($users as $user) {
    $id = $user["id"];
    $plainPassword = $user["password_hash"];

    $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

    $update = $_dbHandle->prepare("UPDATE users SET password_hash = :hash WHERE id = :id");
    $update->bindParam(":hash", $hashedPassword);
    $update->bindParam(":id", $id);
    $update->execute();
}

echo "All passwords have been hashed successfully!.";
