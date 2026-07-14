const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const storyRoutes = require('./routes/story.routes');
const sprintRoutes = require('./routes/sprint.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: env.nodeEnv });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/sprints', sprintRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
