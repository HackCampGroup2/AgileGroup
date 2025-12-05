<?php
/**
 * Survey class
 * Handles survey questions from JSON file
 */
class Survey
{
    protected $questions;
    protected $surveyData;
    protected $error;

    public function __construct()
    {
        $this->questions = [];
        $this->surveyData = [];
        $this->error = '';

        // Load survey questions from JSON file in root directory
        $jsonFile = 'survey_questions.json';

        if (!file_exists($jsonFile)) {
            $this->error = "Survey data file not found.";
            // Create default questions as fallback
            $this->createDefaultQuestions();
            return;
        }

        $jsonContent = file_get_contents($jsonFile);
        if ($jsonContent === false) {
            $this->error = "Unable to read survey data file.";
            $this->createDefaultQuestions();
            return;
        }

        $this->surveyData = json_decode($jsonContent, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error = "Invalid JSON format in survey data file.";
            $this->createDefaultQuestions();
            return;
        }

        if (isset($this->surveyData['questions']) && is_array($this->surveyData['questions'])) {
            $this->questions = $this->surveyData['questions'];
        } else {
            $this->questions = [];
        }

        if (empty($this->questions)) {
            $this->error = "No questions found in survey data.";
            $this->createDefaultQuestions();
        }
    }

    /**
     * Create default questions if JSON file is missing or invalid
     */
    private function createDefaultQuestions()
    {
        $this->surveyData = [
            'title' => 'Investment Knowledge Survey',
            'description' => 'Assess your current experience and knowledge about investing'
        ];

        $this->questions = [
            [
                'id' => 1,
                'question' => 'How familiar are you with investing?',
                'type' => 'radio',
                'options' => ['Beginner', 'Some knowledge', 'Experienced']
            ],
            [
                'id' => 2,
                'question' => 'Have you ever invested money before?',
                'type' => 'radio',
                'options' => ['Yes', 'No']
            ]
        ];
    }

    /**
     * Get all survey questions
     */
    public function getAllQuestions()
    {
        return $this->questions;
    }

    /**
     * Get a specific question by ID
     */
    public function getQuestion($id)
    {
        foreach ($this->questions as $question) {
            if (isset($question['id']) && $question['id'] == $id) {
                return $question;
            }
        }
        return null;
    }

    /**
     * Get total number of questions
     */
    public function getTotalQuestions()
    {
        return count($this->questions);
    }

    /**
     * Get survey title and description
     */
    public function getSurveyInfo()
    {
        // Use ternary operator or isset() instead of ??
        $title = isset($this->surveyData['title']) ? $this->surveyData['title'] : 'Investment Knowledge Survey';
        $description = isset($this->surveyData['description']) ? $this->surveyData['description'] : 'Assess your investment knowledge';

        return [
            'title' => $title,
            'description' => $description
        ];
    }

    /**
     * Get any error messages
     */
    public function getError()
    {
        return $this->error;
    }
}