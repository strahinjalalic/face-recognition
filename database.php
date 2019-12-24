<?php
defined("DB_HOST") ? null : define("DB_HOST", "localhost");
defined("DB_USER") ? null : define("DB_USER", "root");
defined("DB_NAME") ? null : define("DB_NAME", "face_recognition");
defined("DB_PASSWORD") ? null : define("DB_PASSWORD", "Levaobala1!");

class Database {
    private $connection;

    function __construct()
    {
        $this->open_db_connection();
    }

    public function open_db_connection() {
        $this->connection = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    }

    public function query($sql) {
        $query = $this->connection->query($sql);
        if(!$query) {
            die("QUERY FAILED!" . $this->connection->error);
        }
        return $query;
    }
}

$database = new Database();

?>