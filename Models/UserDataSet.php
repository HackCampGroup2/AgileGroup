<?php
require_once('Database.php');
require_once('UserData.php');

/**
 * UserDataSet class
 *
 * Handles database operations related to users.
 */
class UserDataSet
{
    // Database connection variables
    protected $_dbHandle, $_dbInstance;

    /**
     * Constructor
     *
     * Connects to the database using the Database singleton.
     */
    public function __construct()
    {
        $this->_dbInstance = Database::getInstance();
        $this->_dbHandle = $this->_dbInstance->getdbConnection();
    }

    /**
     * Fetch all users from the database
     *
     * @return UserData[] Array of UserData objects
     */
    public function fetchAllUsers()
    {
        $sqlQuery = "SELECT * FROM users";
        $statement = $this->_dbHandle->prepare($sqlQuery); //prepare a PDO statement
        $statement->execute();

        $dataSet = [];
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $dataSet[] = new UserData($row);
        }

        return $dataSet;
    }
}