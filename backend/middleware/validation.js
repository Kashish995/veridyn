// Task validation
export const validateTask = (req, res, next) => {
  const { title, dueDate, startTime, endTime, priority } = req.body;

  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!dueDate) {
    errors.push('Due date is required');
  }

  if (!startTime) {
    errors.push('Start time is required');
  }

  if (!endTime) {
    errors.push('End time is required');
  }

  if (startTime && endTime && startTime >= endTime) {
    errors.push('End time must be after start time');
  }

  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    errors.push('Priority must be low, medium, or high');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Auth validation
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (name && name.length > 50) {
    errors.push('Name must be less than 50 characters');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};