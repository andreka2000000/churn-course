package models

import "time"

// User — студент курса
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;size:255;not null" json:"email"`
	Username     string    `gorm:"size:100;not null" json:"username"`
	PasswordHash string    `gorm:"not null" json:"-"`
	CreatedAt    time.Time `json:"created_at"`

	Submissions []Submission `gorm:"foreignKey:UserID" json:"-"`
	Progress    []Progress   `gorm:"foreignKey:UserID" json:"-"`
}

// Module — модуль курса (1-4)
type Module struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Title       string `gorm:"size:255;not null" json:"title"`
	Description string `gorm:"type:text" json:"description"`
	Order       int    `gorm:"not null" json:"order"`

	Lessons []Lesson `gorm:"foreignKey:ModuleID" json:"lessons,omitempty"`
}

// Lesson — урок внутри модуля
type Lesson struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	ModuleID    uint   `gorm:"not null;index" json:"module_id"`
	Title       string `gorm:"size:255;not null" json:"title"`
	Order       int    `gorm:"not null" json:"order"`
	TheoryMD    string `gorm:"type:text" json:"theory_md"`
	StarterCode string `gorm:"type:text" json:"starter_code"`

	Task Task `gorm:"foreignKey:LessonID" json:"task"`
}

// Task — задание для урока
type Task struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	LessonID    uint   `gorm:"uniqueIndex;not null" json:"lesson_id"`
	Description string `gorm:"type:text;not null" json:"description"`
	Hint        string `gorm:"type:text" json:"hint,omitempty"`
	CheckScript string `gorm:"type:text" json:"-"`
	MaxScore    int    `gorm:"default:10" json:"max_score"`
}

// Submission — попытка решения
type Submission struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	TaskID    uint      `gorm:"not null;index" json:"task_id"`
	Code      string    `gorm:"type:text" json:"code"`
	Passed    bool      `json:"passed"`
	Score     int       `json:"score"`
	Output    string    `gorm:"type:text" json:"output"`
	CreatedAt time.Time `json:"created_at"`
}

// Progress — прогресс пользователя по уроку
type Progress struct {
	UserID    uint      `gorm:"primaryKey" json:"user_id"`
	LessonID  uint      `gorm:"primaryKey" json:"lesson_id"`
	Completed bool      `gorm:"default:false" json:"completed"`
	Score     int       `gorm:"default:0" json:"score"`
	UpdatedAt time.Time `json:"updated_at"`
}
