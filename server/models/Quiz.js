const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title for the quiz.'],
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, 
        },
        questions: {
            type: [{ 
                questionText: {
                    type: String,
                    required: [true, 'Question text cannot be empty.'],
                },
                timeLimit: {
                    type: Number,
                    default: 20,
                    min: 5,    
                    max: 120,  
                },
                options: {
                    type: [{
                        text: {
                            type: String,
                            required: [true, 'Option text cannot be empty.'],
                        },
                        isCorrect: {
                            type: Boolean,
                            default: false,
                        },
                    }],
                    validate: [(val) => val.length >= 2, 'Each question must have at least two options.'],
                }
            }],
            validate: [(val) => val.length > 0, 'A quiz must have at least one question.'],
        },
    },
    { timestamps: true }
);
quizSchema.pre('save', function(next) {
    this.questions.forEach((question, index) => {
        const correctOptionsCount = question.options.filter(option => option.isCorrect).length;
        if (correctOptionsCount === 0) {
            next(new Error(`Question #${index + 1} must have a correct answer.`));
        }
    });
    next();
});

module.exports = mongoose.model('Quiz', quizSchema);